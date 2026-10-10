import { NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'
import { ambilKelas } from '@/lib/kurikulum'
import {
  buatTransaksi,
  orderId,
  MIDTRANS_AKTIF,
  MIDTRANS_CLIENT_KEY,
  DASAR_SNAP_JS,
} from '@/lib/midtrans'

/**
 * POST /api/checkout  { slugKelas }
 * Menyiapkan transaksi Midtrans Snap.
 * Purchase dicatat lebih dulu dengan status 'pending' — webhook yang mengubahnya.
 */
export async function POST(req: Request) {
  let slugKelas: string
  try {
    ;({ slugKelas } = await req.json())
  } catch {
    return NextResponse.json({ pesan: 'Permintaan tidak valid' }, { status: 400 })
  }

  const sb = await klienServer()
  if (!sb) {
    return NextResponse.json(
      { pesan: 'Mode demo: pembayaran belum aktif (env Supabase belum diisi).' },
      { status: 503 },
    )
  }

  const { data: auth } = await sb.auth.getUser()
  if (!auth.user) return NextResponse.json({ butuhLogin: true }, { status: 401 })

  const kelas = ambilKelas(slugKelas)
  if (!kelas) return NextResponse.json({ pesan: 'Kelas tidak ditemukan' }, { status: 404 })

  const { data: kursus } = await sb.from('courses').select('id, judul').eq('slug', slugKelas).maybeSingle()
  if (!kursus) {
    return NextResponse.json(
      { pesan: 'Kelas belum terdaftar di database. Jalankan migrasi dan seed.' },
      { status: 409 },
    )
  }

  // Sudah punya akses? Jangan tagih dua kali.
  const { data: sudah } = await sb.rpc('punya_akses_materi', { p_slug: slugKelas })
  if (sudah === true) {
    return NextResponse.json({ pesan: 'Kamu sudah memiliki kelas ini.' }, { status: 409 })
  }

  const oid = orderId(slugKelas, auth.user.id)
  const { error: errSimpan } = await sb.from('purchases').insert({
    user_id: auth.user.id,
    course_id: kursus.id,
    order_id: oid,
    jumlah: kelas.harga,
    status: 'pending',
  })
  if (errSimpan) return NextResponse.json({ pesan: errSimpan.message }, { status: 500 })

  if (!MIDTRANS_AKTIF) {
    return NextResponse.json({
      aktif: false,
      pesan:
        'Midtrans belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di .env.local.',
    })
  }

  try {
    const trx = await buatTransaksi({
      orderId: oid,
      jumlah: kelas.harga,
      slugKelas,
      namaKelas: kursus.judul ?? kelas.judul,
      email: auth.user.email ?? '',
      nama: auth.user.user_metadata?.full_name ?? auth.user.user_metadata?.name ?? '',
    })
    return NextResponse.json({
      aktif: true,
      token: trx.token,
      clientKey: MIDTRANS_CLIENT_KEY,
      snapUrl: DASAR_SNAP_JS,
    })
  } catch (e) {
    return NextResponse.json(
      { pesan: e instanceof Error ? e.message : 'Gagal membuat transaksi' },
      { status: 502 },
    )
  }
}

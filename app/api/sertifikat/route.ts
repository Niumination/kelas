import { NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'

/** GET /api/sertifikat — daftar sertifikat milik sendiri */
export async function GET() {
  const sb = await klienServer()
  if (!sb) return NextResponse.json({ pesan: 'Mode demo' }, { status: 503 })
  const { data, error } = await sb.rpc('sertifikat_saya')
  if (error) return NextResponse.json({ pesan: error.message }, { status: 500 })
  return NextResponse.json({ sertifikat: data ?? [] })
}

/** POST /api/sertifikat { slugKelas } — terbitkan kalau syarat terpenuhi */
export async function POST(req: Request) {
  const sb = await klienServer()
  if (!sb) return NextResponse.json({ pesan: 'Mode demo: sertifikat belum aktif.' }, { status: 503 })

  let slugKelas: string
  try {
    ;({ slugKelas } = await req.json())
  } catch {
    return NextResponse.json({ pesan: 'Permintaan tidak valid' }, { status: 400 })
  }

  const { data, error } = await sb.rpc('terbitkan_sertifikat', { p_slug: slugKelas })
  if (error) return NextResponse.json({ pesan: error.message }, { status: 422 })

  const baris = Array.isArray(data) ? data[0] : data
  return NextResponse.json({ ok: true, sertifikat: baris })
}

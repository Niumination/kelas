import { NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'
import { buatPdfSertifikat } from '@/lib/sertifikat-pdf.mjs'
import { ambilKelas } from '@/lib/kurikulum'
import { namaTandaTangan } from '@/lib/tata-letak-sertifikat.mjs'

/** GET /api/sertifikat/<nomor> — unduh PDF. Hanya pemiliknya. */
export async function GET(_req: Request, { params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params
  const sb = await klienServer()
  if (!sb) return NextResponse.json({ pesan: 'Mode demo' }, { status: 503 })

  const { data } = await sb.rpc('sertifikat_saya')
  const baris = (data ?? []).find(
    (b: { nomor: string }) => b.nomor.toUpperCase() === decodeURIComponent(nomor).toUpperCase(),
  )

  if (!baris) {
    return NextResponse.json({ pesan: 'Sertifikat tidak ditemukan atau bukan milikmu' }, { status: 404 })
  }

  const kelas = ambilKelas(baris.slug)
  // Kolom `instruktur` bisa berupa satu kalimat bio. Untuk sertifikat kita
  // pakai nama pendek; kalau tidak ada, ambil bagian sebelum tanda "—".
  const namaInstruktur = namaTandaTangan(kelas?.instruktur, kelas?.instrukturSingkat)
  const pdf = buatPdfSertifikat({
    nomor: baris.nomor,
    nama: baris.nama_sertifikat ?? 'Peserta',
    judulKelas: baris.judul_kelas,
    tanggal: new Date(baris.terbit_pada).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    instruktur: namaInstruktur,
    estimasiJam: kelas?.estimasiJam ?? null,
  })

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${baris.nomor}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}

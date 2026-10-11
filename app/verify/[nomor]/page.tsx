import Link from 'next/link'
import { HasilVerifikasi } from '@/components/HasilVerifikasi'

export async function generateMetadata({ params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params
  return { title: `Sertifikat ${nomor}` }
}

export default async function HalamanNomorSertifikat({
  params,
}: {
  params: Promise<{ nomor: string }>
}) {
  const { nomor } = await params
  const bersih = nomor.trim().slice(0, 100)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="mono mb-5 flex items-center gap-2 text-[0.65rem] text-redup">
        <Link href="/verify" className="hover:text-hijau-gelap">Verifikasi sertifikat</Link>
        <span aria-hidden="true">/</span>
        <span className="text-teks">Hasil</span>
      </nav>
      <header className="mb-7">
        <p className="kicker text-hijau">CATATAN PUBLIK</p>
        <h1 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">Pemeriksaan sertifikat</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-redup">Status dan detail penerbitan untuk nomor yang diminta.</p>
      </header>
      <HasilVerifikasi nomor={bersih} />
      <Link href="/verify" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-hijau-gelap hover:text-hijau">
        <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span> Periksa nomor lain
      </Link>
    </div>
  )
}

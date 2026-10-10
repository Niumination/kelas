import Link from 'next/link'
import { HasilVerifikasi } from '@/components/HasilVerifikasi'

export async function generateMetadata({ params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params
  return { title: `Sertifikat ${decodeURIComponent(nomor)}` }
}

export default async function HalamanNomorSertifikat({
  params,
}: {
  params: Promise<{ nomor: string }>
}) {
  const { nomor } = await params
  const bersih = decodeURIComponent(nomor).trim()

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Verifikasi sertifikat</h1>
      <div className="mt-8">
        <HasilVerifikasi nomor={bersih} />
      </div>
      <Link href="/verify" className="mono mt-8 inline-block text-sm text-hijau hover:underline">
        ← Periksa nomor lain
      </Link>
    </div>
  )
}

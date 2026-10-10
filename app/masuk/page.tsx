import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FormMasuk } from '@/components/FormMasuk'
import { SUPABASE_AKTIF } from '@/lib/supabase/konfigurasi'
import { penggunaAktif } from '@/lib/supabase/server'

export const metadata = { title: 'Masuk' }

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string }>
}) {
  const { lanjut } = await searchParams
  const tujuan = lanjut ?? '/dashboard'
  const pengguna = await penggunaAktif()
  if (pengguna) redirect(tujuan)

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-2xl font-bold tracking-tight">Masuk</h1>
      <p className="mt-2 text-sm text-redup">
        Akun dipakai untuk menyimpan progres belajar, mengakses materi berbayar, dan menerbitkan
        sertifikat.
      </p>
      <div className="mt-8">
        <FormMasuk aktif={SUPABASE_AKTIF} lanjut={tujuan} />
      </div>
      <p className="mt-8 text-xs leading-relaxed text-redup">
        Masuk berarti kamu menyetujui bahwa materi gratis dapat dibaca siapa pun, sedangkan materi
        berbayar hanya untuk pembeli. Baca{' '}
        <Link href="/kebijakan" className="text-biru hover:underline">
          kebijakan &amp; refund
        </Link>
        .
      </p>
    </div>
  )
}

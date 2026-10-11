import { redirect, notFound } from 'next/navigation'
import { ambilKelas, pelajaranDatar } from '@/lib/kurikulum'

/** /belajar/<kelas> mengarahkan ke pelajaran pertama dan mempertahankan konfirmasi checkout. */
export default async function IndeksBelajar({
  params,
  searchParams,
}: {
  params: Promise<{ kursus: string }>
  searchParams: Promise<{ bayar?: string }>
}) {
  const [{ kursus }, { bayar }] = await Promise.all([params, searchParams])
  const kelas = ambilKelas(kursus)
  if (!kelas || kelas.status === 'draft') notFound()
  const pertama = pelajaranDatar(kelas)[0]
  if (!pertama) notFound()
  const query = bayar === 'sukses' ? '?bayar=sukses' : ''
  redirect(`/belajar/${kursus}/${pertama.jalur}${query}`)
}

import { redirect, notFound } from 'next/navigation'
import { ambilKelas, pelajaranDatar } from '@/lib/kurikulum'

/** /belajar/<kursus> → lompat ke pelajaran pertama */
export default async function IndeksBelajar({ params }: { params: Promise<{ kursus: string }> }) {
  const { kursus } = await params
  const kelas = ambilKelas(kursus)
  if (!kelas) notFound()
  const pertama = pelajaranDatar(kelas)[0]
  if (!pertama) notFound()
  redirect(`/belajar/${kursus}/${pertama.jalur}`)
}

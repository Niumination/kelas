import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ambilKelas } from '@/lib/kurikulum'
import { penggunaAktif, ambilKuisModul } from '@/lib/supabase/server'
import { FormKuis } from '@/components/FormKuis'
import { TombolBeli } from '@/components/TombolBeli'
import { CatatanDemo } from '@/components/CatatanDemo'
import { rupiah } from '@/lib/format'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kursus: string; modul: string }>
}) {
  const { kursus, modul } = await params
  const kelas = ambilKelas(kursus)
  const meta = kelas?.modul.find((item) => item.slug === modul)
  return { title: meta ? `Kuis — ${meta.judul}` : 'Kuis' }
}

export default async function HalamanKuis({
  params,
}: {
  params: Promise<{ kursus: string; modul: string }>
}) {
  const { kursus, modul } = await params
  const kelas = ambilKelas(kursus)
  if (!kelas || kelas.status === 'draft') notFound()
  const metaModul = kelas.modul.find((item) => item.slug === modul)
  if (!metaModul) notFound()

  const pengguna = await penggunaAktif()

  if (!pengguna) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
        <CatatanDemo ringkas />
        <div className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-12 text-white sm:px-10 sm:py-16">
          <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <nav aria-label="Breadcrumb" className="mono mb-7 flex items-center gap-2 text-[0.63rem] text-white/50">
              <Link href={`/kelas/${kelas.slug}`} className="hover:text-white">{kelas.judul}</Link><span aria-hidden="true">/</span><span>KUIS</span>
            </nav>
            <p className="kicker text-[#d9ed8e]">CEK PEMAHAMAN / MODUL {String(metaModul.urutan).padStart(2, '0')}</p>
            <h1 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">Simpan hasil belajarmu.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">Masuk untuk mengerjakan kuis. Penilaian dilakukan di server, dan hasilnya tersimpan di akunmu.</p>
            <Link href={`/masuk?lanjut=${encodeURIComponent(`/kuis/${kelas.slug}/${metaModul.slug}`)}`} className="button-primary mt-7">Masuk untuk mulai <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    )
  }

  const { kuis, error } = await ambilKuisModul(kursus, modul)
  const butuhAkses = metaModul.akses === 'berbayar'
  const pelajaranPertama = metaModul.pelajaran[0]

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10 lg:px-8">
      <nav aria-label="Breadcrumb" className="mono mb-5 flex flex-wrap items-center gap-2 text-[0.65rem] text-redup">
        <Link href={`/kelas/${kelas.slug}`} className="hover:text-hijau-gelap">{kelas.judul}</Link>
        <span aria-hidden="true">/</span><Link href={pelajaranPertama ? `/belajar/${kelas.slug}/${pelajaranPertama.jalur}` : `/belajar/${kelas.slug}`} className="hover:text-hijau-gelap">{metaModul.judul}</Link>
        <span aria-hidden="true">/</span><span className="text-teks">Kuis</span>
      </nav>

      <header className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="kicker text-[#d9ed8e]">CEK PEMAHAMAN / MODUL {String(metaModul.urutan).padStart(2, '0')}</p>
            <h1 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">{metaModul.judul}</h1>
            <p className="mt-3 text-sm leading-7 text-white/65">{metaModul.ringkasan}</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/[0.055] px-4 py-3">
            <span className="mono block text-[0.58rem] text-white/50">FORMAT</span>
            <span className="mt-1 block text-sm font-semibold">Dinilai di server</span>
          </div>
        </div>
      </header>

      {error ? (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-kuning/20 bg-kuning/5 p-5 sm:p-7">
          <span className="kicker text-kuning">KUIS BELUM TERSEDIA</span>
          <p className="mt-3 text-sm leading-6 text-redup">{error}</p>
          {butuhAkses ? (
            <div className="mt-5 max-w-sm">
              <TombolBeli slugKelas={kelas.slug} lanjut={`/kuis/${kelas.slug}/${metaModul.slug}`} label={`Buka akses premium · ${rupiah(kelas.harga)}`} />
            </div>
          ) : (
            <Link href={pelajaranPertama ? `/belajar/${kelas.slug}/${pelajaranPertama.jalur}` : `/belajar/${kelas.slug}`} className="button-light mt-5">Kembali ke materi <span aria-hidden="true">→</span></Link>
          )}
        </div>
      ) : kuis ? (
        <div className="mx-auto mt-8 max-w-3xl">
          <FormKuis
            slugKelas={kelas.slug}
            quizId={kuis.quizId}
            judul={kuis.judul}
            nilaiLulus={kuis.nilaiLulus}
            soal={kuis.soal}
            aktif
            hrefMateri={pelajaranPertama ? `/belajar/${kelas.slug}/${pelajaranPertama.jalur}` : `/belajar/${kelas.slug}`}
          />
        </div>
      ) : null}
    </div>
  )
}

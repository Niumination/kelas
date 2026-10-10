import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ambilKelas } from '@/lib/kurikulum'
import { penggunaAktif, ambilKuisModul } from '@/lib/supabase/server'
import { FormKuis } from '@/components/FormKuis'
import { TombolBeli } from '@/components/TombolBeli'
import { rupiah } from '@/lib/format'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kursus: string; modul: string }>
}) {
  const { kursus, modul } = await params
  const kelas = ambilKelas(kursus)
  const meta = kelas?.modul.find((m) => m.slug === modul)
  return { title: meta ? `Kuis — ${meta.judul}` : 'Kuis' }
}

export default async function HalamanKuis({
  params,
}: {
  params: Promise<{ kursus: string; modul: string }>
}) {
  const { kursus, modul } = await params
  const kelas = ambilKelas(kursus)
  if (!kelas) notFound()
  const metaModul = kelas.modul.find((m) => m.slug === modul)
  if (!metaModul) notFound()

  const pengguna = await penggunaAktif()

  if (!pengguna) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-xl font-semibold">Masuk dulu</h1>
        <p className="mt-2 text-sm text-redup">
          Kuis dinilai di server dan hasilnya tersimpan di akunmu.
        </p>
        <Link
          href={`/masuk?lanjut=/kuis/${kursus}/${modul}`}
          className="mono mt-6 inline-block rounded-md border border-hijau/50 bg-hijau/15 px-6 py-2.5 text-sm font-semibold text-hijau hover:bg-hijau/25"
        >
          Masuk →
        </Link>
      </div>
    )
  }

  const { kuis, error } = await ambilKuisModul(kursus, modul)
  const butuhAkses = metaModul.akses === 'berbayar'

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <nav className="mono mb-6 text-xs text-redup">
        <Link href={`/belajar/${kelas.slug}`} className="hover:text-hijau">
          {kelas.judul}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-teks">kuis {metaModul.slug}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight">Kuis — {metaModul.judul}</h1>
      <p className="mt-2 text-sm text-redup">{metaModul.ringkasan}</p>

      {error ? (
        <div
          className="mt-8 rounded-lg border p-6"
          style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.06)' }}
        >
          <p className="text-sm text-redup">{error}</p>
          {butuhAkses && (
            <div className="mt-5 max-w-xs">
              <TombolBeli slugKelas={kelas.slug} label={`Buka akses — ${rupiah(kelas.harga)}`} />
            </div>
          )}
        </div>
      ) : kuis ? (
        <div className="mt-8">
          <FormKuis
            slugKelas={kelas.slug}
            modul={metaModul.slug}
            quizId={kuis.quizId}
            judul={kuis.judul}
            nilaiLulus={kuis.nilaiLulus}
            soal={kuis.soal}
            aktif
          />
        </div>
      ) : null}
    </div>
  )
}

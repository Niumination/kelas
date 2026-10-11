import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ambilKelas, hitungModulTuntas } from '@/lib/kurikulum'
import { penggunaAktif, ambilKuisModul, progresKelas, rekapKuis } from '@/lib/supabase/server'
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

  const [{ kuis, error }, progres, ringkasanKuis] = await Promise.all([
    ambilKuisModul(kursus, modul),
    progresKelas(kursus),
    rekapKuis(kursus),
  ])
  const modulTuntas = hitungModulTuntas(
    kelas,
    progres,
    ringkasanKuis.filter((item) => item.lulus === true).map((item) => item.modul),
  ).has(metaModul.slug)
  const kuisLulus = ringkasanKuis.some((item) => item.modul === metaModul.slug && item.lulus === true)
  const pelajaranTersisa = metaModul.pelajaran.filter((item) => !progres.has(item.jalur))
  const pelajaranSelesai = metaModul.pelajaran.length - pelajaranTersisa.length
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

      {!error && (
        <section
          role="status"
          aria-live="polite"
          className={`mx-auto mt-5 max-w-3xl rounded-2xl border p-4 sm:p-5 ${modulTuntas ? 'border-hijau/20 bg-hijau/5' : 'border-tepian bg-panel'}`}
        >
          <div className="flex items-start gap-3">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${modulTuntas ? 'bg-hijau/10 text-hijau-gelap' : 'bg-panel-2 text-redup'}`} aria-hidden="true">
              {modulTuntas ? '✓' : '○'}
            </span>
            <div className="min-w-0">
              <p className={`kicker ${modulTuntas ? 'text-hijau-gelap' : 'text-redup'}`}>
                {modulTuntas ? 'MODUL TUNTAS' : 'PROGRES MODUL'}
              </p>
              <p className="mt-1 text-sm leading-6 text-redup">
                {modulTuntas
                  ? 'Semua pelajaran modul ini selesai dan kuis lulus. Progres modul sudah tercatat di akunmu.'
                  : kuisLulus && pelajaranTersisa.length > 0
                    ? `Kuis sudah lulus. Tandai ${pelajaranTersisa.length} pelajaran yang tersisa sebagai selesai agar modul tuntas.`
                    : pelajaranTersisa.length === 0
                      ? 'Semua pelajaran sudah selesai. Lulus kuis ini untuk menuntaskan modul.'
                      : `Pelajaran selesai: ${pelajaranSelesai}/${metaModul.pelajaran.length}. Selesaikan semuanya dan lulus kuis agar modul tuntas.`}
              </p>
              {pelajaranTersisa.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {pelajaranTersisa.map((pelajaran) => (
                    <li key={pelajaran.jalur}>
                      <Link href={`/belajar/${kelas.slug}/${pelajaran.jalur}`} className="text-xs font-semibold text-hijau-gelap underline decoration-hijau/30 underline-offset-4 hover:decoration-hijau">
                        {pelajaran.judul} →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

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

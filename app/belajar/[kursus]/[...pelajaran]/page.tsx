import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ambilKelas, cariPelajaran, tetangga } from '@/lib/kurikulum'
import { Kurikulum } from '@/components/Kurikulum'
import { MdxIsi } from '@/components/MdxIsi'
import { TombolSelesai } from '@/components/TombolSelesai'
import { TombolBeli } from '@/components/TombolBeli'
import { CatatanDemo } from '@/components/CatatanDemo'
import { penggunaAktif, punyaAkses, progresKelas } from '@/lib/supabase/server'
import { rupiah, durasiMenit } from '@/lib/format'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kursus: string; pelajaran: string[] }>
}) {
  const { kursus, pelajaran } = await params
  const kelas = ambilKelas(kursus)
  const p = kelas ? cariPelajaran(kelas, pelajaran) : null
  return p ? { title: p.judul } : { title: 'Materi tidak ditemukan' }
}

export default async function HalamanPelajaran({
  params,
}: {
  params: Promise<{ kursus: string; pelajaran: string[] }>
}) {
  const { kursus, pelajaran } = await params
  const kelas = ambilKelas(kursus)
  if (!kelas) notFound()
  const materi = cariPelajaran(kelas, pelajaran)
  if (!materi) notFound()

  const pengguna = await penggunaAktif()
  const aksesPenuh = pengguna ? await punyaAkses(kelas.slug) : false
  const progres = pengguna ? await progresKelas(kelas.slug) : new Set<string>()
  const { sebelumnya, berikutnya, indeks, total } = tetangga(kelas, materi)

  const terkunci = materi.akses === 'berbayar' && !aksesPenuh

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <CatatanDemo ringkas />

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        {/* ── Sidebar kurikulum ────────────────────────── */}
        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2">
          <Link href={`/kelas/${kelas.slug}`} className="mono mb-4 block text-sm hover:text-hijau">
            ← {kelas.judul}
          </Link>
          <div className="mono mb-3 text-[0.7rem] uppercase tracking-wider text-redup">
            progres {progres.size}/{total}
          </div>
          <div className="mb-4 h-1 overflow-hidden rounded bg-panel-2">
            <div
              className="h-full bg-hijau transition-all"
              style={{ width: `${total ? (progres.size / total) * 100 : 0}%` }}
            />
          </div>
          <Kurikulum
            kelas={kelas}
            progres={progres}
            modeBaca={aksesPenuh ? 'semua' : 'gratis-saja'}
            slugAktif={materi.jalur}
            ringkas
            tampilkanKuis={Boolean(pengguna)}
          />
        </aside>

        {/* ── Isi materi ───────────────────────────────── */}
        <article className="min-w-0">
          <div className="mono mb-3 flex flex-wrap items-center gap-3 text-xs text-redup">
            <span>
              {indeks + 1} / {total}
            </span>
            <span>·</span>
            <span>{durasiMenit(materi.menit)}</span>
            <span>·</span>
            <span className={materi.akses === 'gratis' ? 'text-hijau' : 'text-kuning'}>
              {materi.akses === 'gratis' ? 'gratis' : 'berbayar'}
            </span>
            {materi.tags.map((t) => (
              <span key={t} className="rounded bg-panel-2 px-1.5 py-0.5">
                #{t}
              </span>
            ))}
          </div>

          {terkunci ? (
            <div
              className="mb-8 rounded-lg border p-5"
              style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.06)' }}
            >
              <div className="mono mb-1 text-xs font-bold uppercase tracking-wider text-kuning">
                materi berbayar — pratinjau
              </div>
              <p className="text-sm text-redup">
                Ini pratinjau singkat. Isi lengkap, kode yang bisa dijalankan, kuis, dan review proyek
                akhir tersedia setelah kamu memiliki akses kelas.
              </p>
              <p className="mt-3 text-sm leading-7 text-redup">{materi.ringkasan}</p>
              <div className="mt-4 max-w-xs">
                <TombolBeli slugKelas={kelas.slug} label={`Buka akses — ${rupiah(kelas.harga)}`} />
              </div>
            </div>
          ) : (
            <MdxIsi sumber={materi.isi} />
          )}

          <div className="mt-14 flex items-center justify-between border-t border-tepian pt-6">
            <TombolSelesai
              slugKelas={kelas.slug}
              jalur={materi.jalur}
              awalSelesai={progres.has(materi.jalur)}
              aktif={Boolean(pengguna) && !terkunci}
            />
          </div>

          <nav className="mt-8 grid gap-3 sm:grid-cols-2">
            {sebelumnya ? (
              <Link
                href={`/belajar/${kelas.slug}/${sebelumnya.jalur}`}
                className="kotak kotak-hover p-4"
              >
                <div className="mono mb-1 text-[0.7rem] text-redup">← sebelumnya</div>
                <div className="text-sm font-medium">{sebelumnya.judul}</div>
              </Link>
            ) : (
              <span />
            )}
            {berikutnya && (
              <Link
                href={`/belajar/${kelas.slug}/${berikutnya.jalur}`}
                className="kotak kotak-hover p-4 sm:text-right"
              >
                <div className="mono mb-1 text-[0.7rem] text-redup">berikutnya →</div>
                <div className="text-sm font-medium">{berikutnya.judul}</div>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  )
}

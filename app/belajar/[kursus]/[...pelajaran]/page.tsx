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
  const materi = kelas ? cariPelajaran(kelas, pelajaran) : null
  return materi ? { title: materi.judul } : { title: 'Materi tidak ditemukan' }
}

function IsiKurikulum({
  kelas,
  progres,
  aksesPenuh,
  materiAktif,
  tampilkanKuis,
}: {
  kelas: NonNullable<ReturnType<typeof ambilKelas>>
  progres: Set<string>
  aksesPenuh: boolean
  materiAktif: string
  tampilkanKuis: boolean
}) {
  const totalBisaDibaca = aksesPenuh ? kelas.jumlahPelajaran : kelas.jumlahGratis
  const selesaiTerlihat = Math.min(progres.size, totalBisaDibaca)
  const persen = totalBisaDibaca ? Math.round((selesaiTerlihat / totalBisaDibaca) * 100) : 0

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="kicker text-redup">PROGRES KELAS</span>
          <p className="mono mt-1 text-xs font-semibold">{selesaiTerlihat} <span className="text-redup">/ {totalBisaDibaca} selesai</span></p>
        </div>
        <span className="mono text-xs text-hijau-gelap">{persen}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-label="Progres kelas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={persen}>
        <div className="h-full rounded-full bg-hijau transition-all" style={{ width: `${persen}%` }} />
      </div>
      {!aksesPenuh && (
        <p className="mono mt-2 text-[0.58rem] leading-5 text-redup">Progres menampilkan fondasi gratis. Materi premium tetap terkunci hingga akses diberikan.</p>
      )}
      <div className="mt-4">
        <Kurikulum
          kelas={kelas}
          progres={progres}
          modeBaca={aksesPenuh ? 'semua' : 'gratis-saja'}
          slugAktif={materiAktif}
          ringkas
          tampilkanKuis={tampilkanKuis}
        />
      </div>
    </>
  )
}

export default async function HalamanPelajaran({
  params,
  searchParams,
}: {
  params: Promise<{ kursus: string; pelajaran: string[] }>
  searchParams: Promise<{ bayar?: string }>
}) {
  const [{ kursus, pelajaran }, { bayar }] = await Promise.all([params, searchParams])
  const kelas = ambilKelas(kursus)
  if (!kelas || kelas.status === 'draft') notFound()
  const materi = cariPelajaran(kelas, pelajaran)
  if (!materi) notFound()

  const pengguna = await penggunaAktif()
  const aksesPenuh = pengguna ? await punyaAkses(kelas.slug) : false
  const progres = pengguna ? await progresKelas(kelas.slug) : new Set<string>()
  const { sebelumnya, berikutnya, indeks, total } = tetangga(kelas, materi)
  const terkunci = materi.akses === 'berbayar' && !aksesPenuh
  const totalBisaDibaca = aksesPenuh ? total : kelas.jumlahGratis
  const selesaiTerlihat = Math.min(progres.size, totalBisaDibaca)
  const persenKelas = totalBisaDibaca ? Math.round((selesaiTerlihat / totalBisaDibaca) * 100) : 0
  const jalurMateri = `/belajar/${kelas.slug}/${materi.jalur}`

  return (
    <div className="mx-auto max-w-7xl px-5 py-7 sm:py-9 lg:px-8">
      <CatatanDemo ringkas />
      {bayar === 'sukses' && (
        <div role="status" aria-live="polite" className="mb-5 flex items-start gap-3 rounded-xl border border-hijau/20 bg-hijau/5 px-4 py-3.5">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-hijau/10 text-sm font-bold text-hijau-gelap" aria-hidden="true">✓</span>
          <div>
            <p className="text-sm font-semibold">Pembayaran berhasil diterima.</p>
            <p className="mt-1 text-xs leading-5 text-redup">Akses premium akan terbuka setelah konfirmasi pembayaran tersinkron. Jika materi masih terkunci, tunggu sebentar lalu muat ulang halaman.</p>
          </div>
        </div>
      )}
      <nav aria-label="Breadcrumb" className="mono mb-5 flex flex-wrap items-center gap-2 text-[0.65rem] text-redup">
        <Link href="/kelas" className="hover:text-hijau-gelap">Kelas</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/kelas/${kelas.slug}`} className="hover:text-hijau-gelap">{kelas.judul}</Link>
        <span aria-hidden="true">/</span>
        <span className="max-w-[14rem] truncate text-teks">{materi.judul}</span>
      </nav>

      <details className="mb-5 overflow-hidden rounded-xl border border-tepian bg-panel lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-hijau/10 text-hijau-gelap" aria-hidden="true">☷</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Kurikulum & progres</span>
            <span className="mono mt-0.5 block text-[0.61rem] text-redup">{selesaiTerlihat}/{totalBisaDibaca} pelajaran selesai · {persenKelas}%</span>
          </span>
          <span className="mono text-xs text-hijau-gelap">LIHAT</span>
        </summary>
        <div className="border-t border-tepian p-3">
          <IsiKurikulum kelas={kelas} progres={progres} aksesPenuh={aksesPenuh} materiAktif={materi.jalur} tampilkanKuis={Boolean(pengguna)} />
        </div>
      </details>

      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] xl:gap-12">
        <aside className="learning-rail hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
          <Link href={`/kelas/${kelas.slug}`} className="mb-5 block rounded-xl border border-tepian bg-panel p-4 transition-colors hover:bg-white">
            <span className="kicker text-hijau">KELAS / KEMBALI</span>
            <span className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold">{kelas.judul}<span aria-hidden="true">↗</span></span>
          </Link>
          <IsiKurikulum kelas={kelas} progres={progres} aksesPenuh={aksesPenuh} materiAktif={materi.jalur} tampilkanKuis={Boolean(pengguna)} />
        </aside>

        <article className="min-w-0 rounded-2xl border border-tepian bg-panel p-5 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tepian pb-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="kicker text-hijau">MODUL {String(materi.urutan).padStart(2, '0')}</span>
              <span className="h-1 w-1 rounded-full bg-tepian" aria-hidden="true" />
              <span className="mono text-[0.65rem] text-redup">PELAJARAN {String(indeks + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            </div>
            <span className={`mono rounded-full border px-2.5 py-1 text-[0.61rem] font-semibold uppercase tracking-[0.08em] ${materi.akses === 'gratis' ? 'border-hijau/20 bg-hijau/10 text-hijau-gelap' : 'border-kuning/20 bg-kuning/10 text-kuning'}`}>
              {materi.akses === 'gratis' ? 'Fondasi gratis' : 'Premium'}
            </span>
          </div>

          <div className="pb-7 pt-6">
            <p className="kicker text-redup">{materi.modulJudul}</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <h1 className="display-serif text-4xl leading-[1.08] sm:text-5xl">{materi.judul}</h1>
              <span className="mono shrink-0 text-xs text-redup">{durasiMenit(materi.menit)}</span>
            </div>
            {materi.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {materi.tags.map((tag) => <span key={tag} className="mono rounded-full bg-panel-2 px-2.5 py-1 text-[0.6rem] text-redup">#{tag}</span>)}
              </div>
            )}
          </div>

          {terkunci ? (
            <div className="overflow-hidden rounded-xl border border-kuning/20 bg-[#fbf5e9]">
              <div className="border-b border-kuning/15 px-5 py-4 sm:px-6">
                <span className="mono text-[0.64rem] font-bold uppercase tracking-[0.12em] text-kuning">Materi premium</span>
                <h2 className="mt-1 text-lg font-semibold">Isi lengkap terkunci.</h2>
              </div>
              <div className="p-5 sm:p-6">
                    <p className="text-sm leading-7 text-redup">Pratinjau singkat di bawah menunjukkan apa yang akan kamu pelajari. Kode, langkah praktik, dan materi lengkap tersedia setelah akses kelas aktif.</p>
                    <p className="mt-4 rounded-lg border border-kuning/15 bg-white/60 p-4 text-sm leading-7 text-teks">{materi.ringkasan}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                  <span className="mono rounded-full border border-kuning/15 bg-white/60 px-3 py-1 text-[0.61rem] text-redup">Satu kali pembayaran</span>
                  <span className="mono rounded-full border border-kuning/15 bg-white/60 px-3 py-1 text-[0.61rem] text-redup">Akses selamanya</span>
                </div>
                <div className="mt-5 max-w-sm">
                  <TombolBeli slugKelas={kelas.slug} lanjut={jalurMateri} label={`Buka seluruh kelas · ${rupiah(kelas.harga)}`} />
                </div>
              </div>
            </div>
          ) : (
            <MdxIsi sumber={materi.isi} />
          )}

          {!terkunci && (
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-tepian pt-6">
              <TombolSelesai
                slugKelas={kelas.slug}
                jalur={materi.jalur}
                awalSelesai={progres.has(materi.jalur)}
                    aktif={Boolean(pengguna) && !terkunci}
              />
              {!pengguna && <span className="text-xs text-redup">Materi gratis tetap terbuka tanpa akun.</span>}
            </div>
          )}

          <nav aria-label="Navigasi pelajaran" className="mt-7 grid gap-3 border-t border-tepian pt-6 sm:grid-cols-2">
            {sebelumnya ? (
              <Link href={`/belajar/${kelas.slug}/${sebelumnya.jalur}`} className="group rounded-xl border border-tepian p-4 transition-colors hover:border-hijau/30 hover:bg-panel-2/60">
                <span className="mono text-[0.62rem] text-redup">← SEBELUMNYA</span>
                <span className="mt-1 block text-sm font-semibold leading-5 group-hover:text-hijau-gelap">{sebelumnya.judul}</span>
              </Link>
            ) : <span />}
            {berikutnya ? (
              <Link href={`/belajar/${kelas.slug}/${berikutnya.jalur}`} className="group rounded-xl border border-tepian p-4 text-left transition-colors hover:border-hijau/30 hover:bg-panel-2/60 sm:text-right">
                <span className="mono text-[0.62rem] text-redup">SELANJUTNYA → {berikutnya.akses === 'berbayar' && !aksesPenuh ? '· PREMIUM' : ''}</span>
                <span className="mt-1 block text-sm font-semibold leading-5 group-hover:text-hijau-gelap">{berikutnya.judul}</span>
              </Link>
            ) : <span />}
          </nav>
        </article>
      </div>
    </div>
  )
}

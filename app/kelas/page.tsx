import Link from 'next/link'
import { daftarKelas } from '@/lib/kurikulum'
import { Lencana } from '@/components/Lencana'
import { rupiah, durasiMenit } from '@/lib/format'

export const metadata = { title: 'Semua kelas' }

export default function DaftarKelas() {
  const semua = daftarKelas().filter((kelas) => kelas.status !== 'draft')

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
      <header className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute right-10 top-9 hidden h-2 w-2 rounded-full bg-lime sm:block" aria-hidden="true" />
        <div className="relative">
          <p className="kicker text-[#d9ed8e]">RUANG BELAJAR / KATALOG</p>
          <h1 className="display-serif mt-4 max-w-[12ch] text-5xl leading-[1.05] sm:text-6xl">Belajar untuk membangun.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Kelas teknis yang berangkat dari fondasi, lalu membawamu menuju sistem yang bisa dijalankan dan dipertanggungjawabkan.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <span className="mono rounded-full border border-white/15 px-3 py-1.5 text-[0.66rem] text-white/70">Bahasa Indonesia</span>
            <span className="mono rounded-full border border-white/15 px-3 py-1.5 text-[0.66rem] text-white/70">Docs-driven</span>
            <span className="mono rounded-full border border-white/15 px-3 py-1.5 text-[0.66rem] text-white/70">Fondasi gratis</span>
          </div>
        </div>
      </header>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-hijau">PILIH JALUR</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Kelas yang tersedia</h2>
        </div>
        <span className="mono text-xs text-redup">{semua.length.toString().padStart(2, '0')} PROGRAM</span>
      </div>

      {semua.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {semua.map((kelas) => (
            <Link key={kelas.slug} href={`/kelas/${kelas.slug}`} className="group kotak kotak-hover overflow-hidden">
              <div className="relative min-h-48 overflow-hidden bg-[#e5e8d8] p-6 sm:p-8">
                <div className="absolute -right-9 -top-12 h-52 w-52 rounded-full border border-hijau/15" aria-hidden="true" />
                <div className="absolute -right-1 top-5 h-36 w-36 rounded-full border border-hijau/15" aria-hidden="true" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Lencana anak={`${kelas.modul.filter((modul) => modul.akses === 'gratis').length} modul fondasi gratis`} warna="hijau" />
                    <Lencana anak={kelas.level.split(' ')[0]} />
                    <Lencana anak={durasiMenit(kelas.totalMenit)} />
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hijau/25 bg-panel/75 text-hijau-gelap transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">↗</span>
                </div>
                <p className="mono relative mt-8 text-[0.62rem] tracking-[0.12em] text-hijau-gelap/65">NIUMINATION / PROGRAM 001</p>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <div className="mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-hijau">{kelas.status === 'terbit' ? 'Kelas tersedia' : 'Pra-rilis'}</div>
                    <h3 className="display-serif mt-2 text-3xl leading-tight sm:text-4xl">{kelas.judul}</h3>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <span className="mono block text-[0.6rem] uppercase tracking-[0.1em] text-redup">Akses premium</span>
                    <span className="mt-1 block text-xl font-bold tracking-tight">{rupiah(kelas.harga)}</span>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-redup">{kelas.deskripsi}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-tepian pt-4">
                  <span className="text-sm text-redup">{kelas.jumlahPelajaran} pelajaran <span aria-hidden="true">·</span> {kelas.instrukturSingkat ?? kelas.instruktur}</span>
                  <span className="group inline-flex items-center gap-2 text-sm font-semibold text-hijau-gelap">Jelajahi kelas <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-tepian bg-panel/60 px-6 py-14 text-center">
          <span className="mono text-xs text-redup">SEDANG DISIAPKAN</span>
          <h3 className="display-serif mt-3 text-3xl">Kelas berikutnya sedang dirancang.</h3>
          <p className="mt-2 text-sm text-redup">Kembali lagi nanti untuk melihat program baru.</p>
        </div>
      )}
    </div>
  )
}

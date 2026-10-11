import Link from 'next/link'
import { HasilVerifikasi } from '@/components/HasilVerifikasi'

export const metadata = { title: 'Verifikasi sertifikat' }

export default async function HalamanVerifikasi({
  searchParams,
}: {
  searchParams: Promise<{ nomor?: string }>
}) {
  const { nomor } = await searchParams
  const bersih = (nomor ?? '').trim().slice(0, 100)

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <header className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="kicker text-[#d9ed8e]">TERBUKA UNTUK SIAPA SAJA</p>
            <h1 className="display-serif mt-4 max-w-[11ch] text-5xl leading-[1.04] sm:text-6xl">Sertifikat, bisa diperiksa.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">Periksa nomor sertifikat Niumination untuk memastikan status dan detail penerbitannya.</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/[0.055] p-4 sm:p-5">
            <span className="mono text-[0.6rem] tracking-[0.12em] text-white/45">DATA YANG DITAMPILKAN</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Nama penerima', 'Kelas', 'Tanggal terbit'].map((item) => <span key={item} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">{item}</span>)}
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">Email dan data akun lainnya tidak ditampilkan.</p>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-3xl">
        <form method="get" action="/verify" className="rounded-2xl border border-tepian bg-panel p-5 shadow-[var(--shadow-card)] sm:p-7">
          <label htmlFor="nomor-sertifikat" className="kicker text-hijau">NOMOR SERTIFIKAT</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="nomor-sertifikat"
              type="text"
              name="nomor"
              maxLength={100}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              defaultValue={bersih}
              placeholder="NIUM-2026-AIAGENT-XXXXXX"
              className="mono min-h-12 min-w-0 flex-1 rounded-xl border border-tepian bg-latar px-4 py-3 text-sm uppercase outline-none transition-shadow placeholder:normal-case placeholder:font-sans placeholder:text-redup/60 focus:border-hijau/55 focus:ring-4 focus:ring-hijau/10"
            />
            <button type="submit" className="button-light min-h-12 px-6">Periksa nomor <span aria-hidden="true">→</span></button>
          </div>
          <p className="mt-3 text-xs leading-5 text-redup">Nomor tercantum pada sertifikat PDF atau di QR verifikasi.</p>
        </form>

        {bersih && <div className="mt-6"><HasilVerifikasi nomor={bersih} /></div>}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ['01', 'Masukkan nomor', 'Salin nomor unik yang tercetak di sertifikat.'],
            ['02', 'Periksa status', 'Sistem mengecek catatan penerbitan secara langsung.'],
            ['03', 'Pastikan identitas', 'Cocokkan nama, kelas, dan tanggal terbit.'],
          ].map(([nomorLangkah, judul, isi]) => (
            <div key={nomorLangkah} className="rounded-xl border border-tepian bg-panel/70 p-4">
              <span className="mono text-[0.62rem] text-hijau">{nomorLangkah} / VERIFIKASI</span>
              <h2 className="mt-3 text-sm font-semibold">{judul}</h2>
              <p className="mt-1.5 text-xs leading-5 text-redup">{isi}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

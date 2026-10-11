'use client'

import Link from 'next/link'

export default function KesalahanAplikasi({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:py-20 lg:px-8">
      <div className="rounded-[1.5rem] border border-tepian bg-panel px-6 py-12 text-center shadow-[var(--shadow-card)] sm:px-10 sm:py-16">
        <span className="mono inline-flex rounded-full border border-merah/20 bg-merah/5 px-3 py-1 text-[0.62rem] font-bold tracking-[0.12em] text-merah">TERJADI GANGGUAN</span>
        <h1 className="display-serif mt-5 text-4xl leading-tight sm:text-5xl">Halaman gagal dimuat.</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-redup">Coba muat ulang bagian ini. Progres yang tersimpan di akunmu tidak akan hilang.</p>
        {error.digest && <p className="mono mt-3 text-[0.62rem] text-redup">Referensi: {error.digest}</p>}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => reset()} className="button-light">Coba lagi <span aria-hidden="true">↻</span></button>
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-tepian px-5 text-sm font-semibold hover:bg-panel-2">Kembali ke beranda</Link>
        </div>
      </div>
    </section>
  )
}

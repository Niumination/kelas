import Link from 'next/link'

export default function TidakDitemukan() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-16 text-center text-white sm:px-10 sm:py-24">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative mx-auto max-w-xl">
          <p className="mono text-sm tracking-[0.22em] text-[#d9ed8e]">RUTE / 404</p>
          <div className="display-serif mt-3 text-8xl leading-none text-white/90 sm:text-9xl">404</div>
          <h1 className="display-serif mt-5 text-3xl sm:text-4xl">Halaman ini belum ditemukan.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">Mungkin alamatnya salah ketik, atau materi belum tersedia. Mari kembali ke jalur belajar.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="button-primary">Kembali ke beranda <span aria-hidden="true">→</span></Link>
            <Link href="/kelas" className="button-secondary">Lihat semua kelas</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

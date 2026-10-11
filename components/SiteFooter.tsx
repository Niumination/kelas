import Link from 'next/link'

const TAUTAN = {
  Belajar: [
    { href: '/kelas', label: 'Semua kelas' },
    { href: '/harga', label: 'Harga & akses' },
    { href: '/dashboard', label: 'Progres belajar' },
  ],
  Bantuan: [
    { href: '/verify', label: 'Verifikasi sertifikat' },
    { href: '/kebijakan', label: 'Kebijakan & refund' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-[#f2f1e8]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_0.9fr] lg:px-8 lg:py-16">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Kelas Niumination — beranda">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink">
              <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M7 24V8l18 16V8" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
                <path d="M7 8h5" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-extrabold tracking-[0.14em]">NIUMINATION</span>
              <span className="mono block text-[0.62rem] tracking-[0.18em] text-white/55">KELAS</span>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-7 text-white/65">
            Belajar membangun sistem AI yang bisa kamu pahami, jalankan, dan kendalikan sendiri.
            Materi berbahasa Indonesia, berbasis dokumentasi, tanpa video wajib.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/65">
            <span className="signal-dot h-1.5 w-1.5" /> Dibuat di Aceh, untuk siapa saja
          </div>
        </div>

        {Object.entries(TAUTAN).map(([judul, items]) => (
          <div key={judul}>
            <h2 className="kicker text-white/45">{judul}</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/75 transition-colors hover:text-lime">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="kicker text-white/45">Niumination</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href="https://niumination.web.id" target="_blank" rel="noreferrer" className="text-white/75 transition-colors hover:text-lime">
                Situs utama <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li>
              <a href="https://github.com/niumination" target="_blank" rel="noreferrer" className="text-white/75 transition-colors hover:text-lime">
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li>
              <a href="https://github.com/sponsors/Niumination" target="_blank" rel="noreferrer" className="text-white/75 transition-colors hover:text-lime">
                Dukung open source <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} Niumination · Afrizal Munthe · Aceh Tengah</span>
          <span>Fondasi gratis berlisensi MIT · Materi premium untuk peserta terdaftar</span>
        </div>
      </div>
    </footer>
  )
}

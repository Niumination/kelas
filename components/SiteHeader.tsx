import Link from 'next/link'

const MENU = [
  { href: '/kelas', label: 'Kelas' },
  { href: '/harga', label: 'Harga' },
  { href: '/dashboard', label: 'Progres' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-tepian bg-latar/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="mono group flex items-center gap-2 text-sm">
          <span className="text-hijau">▍</span>
          <span className="font-semibold tracking-tight">
            kelas<span className="text-redup">.niumination</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-md px-3 py-1.5 text-redup transition-colors hover:bg-panel-2 hover:text-teks"
            >
              {m.label}
            </Link>
          ))}
          <Link
            href="/masuk"
            className="ml-2 rounded-md border border-hijau/40 bg-hijau/10 px-3 py-1.5 text-hijau transition-colors hover:bg-hijau/20"
          >
            Masuk
          </Link>
        </nav>
      </div>
    </header>
  )
}

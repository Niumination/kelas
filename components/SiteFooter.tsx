import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-tepian">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <div className="mono mb-3 text-sm font-semibold">
            <span className="text-hijau">▍</span> kelas.niumination
          </div>
          <p className="text-sm text-redup">
            Kelas gratis dan berbayar untuk membangun sistem AI yang berjalan di mesinmu sendiri.
            Docs-driven, tanpa video, langsung bisa dipraktikkan.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-redup">Kelas</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/kelas/ai-agent-self-host" className="hover:text-hijau">
                AI Agent Self-Host
              </Link>
            </li>
            <li>
              <Link href="/harga" className="hover:text-hijau">
                Harga & tahap
              </Link>
            </li>
            <li>
              <Link href="/verify" className="hover:text-hijau">
                Verifikasi sertifikat
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-redup">Niumination</div>
          <ul className="space-y-2 text-sm text-redup">
            <li>
              <a href="https://niumination.web.id" target="_blank" rel="noreferrer" className="hover:text-hijau">
                Situs utama →
              </a>
            </li>
            <li>
              <a href="https://github.com/niumination" target="_blank" rel="noreferrer" className="hover:text-hijau">
                GitHub →
              </a>
            </li>
            <li>
              <a href="https://github.com/sponsors/Niumination" target="_blank" rel="noreferrer" className="hover:text-hijau">
                Dukung open source →
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-tepian">
        <div className="mono mx-auto max-w-6xl px-5 py-5 text-xs text-redup">
          © {new Date().getFullYear()} Niumination · Afrizal Munthe · Aceh Tengah · Materi dilisensikan MIT
        </div>
      </div>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface PenggunaHeader {
  email: string
  nama: string | null
}

interface Props {
  pengguna: PenggunaHeader | null
}

const MENU = [
  { href: '/kelas', label: 'Kelas' },
  { href: '/harga', label: 'Harga' },
  { href: '/verify', label: 'Verifikasi' },
]

function LogoMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-hijau-gelap text-lime shadow-sm" aria-hidden="true">
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
        <path d="M7 24V8l18 16V8" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
        <path d="M7 8h5" stroke="currentColor" strokeWidth="3" />
      </svg>
    </span>
  )
}

function namaTampilan(pengguna: PenggunaHeader) {
  return pengguna.nama?.trim() || pengguna.email || 'Akun saya'
}

function inisial(pengguna: PenggunaHeader) {
  const nama = namaTampilan(pengguna)
  return nama
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((bagian) => bagian[0].toUpperCase())
    .join('') || 'A'
}

export function SiteHeaderNav({ pengguna }: Props) {
  const pathname = usePathname()
  const [menuBuka, setMenuBuka] = useState(false)

  function aktif(href: string) {
    return pathname === href || (href !== '/kelas' && pathname.startsWith(`${href}/`)) || (href === '/kelas' && pathname.startsWith('/kelas/'))
  }

  return (
    <header className="sticky top-0 z-50 border-b border-tepian/80 bg-latar/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="Kelas Niumination — beranda">
          <LogoMark />
          <span className="leading-tight">
            <span className="block text-[0.82rem] font-extrabold tracking-[0.13em] text-teks">NIUMINATION</span>
            <span className="mono block text-[0.59rem] tracking-[0.16em] text-redup">KELAS / BELAJAR TEKNIS</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {MENU.map((item) => {
            const terpilih = aktif(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={terpilih ? 'page' : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  terpilih ? 'bg-panel-2 text-hijau-gelap' : 'text-redup hover:bg-panel-2 hover:text-teks'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {pengguna ? (
            <>
              <Link
                href="/dashboard"
                title={pengguna.email}
                aria-label={`Akun ${namaTampilan(pengguna)} — buka progres belajar`}
                className="inline-flex min-h-10 max-w-56 items-center gap-2 rounded-full border border-tepian bg-panel px-2.5 py-1.5 text-sm font-semibold transition-colors hover:border-hijau/35 hover:bg-panel-2"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-hijau/10 text-[0.65rem] font-bold text-hijau-gelap" aria-hidden="true">{inisial(pengguna)}</span>
                <span className="max-w-36 truncate">{namaTampilan(pengguna)}</span>
                <span aria-hidden="true" className="text-redup">↗</span>
              </Link>
              <form action="/auth/keluar" method="post">
                <button type="submit" className="rounded-full px-3 py-2 text-sm font-medium text-redup transition-colors hover:bg-panel-2 hover:text-teks" aria-label={`Keluar dari akun ${pengguna.email}`}>
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="rounded-full px-3 py-2 text-sm font-medium text-redup transition-colors hover:text-teks">
                Progresku
              </Link>
              <Link href="/masuk" className="button-light min-h-0 rounded-full px-4 py-2 text-sm">
                Masuk <span aria-hidden="true">↗</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-tepian bg-panel text-teks md:hidden"
          aria-label={menuBuka ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={menuBuka}
          aria-controls="navigasi-mobile"
          onClick={() => setMenuBuka((buka) => !buka)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {menuBuka ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menuBuka && (
        <nav id="navigasi-mobile" aria-label="Navigasi utama" className="border-t border-tepian bg-panel px-5 py-4 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {MENU.map((item) => {
              const terpilih = aktif(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={terpilih ? 'page' : undefined}
                  onClick={() => setMenuBuka(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${terpilih ? 'bg-panel-2 text-hijau-gelap' : 'text-teks hover:bg-panel-2'}`}
                >
                  {item.label}
                </Link>
              )
            })}
            {pengguna && (
              <p className="mt-2 truncate border-t border-tepian px-4 pt-3 text-xs text-redup">
                Masuk sebagai <span className="font-semibold text-teks">{pengguna.email}</span>
              </p>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-tepian pt-3">
              <Link href="/dashboard" onClick={() => setMenuBuka(false)} className="rounded-xl border border-tepian px-4 py-3 text-center text-sm font-semibold">
                Progresku
              </Link>
              {pengguna ? (
                <form action="/auth/keluar" method="post">
                  <button type="submit" className="min-h-11 w-full rounded-xl bg-panel-2 px-4 py-3 text-center text-sm font-semibold text-teks hover:bg-[#e6e5dc]" aria-label={`Keluar dari akun ${pengguna.email}`}>
                    Keluar
                  </button>
                </form>
              ) : (
                <Link href="/masuk" onClick={() => setMenuBuka(false)} className="rounded-xl bg-hijau-gelap px-4 py-3 text-center text-sm font-semibold text-white">
                  Masuk ↗
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

import Link from 'next/link'
import type { Kelas } from '@/lib/kurikulum'
import { LencanaAkses } from './Lencana'
import { durasiMenit, durasiSingkat } from '@/lib/format'

interface Props {
  kelas: Kelas
  /** Jalur pelajaran yang sudah selesai (dari database). */
  progres?: ReadonlySet<string>
  /** Modul yang semua pelajarannya selesai dan kuisnya pernah lulus. */
  modulTuntas?: ReadonlySet<string>
  /** Batasi akses materi berbayar untuk pengunjung yang belum punya entitlement. */
  modeBaca?: 'semua' | 'gratis-saja'
  slugAktif?: string
  ringkas?: boolean
  /** Tampilkan tautan kuis hanya untuk modul yang aksesnya sudah dimiliki. */
  tampilkanKuis?: boolean
}

export function Kurikulum({
  kelas,
  progres,
  modulTuntas,
  modeBaca = 'gratis-saja',
  slugAktif,
  ringkas,
  tampilkanKuis,
}: Props) {
  return (
    <div className="space-y-3">
      {kelas.modul.map((modul) => {
        const terkunci = modeBaca === 'gratis-saja' && modul.akses === 'berbayar'
        return (
          <section key={modul.slug} className={`module-card ${terkunci ? 'is-locked' : ''}`} aria-labelledby={`modul-${modul.slug}`}>
            <div className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-5">
              <span className="module-number mt-0.5">{String(modul.urutan).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="kicker text-[0.59rem] text-redup">Modul {String(modul.urutan).padStart(2, '0')}</span>
                  <span className="h-1 w-1 rounded-full bg-tepian" aria-hidden="true" />
                  <span className="mono text-[0.62rem] text-redup">{modul.pelajaran.length} pelajaran</span>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 id={`modul-${modul.slug}`} className="max-w-2xl font-semibold leading-snug tracking-tight sm:text-[1.05rem]">
                    {modul.judul}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {modulTuntas?.has(modul.slug) && (
                      <span className="mono inline-flex items-center gap-1 rounded-full bg-hijau/10 px-2 py-1 text-[0.56rem] font-bold uppercase tracking-[0.08em] text-hijau-gelap">
                        <span aria-hidden="true">✓</span> Tuntas
                      </span>
                    )}
                    <LencanaAkses akses={modul.akses} />
                  </div>
                </div>
                {!ringkas && <p className="mt-2 max-w-3xl text-sm leading-6 text-redup">{modul.ringkasan}</p>}
                {terkunci && (
                  <p className="mono mt-2 text-[0.61rem] text-redup">Judul terlihat · isi lengkap terbuka setelah pembelian</p>
                )}
              </div>
            </div>

            <ol className="border-t border-tepian/80">
              {modul.pelajaran.map((pelajaran) => {
                const selesai = progres?.has(pelajaran.jalur) ?? false
                const aktif = slugAktif === pelajaran.jalur
                const bisaDibaca = !terkunci
                return (
                  <li key={pelajaran.jalur}>
                    {bisaDibaca ? (
                      <Link
                        href={`/belajar/${kelas.slug}/${pelajaran.jalur}`}
                        aria-current={aktif ? 'page' : undefined}
                        className={`group flex min-h-12 items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-panel-2/70 sm:px-5 ${aktif ? 'bg-hijau/5' : ''}`}
                      >
                        <span
                          className={`grid h-[1.15rem] w-[1.15rem] shrink-0 place-items-center rounded-full border text-[0.65rem] ${
                            selesai
                              ? 'border-hijau bg-hijau text-white'
                              : aktif
                                ? 'border-hijau text-hijau'
                                : 'border-tepian text-transparent'
                          }`}
                          aria-label={selesai ? 'Selesai' : undefined}
                        >
                          {selesai ? '✓' : aktif ? '•' : ''}
                        </span>
                        <span className={`min-w-0 flex-1 leading-snug ${aktif ? 'font-semibold text-hijau-gelap' : 'group-hover:text-hijau-gelap'}`}>
                          {pelajaran.judul}
                        </span>
                        <span className="mono shrink-0 text-[0.66rem] text-redup">{durasiSingkat(pelajaran.menit)}</span>
                        <span className="hidden text-redup transition-transform group-hover:translate-x-0.5 sm:inline" aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <div
                        className="flex min-h-12 items-center gap-3 px-4 py-2.5 text-sm text-redup/90 sm:px-5"
                        aria-label={`${pelajaran.judul}, materi premium terkunci`}
                      >
                        <svg viewBox="0 0 16 16" className="h-[1.05rem] w-[1.05rem] shrink-0 text-kuning" fill="none" aria-hidden="true">
                          <rect x="3.5" y="7" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <span className="min-w-0 flex-1 leading-snug">{pelajaran.judul}</span>
                        <span className="mono shrink-0 text-[0.66rem]">{durasiSingkat(pelajaran.menit)}</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>

            {tampilkanKuis && !terkunci && (
              <Link
                href={`/kuis/${kelas.slug}/${modul.slug}`}
                className="mono flex items-center gap-2 border-t border-tepian/80 px-4 py-3 text-[0.68rem] font-medium text-redup transition-colors hover:bg-panel-2/70 hover:text-hijau-gelap sm:px-5"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                  <path d="M8 1.8 14.2 8 8 14.2 1.8 8 8 1.8Z" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8 5v3.2m0 2.2v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Buka kuis modul <span className="ml-auto">→</span>
              </Link>
            )}
          </section>
        )
      })}

      {!ringkas && (
        <p className="mono px-1 pt-2 text-[0.67rem] text-redup">
          {kelas.jumlahPelajaran} pelajaran <span aria-hidden="true">·</span> {durasiMenit(kelas.totalMenit)} <span aria-hidden="true">·</span> {kelas.jumlahGratis} gratis, {kelas.jumlahBerbayar} premium
        </p>
      )}
    </div>
  )
}

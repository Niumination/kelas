import Link from 'next/link'
import type { Kelas } from '@/lib/kurikulum'
import { LencanaAkses } from './Lencana'
import { durasiMenit, durasiSingkat } from '@/lib/format'

interface Props {
  kelas: Kelas
  /** jalur pelajaran yang sudah selesai (dari DB) */
  progres?: Set<string>
  /** apakah pelajaran bisa diklik (sudah login punya akses / materi gratis) */
  modeBaca?: 'semua' | 'gratis-saja'
  slugAktif?: string
  ringkas?: boolean
  /** Tampilkan tautan kuis per modul (modul gratis selalu; berbayar ikut akses) */
  tampilkanKuis?: boolean
}

export function Kurikulum({
  kelas,
  progres,
  modeBaca = 'gratis-saja',
  slugAktif,
  ringkas,
  tampilkanKuis,
}: Props) {
  return (
    <div className="space-y-4">
      {kelas.modul.map((m) => {
        const terkunci = modeBaca === 'gratis-saja' && m.akses === 'berbayar'
        return (
          <div key={m.slug} className="kotak overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-tepian px-4 py-3">
              <div>
                <div className="mono mb-1 text-[0.7rem] uppercase tracking-wider text-redup">
                  Modul {String(m.urutan).padStart(2, '0')}
                </div>
                <h3 className="font-semibold leading-snug">{m.judul}</h3>
                {!ringkas && <p className="mt-1 text-sm text-redup">{m.ringkasan}</p>}
              </div>
              <LencanaAkses akses={m.akses} />
            </div>
            <ul className="divide-y divide-tepian">
              {m.pelajaran.map((p) => {
                const selesai = progres?.has(p.jalur)
                const aktif = slugAktif === p.jalur
                const bisa = !terkunci
                return (
                  <li key={p.jalur}>
                    {bisa ? (
                      <Link
                        href={`/belajar/${kelas.slug}/${p.jalur}`}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-panel-2 ${
                          aktif ? 'bg-hijau/[0.07]' : ''
                        }`}
                      >
                        <span
                          className={`mono flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[0.6rem] ${
                            selesai
                              ? 'border-hijau bg-hijau text-latar'
                              : 'border-tepian text-redup'
                          }`}
                        >
                          {selesai ? '✓' : ''}
                        </span>
                        <span className={`flex-1 ${aktif ? 'text-hijau' : ''}`}>{p.judul}</span>
                        <span className="mono text-[0.7rem] text-redup">{durasiSingkat(p.menit)}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-redup">
                        <span className="opacity-60">🔒</span>
                        <span className="flex-1">{p.judul}</span>
                        <span className="mono text-[0.7rem]">{durasiSingkat(p.menit)}</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            {tampilkanKuis && !terkunci && (
              <Link
                href={`/kuis/${kelas.slug}/${m.slug}`}
                className="mono flex items-center gap-2 border-t border-tepian px-4 py-2 text-[0.7rem] text-redup hover:bg-panel-2 hover:text-hijau"
              >
                <span>◈</span> Kuis modul ini
              </Link>
            )}
          </div>
        )
      })}
      {!ringkas && (
        <p className="mono text-xs text-redup">
          Total {kelas.jumlahPelajaran} pelajaran · {durasiMenit(kelas.totalMenit)} ·{' '}
          {kelas.jumlahGratis} gratis, {kelas.jumlahBerbayar} berbayar
        </p>
      )}
    </div>
  )
}

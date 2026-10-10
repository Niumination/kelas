import Link from 'next/link'
import { daftarKelas, pelajaranDatar } from '@/lib/kurikulum'
import { CatatanDemo } from '@/components/CatatanDemo'
import { TombolBeli } from '@/components/TombolBeli'
import { TombolSertifikat } from '@/components/TombolSertifikat'
import {
  penggunaAktif,
  progresKelas,
  punyaAkses,
  rekapKuis,
  syaratSertifikat,
  sertifikatSaya,
} from '@/lib/supabase/server'
import { rupiah } from '@/lib/format'

export const metadata = { title: 'Progres belajarku' }

export default async function Dasbor() {
  const pengguna = await penggunaAktif()

  if (!pengguna) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Progres belajarku</h1>
        <p className="mt-3 text-redup">Masuk dulu untuk melihat progres, kuis, dan sertifikatmu.</p>
        <Link
          href="/masuk?lanjut=/dashboard"
          className="mono mt-6 inline-block rounded-md border border-hijau/50 bg-hijau/15 px-6 py-2.5 text-sm font-semibold text-hijau hover:bg-hijau/25"
        >
          Masuk →
        </Link>
        <div className="mt-6">
          <CatatanDemo ringkas />
        </div>
      </div>
    )
  }

  const semua = daftarKelas()
  const sertifikatList = await sertifikatSaya()

  const kartu = await Promise.all(
    semua.map(async (k) => {
      const progres = await progresKelas(k.slug)
      const total = pelajaranDatar(k).length
      return {
        kelas: k,
        selesai: progres.size,
        total,
        punya: await punyaAkses(k.slug),
        kuis: await rekapKuis(k.slug),
        syarat: await syaratSertifikat(k.slug),
      }
    }),
  )

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-2xl font-bold tracking-tight">Progres belajarku</h1>
      <p className="mono mt-1 text-sm text-redup">
        {pengguna.nama ?? pengguna.email} · {pengguna.email}
      </p>

      <div className="mt-10 space-y-6">
        {kartu.map(({ kelas, selesai, total, punya, kuis, syarat }) => {
          const persen = total ? Math.round((selesai / total) * 100) : 0
          const sertifikat = sertifikatList.find((s) => s.slug === kelas.slug) ?? null

          return (
            <div key={kelas.slug} className="kotak p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{kelas.judul}</h2>
                  <p className="mono mt-1 text-xs text-redup">
                    {selesai}/{total} pelajaran · {persen}% ·{' '}
                    {punya ? <span className="text-hijau">akses penuh</span> : <span>akses gratis</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/belajar/${kelas.slug}`}
                    className="mono rounded-md border border-tepian px-4 py-2 text-sm hover:bg-panel-2"
                  >
                    Lanjut →
                  </Link>
                  {!punya && (
                    <div className="w-40">
                      <TombolBeli slugKelas={kelas.slug} label={`Buka ${rupiah(kelas.harga)}`} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded bg-panel-2">
                <div className="h-full bg-hijau transition-all" style={{ width: `${persen}%` }} />
              </div>

              {kuis.length > 0 && (
                <div className="mt-6">
                  <div className="mono mb-3 text-[0.7rem] uppercase tracking-wider text-redup">Kuis</div>
                  <ul className="divide-y divide-tepian">
                    {kuis.map((k) => (
                      <li key={k.modul} className="flex items-center justify-between py-2 text-sm">
                        <Link
                          href={`/kuis/${kelas.slug}/${k.modul}`}
                          className="hover:text-hijau"
                        >
                          {k.judul_kuis}
                        </Link>
                        <span className="mono text-xs">
                          {k.percobaan === 0 ? (
                            <span className="text-redup">belum dikerjakan</span>
                          ) : (
                            <>
                              <span className={k.lulus ? 'text-hijau' : 'text-kuning'}>
                                {k.nilai_terbaik}
                              </span>
                              <span className="text-redup"> · {k.percobaan}× </span>
                              <span className={k.lulus ? 'text-hijau' : 'text-kuning'}>
                                {k.lulus ? 'lulus' : 'belum'}
                              </span>
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 border-t border-tepian pt-5">
                <TombolSertifikat
                  slugKelas={kelas.slug}
                  siap={Boolean(syarat?.siap)}
                  pelajaranSelesai={syarat?.pelajaran_selesai ?? selesai}
                  totalPelajaran={syarat?.total_pelajaran ?? total}
                  kuisLulus={syarat?.kuis_lulus ?? 0}
                  totalKuis={syarat?.total_kuis ?? kuis.length}
                  sertifikat={sertifikat}
                  aktif
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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

export default async function Dasbor({
  searchParams,
}: {
  searchParams: Promise<{ bayar?: string }>
}) {
  const [{ bayar }, pengguna] = await Promise.all([searchParams, penggunaAktif()])

  if (!pengguna) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
        <CatatanDemo ringkas />
        {bayar === 'menunggu' && (
          <div role="status" className="mb-5 rounded-xl border border-kuning/20 bg-kuning/5 px-4 py-3 text-sm text-redup">Pembayaran sedang menunggu konfirmasi. Masuk ke akun untuk melihat akses kelas setelah transaksi selesai.</div>
        )}
        <div className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-12 text-white sm:px-10 sm:py-16">
          <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <p className="kicker text-[#d9ed8e]">RUANG BELAJAR / PROGRES</p>
            <h1 className="display-serif mt-4 text-5xl leading-[1.05] sm:text-6xl">Perjalanan belajarmu tersimpan di sini.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">Masuk untuk melihat pelajaran yang selesai, hasil kuis, akses kelas, dan sertifikatmu.</p>
            <Link href="/masuk?lanjut=/dashboard" className="button-primary mt-7">Masuk ke akun <span aria-hidden="true">→</span></Link>
            <p className="mt-4 text-xs text-white/45">Belum ingin membuat akun? Materi fondasi bisa dibaca gratis.</p>
          </div>
        </div>
      </div>
    )
  }

  const semua = daftarKelas().filter((kelas) => kelas.status !== 'draft')
  const sertifikatList = await sertifikatSaya()
  const kartu = await Promise.all(
    semua.map(async (kelas) => {
      const progres = await progresKelas(kelas.slug)
      const daftarPelajaran = pelajaranDatar(kelas)
      const totalPelajaran = daftarPelajaran.length
      const punya = await punyaAkses(kelas.slug)
      const total = punya ? totalPelajaran : daftarPelajaran.filter((pelajaran) => pelajaran.akses === 'gratis').length
      const kuis = await rekapKuis(kelas.slug)
      return {
        kelas,
        selesai: progres.size,
        total,
        totalPelajaran,
        punya,
        kuis,
        syarat: await syaratSertifikat(kelas.slug),
      }
    }),
  )

  const totalSelesai = kartu.reduce((jumlah, item) => jumlah + item.selesai, 0)
  const totalKuisLulus = kartu.reduce((jumlah, item) => jumlah + item.kuis.filter((kuis) => kuis.lulus).length, 0)
  const aksesPenuh = kartu.filter((item) => item.punya).length

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <CatatanDemo ringkas />
      {bayar === 'menunggu' && (
        <div role="status" aria-live="polite" className="mb-5 rounded-xl border border-kuning/20 bg-kuning/5 px-4 py-3 text-sm leading-6 text-redup">
          Transaksi sedang menunggu konfirmasi dari Midtrans. Akses kelas akan terbuka setelah pembayaran berhasil diproses; periksa kembali dasbor ini sebentar lagi.
        </div>
      )}
      <header className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="kicker text-[#d9ed8e]">RUANG BELAJAR / PRIBADI</p>
            <h1 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">{pengguna.nama ? `Halo, ${pengguna.nama}.` : 'Selamat datang kembali.'}</h1>
            <p className="mt-3 text-sm text-white/55">{pengguna.email}</p>
          </div>
          <Link href="/kelas" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10">Jelajahi kelas <span aria-hidden="true">↗</span></Link>
        </div>
        <dl className="relative mt-8 grid grid-cols-2 border-t border-white/15 pt-5 sm:grid-cols-4">
          {[
            ['Pelajaran selesai', totalSelesai],
            ['Kuis lulus', totalKuisLulus],
            ['Akses penuh', aksesPenuh],
            ['Sertifikat', sertifikatList.length],
          ].map(([label, nilai]) => (
            <div key={label} className="border-r border-white/10 px-3 py-2 first:pl-0 last:border-0 sm:px-5">
              <dt className="kicker text-[0.57rem] text-white/45">{label}</dt>
              <dd className="mt-1 text-xl font-semibold text-[#d9ed8e]">{nilai}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker text-hijau">LANJUTKAN DARI SINI</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Kelas & progres</h2>
        </div>
        <span className="mono text-xs text-redup">{kartu.length.toString().padStart(2, '0')} KELAS</span>
      </div>

      {kartu.length > 0 ? (
        <div className="mt-5 space-y-5">
          {kartu.map(({ kelas, selesai, total, totalPelajaran, punya, kuis, syarat }) => {
            const persen = total ? Math.round((selesai / total) * 100) : 0
            const sertifikat = sertifikatList.find((item) => item.slug === kelas.slug) ?? null

            return (
              <section key={kelas.slug} className="kotak overflow-hidden">
                <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mono rounded-full bg-hijau/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-hijau-gelap">{punya ? 'Akses penuh' : 'Fondasi gratis'}</span>
                      <span className="mono text-[0.63rem] text-redup">{kelas.estimasiJam} JAM / ESTIMASI</span>
                    </div>
                    <h3 className="display-serif mt-3 text-3xl leading-tight">{kelas.judul}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-redup">{kelas.tagline}</p>
                    <div className="mt-6 flex items-end justify-between gap-4">
                      <div>
                        <div className="mono text-[0.61rem] text-redup">{punya ? 'PROGRES KELAS' : 'PROGRES FONDASI GRATIS'}</div>
                        <div className="mt-1 text-sm font-semibold">{selesai} <span className="font-normal text-redup">dari {total} · {persen}%</span></div>
                      </div>
                      <span className="mono text-xs text-hijau-gelap">{persen === 100 ? (punya ? 'KELAS SELESAI' : 'FONDASI TUNTAS') : 'TERUSKAN →'}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-label={`Progres ${kelas.judul}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={persen}>
                      <div className="h-full rounded-full bg-hijau transition-all" style={{ width: `${persen}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:min-w-56 lg:justify-end">
                    <Link href={`/belajar/${kelas.slug}`} className="button-light flex-1 lg:flex-none">Lanjut belajar <span aria-hidden="true">→</span></Link>
                    {!punya && <div className="w-full lg:w-auto"><TombolBeli slugKelas={kelas.slug} lanjut="/dashboard" label={`Buka premium · ${rupiah(kelas.harga)}`} /></div>}
                  </div>
                </div>

                {kuis.length > 0 && (
                  <div className="border-t border-tepian bg-panel/65 px-5 py-5 sm:px-7">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="kicker text-redup">HASIL KUIS</h4>
                      <Link href={`/belajar/${kelas.slug}`} className="text-xs font-semibold text-hijau-gelap hover:underline">Lihat kurikulum →</Link>
                    </div>
                    <ul className="divide-y divide-tepian">
                      {kuis.map((item) => (
                        <li key={item.modul} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
                          <Link href={`/kuis/${kelas.slug}/${item.modul}`} className="font-medium hover:text-hijau-gelap">{item.judul_kuis}</Link>
                          <span className="mono text-[0.66rem]">
                            {item.percobaan === 0 ? (
                              <span className="text-redup">Belum dikerjakan</span>
                            ) : (
                              <>
                                <span className={item.lulus ? 'text-hijau-gelap' : 'text-kuning'}>{item.nilai_terbaik}</span>
                                <span className="text-redup"> · {item.percobaan}× · </span>
                                <span className={item.lulus ? 'text-hijau-gelap' : 'text-kuning'}>{item.lulus ? 'Lulus' : 'Belum lulus'}</span>
                              </>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-tepian px-5 py-5 sm:px-7">
                  <TombolSertifikat
                    slugKelas={kelas.slug}
                    siap={Boolean(syarat?.siap)}
                    pelajaranSelesai={syarat?.pelajaran_selesai ?? selesai}
                    totalPelajaran={syarat?.total_pelajaran ?? totalPelajaran}
                    kuisLulus={syarat?.kuis_lulus ?? 0}
                    totalKuis={syarat?.total_kuis ?? kuis.length}
                    sertifikat={sertifikat}
                    aktif
                  />
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-tepian bg-panel px-6 py-14 text-center">
          <p className="kicker text-hijau">LANGKAH PERTAMA</p>
          <h3 className="display-serif mt-3 text-3xl">Pilih kelas untuk memulai.</h3>
          <Link href="/kelas" className="button-light mt-5">Lihat katalog <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </div>
  )
}

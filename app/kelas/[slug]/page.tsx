import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ambilKelas, daftarKelas, hitungModulTuntas } from '@/lib/kurikulum'
import { Kurikulum } from '@/components/Kurikulum'
import { Lencana } from '@/components/Lencana'
import { CatatanDemo } from '@/components/CatatanDemo'
import { TombolBeli } from '@/components/TombolBeli'
import { penggunaAktif, punyaAkses, progresKelas, rekapKuis } from '@/lib/supabase/server'
import { rupiah, durasiMenit } from '@/lib/format'

export function generateStaticParams() {
  return daftarKelas().filter((kelas) => kelas.status !== 'draft').map((kelas) => ({ slug: kelas.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const kelas = ambilKelas(slug)
  return kelas && kelas.status !== 'draft'
    ? { title: kelas.judul, description: kelas.tagline }
    : { title: 'Kelas tidak ditemukan' }
}

export default async function HalamanKelas({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const kelas = ambilKelas(slug)
  if (!kelas || kelas.status === 'draft') notFound()

  const pengguna = await penggunaAktif()
  const [sudahPunya, progres, ringkasanKuis] = await Promise.all([
    pengguna ? punyaAkses(kelas.slug) : Promise.resolve(false),
    pengguna ? progresKelas(kelas.slug) : Promise.resolve(new Set<string>()),
    pengguna ? rekapKuis(kelas.slug) : Promise.resolve([]),
  ])
  const modulTuntas = hitungModulTuntas(
    kelas,
    progres,
    ringkasanKuis.filter((kuis) => kuis.lulus === true).map((kuis) => kuis.modul),
  )
  const modulGratis = kelas.modul.filter((modul) => modul.akses === 'gratis').length
  const modulPremium = kelas.modul.filter((modul) => modul.akses === 'berbayar').length

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10 lg:px-8">
      <CatatanDemo ringkas />

      <nav aria-label="Breadcrumb" className="mono mb-5 flex flex-wrap items-center gap-2 text-[0.67rem] text-redup">
        <Link href="/kelas" className="transition-colors hover:text-hijau-gelap">Kelas</Link>
        <span aria-hidden="true">/</span>
        <span className="text-teks">{kelas.judul}</span>
      </nav>

      <header className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute right-14 top-14 hidden h-36 w-36 rounded-full border border-white/10 sm:block" aria-hidden="true" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap gap-2">
              <Lencana anak={kelas.status === 'terbit' ? 'Tersedia' : 'Pra-rilis'} warna="kuning" />
              <Lencana anak={kelas.level} />
              <Lencana anak={`${kelas.jumlahPelajaran} pelajaran`} />
            </div>
            <p className="kicker text-[#d9ed8e]">NIUMINATION / PROGRAM BELAJAR 001</p>
            <h1 className="display-serif mt-4 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">{kelas.judul}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{kelas.tagline}</p>
            <div className="mt-7 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 px-3 py-1.5">{durasiMenit(kelas.totalMenit)} materi</span>
              <span className="rounded-full border border-white/15 px-3 py-1.5">{modulGratis} modul fondasi gratis</span>
              <span className="rounded-full border border-white/15 px-3 py-1.5">Bahasa Indonesia</span>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3 lg:pb-1">
            <div className="rounded-xl border border-white/15 bg-white/[0.055] p-4">
              <span className="mono text-[0.62rem] text-white/50">01 / MULAI</span>
              <div className="mt-3 text-2xl font-semibold text-[#d9ed8e]">{kelas.jumlahGratis}</div>
              <div className="mt-1 text-xs text-white/65">pelajaran gratis</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.055] p-4">
              <span className="mono text-[0.62rem] text-white/50">02 / LANJUT</span>
              <div className="mt-3 text-2xl font-semibold">{kelas.jumlahBerbayar}</div>
              <div className="mt-1 text-xs text-white/65">pelajaran premium</div>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-3 border-t border-white/15 pt-4 text-xs text-white/55">
              <span>{kelas.instrukturSingkat ?? kelas.instruktur}</span>
              <span className="mono shrink-0">{kelas.estimasiJam} JAM EST.</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_21rem] lg:items-start lg:gap-14">
        <div className="min-w-0">
          <section className="max-w-3xl">
            <p className="kicker text-hijau">TENTANG KELAS</p>
            <h2 className="display-serif mt-3 text-3xl leading-tight sm:text-4xl">Dari model lokal sampai sistem yang siap dipakai.</h2>
            <p className="mt-4 text-[0.98rem] leading-8 text-redup">{kelas.deskripsi}</p>
          </section>

          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="kicker text-hijau">HASIL BELAJAR</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Yang kamu dapat</h2>
              </div>
              <span className="mono text-xs text-redup">{modulGratis} GRATIS <span aria-hidden="true">/</span> {modulPremium} PREMIUM</span>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {kelas.yangDidapat.map((item, index) => (
                <li key={item} className="rounded-xl border border-tepian bg-panel p-4">
                  <div className="mono text-[0.62rem] text-hijau">{String(index + 1).padStart(2, '0')}</div>
                  <p className="mt-2 text-sm leading-6">{item}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 rounded-2xl border border-tepian bg-[#ecece1] p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-[0.75fr_1.25fr] sm:items-start">
              <div>
                <p className="kicker text-hijau">SEBELUM MULAI</p>
                <h2 className="mt-2 text-lg font-semibold">Prasyarat</h2>
              </div>
              <ul className="space-y-2.5 text-sm leading-6 text-redup">
                {kelas.prasyarat.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-0.5 text-hijau" aria-hidden="true">↗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="kurikulum" className="mt-14 scroll-mt-28">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="kicker text-hijau">PETA MATERI / 06 MODUL</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Kurikulum</h2>
              </div>
              <span className="mono text-xs text-redup">{durasiMenit(kelas.totalMenit)} TOTAL</span>
            </div>
            <Kurikulum
              kelas={kelas}
              progres={progres}
              modulTuntas={modulTuntas}
              modeBaca={sudahPunya ? 'semua' : 'gratis-saja'}
              tampilkanKuis={Boolean(pengguna)}
            />
          </section>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="kotak overflow-hidden p-5 sm:p-6">
            {sudahPunya ? (
              <>
                <span className="mono inline-flex items-center gap-2 rounded-full bg-hijau/10 px-3 py-1.5 text-[0.65rem] font-bold text-hijau-gelap">
                  <span className="signal-dot h-1.5 w-1.5" /> AKSES AKTIF
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight">Lanjutkan belajarmu.</h2>
                <p className="mt-2 text-sm leading-6 text-redup">Semua materi kelas ini sudah terbuka untuk akunmu.</p>
                <Link href={`/belajar/${kelas.slug}`} className="button-light mt-5 w-full">Lanjut belajar <span aria-hidden="true">→</span></Link>
              </>
            ) : (
              <>
                <span className="kicker text-kuning">{kelas.tahapHarga ?? 'AKSES PREMIUM'}</span>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-4xl font-bold tracking-[-0.05em]">{rupiah(kelas.harga)}</span>
                  {kelas.hargaAsli && <span className="text-sm text-redup line-through">{rupiah(kelas.hargaAsli)}</span>}
                </div>
                <p className="mt-2 text-sm text-hijau-gelap">Sekali bayar · akses seumur hidup</p>
                <ul className="mt-5 space-y-2 border-t border-tepian pt-5 text-sm text-redup">
                  <li className="flex gap-2"><span className="text-hijau">✓</span> Semua materi premium yang terbit</li>
                  <li className="flex gap-2"><span className="text-hijau">✓</span> Pembaruan kelas berikutnya</li>
                  <li className="flex gap-2"><span className="text-hijau">✓</span> Kuis dan sertifikat</li>
                </ul>
                <div className="mt-5">
                  <TombolBeli slugKelas={kelas.slug} label={`Buka akses · ${rupiah(kelas.harga)}`} lanjut={`/kelas/${kelas.slug}`} />
                </div>
                <Link href={`/belajar/${kelas.slug}`} className="mt-3 flex min-h-11 items-center justify-center rounded-lg border border-tepian px-4 text-sm font-semibold transition-colors hover:bg-panel-2">
                  Coba {kelas.jumlahGratis} pelajaran gratis dulu
                </Link>
                <p className="mt-4 text-xs leading-5 text-redup">Pembayaran diproses melalui Midtrans. Akses dibuka setelah pembayaran terkonfirmasi.</p>
              </>
            )}
            <div className="mt-6 border-t border-tepian pt-5">
              <span className="kicker text-redup">INSTRUKTUR</span>
              <p className="mt-2 text-sm font-semibold">{kelas.instrukturSingkat ?? kelas.instruktur}</p>
              <p className="mt-1 text-xs leading-5 text-redup">{kelas.instruktur}</p>
            </div>
          </div>
          <p className="mono mt-3 px-1 text-[0.62rem] leading-5 text-redup">FONDASI GRATIS TETAP BISA DIBACA TANPA AKUN.</p>
        </aside>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ambilKelas, daftarKelas } from '@/lib/kurikulum'
import { Kurikulum } from '@/components/Kurikulum'
import { Lencana } from '@/components/Lencana'
import { CatatanDemo } from '@/components/CatatanDemo'
import { TombolBeli } from '@/components/TombolBeli'
import { penggunaAktif, punyaAkses, progresKelas } from '@/lib/supabase/server'
import { rupiah, durasiMenit } from '@/lib/format'

export function generateStaticParams() {
  return daftarKelas().map((k) => ({ slug: k.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const kelas = ambilKelas(slug)
  return kelas ? { title: kelas.judul, description: kelas.tagline } : { title: 'Kelas tidak ditemukan' }
}

export default async function HalamanKelas({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const kelas = ambilKelas(slug)
  if (!kelas) notFound()

  const pengguna = await penggunaAktif()
  const sudahPunya = pengguna ? await punyaAkses(kelas.slug) : false
  const progres = pengguna ? await progresKelas(kelas.slug) : new Set<string>()

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <CatatanDemo ringkas />

      <nav className="mono mb-6 text-xs text-redup">
        <Link href="/kelas" className="hover:text-hijau">
          kelas
        </Link>
        <span className="mx-2">/</span>
        <span className="text-teks">{kelas.slug}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* ── Kiri ─────────────────────────────────────── */}
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Lencana anak={kelas.status === 'terbit' ? 'terbit' : 'pra-rilis'} warna="kuning" />
            <Lencana anak={kelas.level} />
            <Lencana anak={`${kelas.jumlahPelajaran} pelajaran`} />
            <Lencana anak={durasiMenit(kelas.totalMenit)} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{kelas.judul}</h1>
          <p className="mt-3 text-lg text-redup">{kelas.tagline}</p>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-[#cfd5dd]">{kelas.deskripsi}</p>

          <h2 className="mt-12 mb-3 text-xl font-semibold">Yang kamu dapat</h2>
          <ul className="space-y-2">
            {kelas.yangDidapat.map((y) => (
              <li key={y} className="flex gap-3 text-[0.95rem] text-[#cfd5dd]">
                <span className="text-hijau">✓</span>
                <span>{y}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-12 mb-3 text-xl font-semibold">Prasyarat</h2>
          <ul className="space-y-2">
            {kelas.prasyarat.map((p) => (
              <li key={p} className="flex gap-3 text-[0.95rem] text-redup">
                <span className="mono text-hijau">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-14 mb-5 text-xl font-semibold">Kurikulum</h2>
          <Kurikulum
            kelas={kelas}
            progres={progres}
            modeBaca={sudahPunya ? 'semua' : 'gratis-saja'}
            tampilkanKuis={Boolean(pengguna)}
          />
        </div>

        {/* ── Kanan ────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="kotak p-6">
            {sudahPunya ? (
              <>
                <div className="mono mb-3 text-xs font-bold uppercase tracking-wider text-hijau">
                  akses aktif
                </div>
                <p className="mb-5 text-sm text-redup">
                  Kamu sudah memiliki kelas ini. Lanjutkan dari pelajaran terakhir.
                </p>
                <Link
                  href={`/belajar/${kelas.slug}`}
                  className="mono block rounded-md border border-hijau/50 bg-hijau/15 px-5 py-3 text-center text-sm font-semibold text-hijau hover:bg-hijau/25"
                >
                  Lanjut belajar →
                </Link>
              </>
            ) : (
              <>
                <div className="mono mb-1 text-xs font-bold uppercase tracking-wider text-kuning">
                  {kelas.tahapHarga}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight">{rupiah(kelas.harga)}</span>
                  {kelas.hargaAsli && (
                    <span className="text-sm text-redup line-through">{rupiah(kelas.hargaAsli)}</span>
                  )}
                </div>
                <p className="mono mt-1 text-xs text-hijau">akses selamanya + semua pembaruan</p>

                <div className="mt-6">
                  <TombolBeli slugKelas={kelas.slug} label={`Beli ${rupiah(kelas.harga)}`} />
                </div>
                <Link
                  href={`/belajar/${kelas.slug}`}
                  className="mono mt-3 block rounded-md border border-tepian px-5 py-3 text-center text-sm hover:bg-panel-2"
                >
                  Coba {kelas.jumlahGratis} modul gratis dulu
                </Link>
                <p className="mt-5 text-xs leading-relaxed text-redup">
                  Pembayaran lewat Midtrans: QRIS, Virtual Account, GoPay, ShopeePay, atau kartu. Akses
                  diberikan otomatis setelah pembayaran terkonfirmasi.
                </p>
              </>
            )}

            <div className="mt-6 border-t border-tepian pt-5">
              <div className="mono mb-2 text-[0.7rem] uppercase tracking-wider text-redup">Instruktur</div>
              <p className="text-sm">{kelas.instruktur}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

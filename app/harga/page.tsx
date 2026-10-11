import Link from 'next/link'
import { ambilKelas } from '@/lib/kurikulum'
import { TombolBeli } from '@/components/TombolBeli'
import { CatatanDemo } from '@/components/CatatanDemo'
import { penggunaAktif, punyaAkses } from '@/lib/supabase/server'
import { rupiah } from '@/lib/format'

export const metadata = { title: 'Harga & akses' }

const TAHAP_LANJUTAN = [
  {
    nama: 'Tahap 2',
    harga: 199000,
    pemicu: 'Setelah empat modul premium selesai diterbitkan',
    nilai: 'Termasuk bank soal kuis yang lengkap',
  },
  {
    nama: 'Tahap 3',
    harga: 299000,
    pemicu: 'Setelah seluruh modul kelas lengkap',
    nilai: 'Termasuk repositori contoh dan templat proyek akhir',
  },
  {
    nama: 'Tahap 4',
    harga: 499000,
    pemicu: 'Saat sesi live dan review kode berkala tersedia',
    nilai: 'Termasuk sesi tanya jawab langsung dan review proyek akhir',
  },
]

const FAQ = [
  {
    tanya: 'Apa bedanya fondasi gratis dan akses premium?',
    jawab: 'Dua modul fondasi berisi empat pelajaran gratis, dari memasang Ollama sampai membuat agent pertama yang memanggil tool. Empat modul premium melanjutkan ke orkestrasi, konteks dan tool, guardrails, evaluasi, deploy, serta proyek akhir.',
  },
  {
    tanya: 'Kalau membeli saat materi belum lengkap, apa yang terjadi?',
    jawab: 'Pembelian satu kali memberi akses ke materi premium yang sudah terbit dan pembaruan kelas berikutnya tanpa biaya tambahan. Harga direncanakan naik seiring kelengkapan kelas; kamu bisa melihat rencana tahapnya di halaman ini.',
  },
  {
    tanya: 'Bagaimana kebijakan refund?',
    jawab: 'Refund dapat diminta dalam 7 hari sejak pembelian selama progres belum melewati 30% pelajaran. Rincian dan cara menghubungi kami tersedia di halaman kebijakan.',
  },
  {
    tanya: 'Apakah saya harus punya GPU?',
    jawab: 'Tidak. GPU opsional. Prasyarat kelas adalah laptop dengan RAM minimal 8 GB; 16 GB lebih nyaman. Materi fondasi membantumu mengukur kemampuan mesin sebelum memilih model.',
  },
  {
    tanya: 'Apakah kelas ini cocok untuk instansi?',
    jawab: 'Saat ini fokusnya adalah jalur belajar publik. Kebutuhan B2B atau pelatihan instansi menjadi tahap lanjutan, setelah pengalaman belajar publik matang.',
  },
]

export default async function HalamanHarga() {
  const kelas = ambilKelas('ai-agent-self-host')
  const pengguna = await penggunaAktif()
  const sudahPunya = kelas && pengguna ? await punyaAkses(kelas.slug) : false

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <CatatanDemo ringkas />

      <header className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
          <div>
            <p className="kicker text-[#d9ed8e]">JELAS SEJAK AWAL</p>
            <h1 className="display-serif mt-4 max-w-[11ch] text-5xl leading-[1.02] sm:text-6xl">Harga yang tumbuh bersama materi.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              Fondasi tetap gratis. Yang kamu bayar adalah materi premium yang mengubah percobaan awal menjadi sistem yang lebih siap dipakai.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/[0.055] p-5 sm:p-6">
            <div className="mono text-[0.62rem] uppercase tracking-[0.14em] text-white/50">Prinsip akses</div>
            <div className="mt-4 flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d9ed8e] text-sm font-bold text-ink">✓</span>
              <div>
                <p className="font-semibold">Sekali bayar. Materi terus diperbarui.</p>
                <p className="mt-1 text-sm leading-6 text-white/60">Tidak ada langganan bulanan untuk akses kelas ini.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <section aria-labelledby="harga-saat-ini">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="kicker text-hijau">TAHAP SAAT INI</p>
              <h2 id="harga-saat-ini" className="mt-2 text-2xl font-semibold tracking-tight">Akses kelas penuh</h2>
            </div>
            {kelas && <span className="mono text-xs text-redup">{kelas.status === 'terbit' ? 'TERSEDIA' : 'PRA-RILIS'}</span>}
          </div>

          {kelas ? (
            <div className="kotak mt-5 overflow-hidden">
              <div className="border-b border-tepian bg-[#eceee2] p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="mono inline-flex rounded-full border border-hijau/20 bg-panel px-3 py-1 text-[0.63rem] font-semibold text-hijau-gelap">{kelas.tahapHarga ?? 'Harga perkenalan'}</span>
                    <h3 className="display-serif mt-4 text-3xl leading-tight sm:text-4xl">{kelas.judul}</h3>
                  </div>
                  <div className="text-left sm:text-right">
                    {kelas.hargaAsli && <span className="mono block text-xs text-redup line-through">{rupiah(kelas.hargaAsli)}</span>}
                    <span className="mt-1 block text-3xl font-bold tracking-[-0.05em]">{rupiah(kelas.harga)}</span>
                    <span className="mono text-[0.62rem] text-hijau-gelap">SEKALI BAYAR</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-redup">
                  <span>{kelas.modul.length} modul</span>
                  <span>{kelas.jumlahPelajaran} pelajaran</span>
                  <span>{kelas.estimasiJam} jam estimasi</span>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {sudahPunya ? (
                  <div className="flex flex-col gap-4 rounded-xl border border-hijau/20 bg-hijau/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="mono text-[0.62rem] font-bold text-hijau-gelap">AKSES AKTIF</span>
                      <p className="mt-1 text-sm text-redup">Kamu sudah memiliki kelas ini.</p>
                    </div>
                    <Link href={`/belajar/${kelas.slug}`} className="button-light">Lanjut belajar <span aria-hidden="true">→</span></Link>
                  </div>
                ) : (
                  <>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {[
                        'Semua modul premium yang telah terbit',
                        'Pembaruan materi berikutnya',
                        'Kuis untuk menguji pemahaman',
                        'Sertifikat bernomor dan dapat diverifikasi',
                      ].map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm leading-6 text-redup">
                          <span className="mt-0.5 text-hijau" aria-hidden="true">✓</span><span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <TombolBeli slugKelas={kelas.slug} lanjut="/harga" label={`Buka akses premium · ${rupiah(kelas.harga)}`} />
                      <Link href={`/belajar/${kelas.slug}`} className="flex min-h-12 items-center justify-center rounded-lg border border-tepian px-4 text-sm font-semibold transition-colors hover:bg-panel-2">Mulai gratis dahulu</Link>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-redup">Pembayaran diproses melalui Midtrans. Akses diberikan setelah transaksi terkonfirmasi.</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="kotak mt-5 p-6 text-sm text-redup">Belum ada kelas yang tersedia untuk dibeli.</div>
          )}
        </section>

        <aside className="rounded-2xl border border-tepian bg-panel p-5 sm:p-6">
          <p className="kicker text-hijau">RENCANA TAHAP BERIKUTNYA</p>
          <h2 className="mt-2 text-lg font-semibold">Harga mengikuti kelengkapan.</h2>
          <p className="mt-2 text-sm leading-6 text-redup">Tahap berikutnya direncanakan saat materi tambahan siap. Pembeli tahap lebih awal tetap mendapat pembaruan tanpa biaya tambahan.</p>
          <ol className="mt-5 space-y-0">
            {TAHAP_LANJUTAN.map((tahap, index) => (
              <li key={tahap.nama} className="relative border-l border-tepian pb-5 pl-5 last:border-l-transparent last:pb-0">
                <span className="absolute -left-[0.38rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-panel bg-hijau/50" aria-hidden="true" />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="mono text-[0.63rem] text-redup">{tahap.nama}</span>
                  <span className="text-sm font-semibold">{rupiah(tahap.harga)}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-redup">{tahap.pemicu}. {tahap.nilai}.</p>
                {index === 0 && <span className="mono mt-2 inline-block text-[0.55rem] text-hijau">RENCANA</span>}
              </li>
            ))}
          </ol>
          <p className="mono mt-5 border-t border-tepian pt-4 text-[0.58rem] leading-5 text-redup">HARGA FINAL DITAMPILKAN SEBELUM CHECKOUT.</p>
        </aside>
      </div>

      <section className="mt-16 grid gap-10 border-t border-tepian pt-12 lg:grid-cols-[0.65fr_1.35fr]">
        <div>
          <p className="kicker text-hijau">PERTANYAAN UMUM</p>
          <h2 className="display-serif mt-3 max-w-[10ch] text-4xl leading-tight">Sebelum kamu memutuskan.</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-redup">Masih ragu? Coba dulu materi fondasi gratis tanpa perlu akun atau pembayaran.</p>
          <Link href={kelas ? `/belajar/${kelas.slug}` : '/kelas'} className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-hijau-gelap">Baca materi gratis <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></Link>
        </div>
        <div className="space-y-2">
          {FAQ.map((faq, index) => (
            <details key={faq.tanya} className="group rounded-xl border border-tepian bg-panel px-4 open:bg-white sm:px-5">
              <summary className="flex cursor-pointer list-none items-center gap-4 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                <span className="mono text-[0.62rem] text-hijau">0{index + 1}</span>
                <span className="flex-1">{faq.tanya}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-tepian text-redup transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-5 pl-9 pr-4 text-sm leading-7 text-redup">{faq.jawab}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

import Link from 'next/link'
import { ambilKelas } from '@/lib/kurikulum'
import { Kurikulum } from '@/components/Kurikulum'
import { AgentWorkbench } from '@/components/AgentWorkbench'
import { rupiah, durasiMenit } from '@/lib/format'

const SLUG_UTAMA = 'ai-agent-self-host'

function Panah() {
  return <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">↗</span>
}

export default function Beranda() {
  const kelas = ambilKelas(SLUG_UTAMA)
  if (!kelas) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-28 text-center">
        <span className="kicker text-redup">KELAS NIUMINATION</span>
        <h1 className="display-serif mt-4 text-4xl">Belum ada kelas yang diterbitkan.</h1>
        <p className="mt-4 text-redup">
          Tambahkan folder kelas di <code className="mono rounded bg-panel-2 px-1.5 py-0.5">content/</code> untuk mulai membangun kurikulum.
        </p>
      </div>
    )
  }

  const modulGratis = kelas.modul.filter((modul) => modul.akses === 'gratis').length
  const modulPremium = kelas.modul.filter((modul) => modul.akses === 'berbayar').length

  return (
    <>
      <section className="hero-shell">
        <span className="hero-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-14 sm:pb-12 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.95fr] lg:gap-10">
            <div className="max-w-2xl">
              <div className="kicker mb-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[#c9d7bc]">
                <span className="inline-flex items-center gap-2"><span className="signal-dot" /> PROGRAM BELAJAR / 001</span>
                <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" aria-hidden="true" />
                <span className="text-white/55">AI AGENT SELF-HOST</span>
              </div>

              <h1 className="display-serif max-w-[11ch] text-[clamp(3.2rem,7vw,6.25rem)] leading-[0.98] text-[#f4f4e9]">
                Bangun AI yang <em className="font-normal text-[#d9ed8e]">bekerja</em> di mesinmu.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#d4ddd0]/80 sm:text-lg sm:leading-8">
                Dari model lokal pertama sampai agent yang bisa memakai tool—lalu pahami cara membuatnya lebih aman, terukur, dan siap dipakai.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/belajar/${kelas.slug}`} className="button-primary group">
                  Mulai dari fondasi gratis <Panah />
                </Link>
                <Link href={`/kelas/${kelas.slug}`} className="button-secondary">
                  Jelajahi kurikulum <span aria-hidden="true">↓</span>
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#c6d1c2]/75">
                <span className="inline-flex items-center gap-2"><span className="text-[#d9ed8e]">✓</span> Bahasa Indonesia</span>
                <span className="inline-flex items-center gap-2"><span className="text-[#d9ed8e]">✓</span> Docs-driven</span>
                <span className="inline-flex items-center gap-2"><span className="text-[#d9ed8e]">✓</span> Tanpa video wajib</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[35rem] lg:ml-auto">
              <AgentWorkbench />
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/15 pt-4 text-[0.68rem] text-white/55">
                <span className="mono">PELAJARI ARSITEKTURNYA, BUKAN CUMA PROMPT-NYA</span>
                <span className="mono shrink-0 text-[#d9ed8e]">01 — 06</span>
              </div>
            </div>
          </div>

          <dl className="mt-16 grid grid-cols-2 border-t border-white/15 pt-7 sm:grid-cols-4">
            {[
              ['Modul', `${kelas.modul.length}`],
              ['Pelajaran', `${kelas.jumlahPelajaran}`],
              ['Fondasi gratis', `${kelas.jumlahGratis} pelajaran`],
              ['Estimasi belajar', durasiMenit(kelas.totalMenit)],
            ].map(([label, nilai]) => (
              <div key={label} className="border-r border-white/10 px-4 py-2 first:pl-0 last:border-0 sm:px-6">
                <dt className="kicker text-[0.59rem] text-white/45">{label}</dt>
                <dd className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">{nilai}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="kicker text-hijau">BELAJAR DENGAN KONTEKS</p>
            <h2 className="display-serif mt-4 max-w-[13ch] text-4xl leading-[1.08] sm:text-5xl">
              Tidak berhenti di <em>“hello world”.</em>
            </h2>
            <p className="mt-5 max-w-md leading-7 text-redup">
              Kita mulai dari pertanyaan sederhana—apa yang sebaiknya tetap di mesin sendiri?—lalu membangun sistemnya selangkah demi selangkah.
            </p>
            <Link href={`/kelas/${kelas.slug}`} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-hijau-gelap hover:text-hijau">
              Kenali kelasnya <Panah />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="kotak kotak-hover p-6 sm:p-7">
              <span className="mono text-xs text-hijau">01 / COBA DULU</span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">Fondasi tetap gratis.</h3>
              <p className="mt-3 text-sm leading-6 text-redup">
                Dua modul dan empat pelajaran untuk memasang Ollama, mengukur kemampuan mesin, lalu membuat agent pertamamu memanggil tool.
              </p>
              <div className="mt-6 border-t border-tepian pt-4 text-xs font-medium text-hijau-gelap">Tidak perlu memasukkan kartu pembayaran</div>
            </article>
            <article className="relative overflow-hidden rounded-2xl border border-[#35543e] bg-ink-2 p-6 text-white shadow-[var(--shadow-card)] sm:p-7">
              <span className="mono text-xs text-[#d9ed8e]">02 / BANGUN LEBIH JAUH</span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">Produksi, bukan sekadar demo.</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Empat modul premium membahas orkestrasi, konteks, guardrails, observability, evaluasi, deploy, dan proyek akhir.
              </p>
              <div className="mt-6 border-t border-white/15 pt-4 text-xs font-medium text-[#d9ed8e]">Akses seumur hidup + pembaruan</div>
              <span className="pointer-events-none absolute -bottom-12 -right-6 h-36 w-36 rounded-full border border-white/10" aria-hidden="true" />
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-tepian bg-panel/70">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <p className="kicker text-hijau">PETA BELAJAR / 06 MODUL</p>
            <h2 className="display-serif mt-4 max-w-[12ch] text-4xl leading-[1.08] sm:text-5xl">Kurikulum yang bisa kamu <em>jalankan.</em></h2>
            <p className="mt-5 max-w-md leading-7 text-redup">
              Setiap langkah punya tujuan yang bisa diuji. Materi premium ditampilkan sebagai judul kurikulum saja—isi lengkapnya hanya terbuka untuk peserta yang punya akses.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="mono rounded-full border border-hijau/20 bg-hijau/10 px-3 py-1.5 text-[0.67rem] text-hijau-gelap">{modulGratis} modul gratis</span>
              <span className="mono rounded-full border border-tepian bg-latar px-3 py-1.5 text-[0.67rem] text-redup">{modulPremium} modul premium</span>
            </div>
            <Link href={`/kelas/${kelas.slug}`} className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-hijau-gelap hover:text-hijau">
              Lihat detail kelas <Panah />
            </Link>
          </div>
          <div>
            <Kurikulum kelas={kelas} ringkas />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker text-hijau">RITME BELAJAR</p>
          <h2 className="display-serif mt-4 text-4xl leading-tight sm:text-5xl">Baca. Jalankan. <em>Pahami.</em></h2>
          <p className="mt-4 text-redup">Dibuat untuk belajar aktif—bukan menonton tab yang menumpuk.</p>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {[
            {
              nomor: '01',
              judul: 'Dokumentasi yang bisa dicari',
              isi: 'Materi tertulis dengan contoh yang dapat disalin, diulang, dan dirujuk lagi saat kamu membangun proyek sendiri.',
            },
            {
              nomor: '02',
              judul: 'Tugas menghasilkan artefak',
              isi: 'Setiap modul mendorongmu membuat sesuatu yang bisa diperiksa: hasil pengukuran, agent yang memakai tool, atau guardrail.',
            },
            {
              nomor: '03',
              judul: 'Progres yang tercatat',
              isi: 'Tandai pelajaran selesai, uji pemahaman lewat kuis, dan terbitkan sertifikat bernomor unik setelah semua syarat terpenuhi.',
            },
          ].map((item) => (
            <article key={item.nomor} className="rounded-2xl border border-tepian bg-panel p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="mono text-xs text-hijau">{item.nomor}</span>
                <span className="h-px w-12 bg-tepian" aria-hidden="true" />
              </div>
              <h3 className="mt-7 text-lg font-semibold tracking-tight">{item.judul}</h3>
              <p className="mt-3 text-sm leading-6 text-redup">{item.isi}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-9 text-white sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute -right-12 -top-28 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute -right-2 -top-18 h-60 w-60 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="kicker text-[#d9ed8e]">MULAI TANPA TARUHAN</p>
              <h2 className="display-serif mt-3 max-w-[15ch] text-4xl leading-[1.08] sm:text-5xl">Buktikan dulu di mesinmu sendiri.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
                Baca empat pelajaran fondasi secara gratis. Jika pendekatannya cocok, lanjutkan ke materi premium untuk membangun sistem yang lebih lengkap.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={`/belajar/${kelas.slug}`} className="button-primary group whitespace-nowrap">Mulai belajar <Panah /></Link>
              <Link href="/harga" className="button-secondary whitespace-nowrap">Lihat rincian harga <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="relative mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-5 text-xs text-white/50">
            <span>{kelas.instruktur}</span>
            <span className="mono">{kelas.jumlahPelajaran} PELAJARAN · {durasiMenit(kelas.totalMenit)} · {rupiah(kelas.harga)} UNTUK AKSES PREMIUM</span>
          </div>
        </div>
      </section>
    </>
  )
}

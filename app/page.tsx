import Link from 'next/link'
import { ambilKelas } from '@/lib/kurikulum'
import { Kurikulum } from '@/components/Kurikulum'
import { Lencana } from '@/components/Lencana'
import { rupiah, durasiMenit } from '@/lib/format'

const SLUG_UTAMA = 'ai-agent-self-host'

export default function Beranda() {
  const kelas = ambilKelas(SLUG_UTAMA)
  if (!kelas) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold">Belum ada kelas</h1>
        <p className="mt-3 text-redup">
          Tambahkan folder di <code className="mono">content/</code> lengkap dengan{' '}
          <code className="mono">kelas.json</code>.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-tepian">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              'radial-gradient(900px 420px at 15% -10%, rgba(74,222,128,0.16), transparent 65%), radial-gradient(700px 380px at 85% 0%, rgba(56,189,248,0.12), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="mono mb-5 flex flex-wrap items-center gap-2 text-xs">
            <Lencana anak="kelas gratis + berbayar" warna="hijau" />
            <Lencana anak="bahasa indonesia" />
            <Lencana anak="docs-driven · tanpa video" />
            <Lencana anak={kelas.status === 'terbit' ? 'sudah terbit' : 'pra-rilis'} warna="kuning" />
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            <span className="teks-gradien">{kelas.judul}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-redup">{kelas.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/belajar/${kelas.slug}`}
              className="mono rounded-md border border-hijau/50 bg-hijau/15 px-6 py-3 text-sm font-semibold text-hijau transition-colors hover:bg-hijau/25"
            >
              Mulai gratis →
            </Link>
            <Link
              href="/harga"
              className="mono rounded-md border border-tepian px-6 py-3 text-sm transition-colors hover:border-redup/50 hover:bg-panel-2"
            >
              Lihat harga
            </Link>
          </div>

          <dl className="mono mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-4">
            {[
              ['Modul gratis', `${kelas.modul.filter((m) => m.akses === 'gratis').length}`],
              ['Pelajaran', `${kelas.jumlahPelajaran}`],
              ['Total baca', durasiMenit(kelas.totalMenit)],
              ['Sertifikat', 'verifikasi publik'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.7rem] uppercase tracking-wider text-redup">{k}</dt>
                <dd className="mt-0.5 text-base font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Garis gratis | berbayar ──────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="kotak overflow-hidden">
          <div className="grid sm:grid-cols-2">
            <div className="border-b border-tepian p-7 sm:border-b-0 sm:border-r">
              <div className="mono mb-3 text-xs font-bold uppercase tracking-wider text-hijau">
                Gratis — fondasi
              </div>
              <h3 className="text-lg font-semibold">Sampai agent-mu benar-benar jalan</h3>
              <p className="mt-2 text-sm text-redup">
                Kamu berhak tahu dulu apakah mesinmu sanggup dan apakah gaya materi ini cocok. Empat modul
                pertama berakhir dengan sesuatu yang nyata: agent lokal yang memanggil tool dan menyimpan
                kunci API dengan aman.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-redup">
                <li>✓ Kapan self-host masuk akal — dan kapan tidak</li>
                <li>✓ Ollama: pasang, pilih model, ukur kecepatan</li>
                <li>✓ Tool calling + loop agent pertama</li>
                <li>✓ BYOK & keamanan kunci</li>
              </ul>
            </div>
            <div className="p-7">
              <div className="mono mb-3 text-xs font-bold uppercase tracking-wider text-kuning">
                Berbayar — produksi
              </div>
              <h3 className="text-lg font-semibold">Sampai sistem itu layak dipakai orang lain</h3>
              <p className="mt-2 text-sm text-redup">
                Jarak antara prototype di laptop dan sistem yang berjalan tanpa kamu duduk di sebelahnya:
                orkestrasi, memory, guardrails, evaluasi, dan deploy. Ditutup proyek akhir yang direview dan
                sertifikat yang bisa diverifikasi publik.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-redup">
                <li>→ Anatomi agent &amp; multi-agent orchestration</li>
                <li>→ Memory, retrieval, dan tool ecosystem</li>
                <li>→ Guardrails, izin, dan jejak audit</li>
                <li>→ Observability, evaluasi, deploy produksi</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kurikulum ────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Kurikulum</h2>
          <Link href={`/kelas/${kelas.slug}`} className="mono text-sm text-hijau hover:underline">
            detail kelas →
          </Link>
        </div>
        <Kurikulum kelas={kelas} />
      </section>

      {/* ── Untuk siapa ──────────────────────────────────── */}
      <section className="border-y border-tepian bg-panel/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Ini cocok kalau kamu…</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                judul: 'Punya data yang tidak boleh keluar',
                isi: 'Dokumen kepegawaian, draf peraturan, catatan medis, kode yang belum rilis. Self-host menghentikan aliran data di mesinmu — bukan dengan perjanjian, tapi karena memang tidak ada yang dikirim.',
              },
              {
                judul: 'Sudah lelah dengan tutorial yang berhenti di "hello world"',
                isi: 'Kelas ini berakhir di sistem yang punya batas giliran, jejak audit, dan hitungan biaya. Bagian yang tidak glamor itulah yang membedakan demo dari sistem.',
              },
              {
                judul: 'Ingin paham cara kerjanya, bukan hanya memakainya',
                isi: 'Kamu akan berhadapan langsung dengan kuantisasi, konteks yang penuh, dan model kecil yang mengarang fakta. Semua itu berguna meski nanti kamu tetap memilih API cloud.',
              },
            ].map((k) => (
              <div key={k.judul} className="kotak kotak-hover p-6">
                <div className="mono mb-3 text-hijau">◇</div>
                <h3 className="mb-2 font-semibold">{k.judul}</h3>
                <p className="text-sm text-redup">{k.isi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cara belajar ─────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">Cara kelas ini berjalan</h2>
        <div className="space-y-5">
          {[
            ['Baca + jalankan', 'Materi berupa teks dan kode yang bisa di-copy. Tidak ada video yang wajib ditonton, tidak ada langkah yang hanya ada di dalam rekaman.'],
            ['Tugas menghasilkan artefak', 'Setiap modul berakhir dengan sesuatu yang bisa kamu tunjukkan: agent yang jalan, hasil pengukuran, atau guardrail yang menolak permintaan berbahaya.'],
            ['Kuis & sertifikat', 'Kuis per modul dinilai di server. Lulus semua dan selesaikan proyek akhir → sertifikat bernomor unik yang bisa diverifikasi siapa pun di /verify.'],
          ].map(([j, i], n) => (
            <div key={j} className="flex gap-5">
              <span className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hijau/40 bg-hijau/10 text-sm font-bold text-hijau">
                {n + 1}
              </span>
              <div>
                <h3 className="font-semibold">{j}</h3>
                <p className="mt-1 text-sm text-redup">{i}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Harga ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="kotak p-8">
          <div className="mono mb-2 text-xs font-bold uppercase tracking-wider text-kuning">
            {kelas.tahapHarga}
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">{rupiah(kelas.harga)}</span>
            {kelas.hargaAsli && (
              <span className="text-lg text-redup line-through">{rupiah(kelas.hargaAsli)}</span>
            )}
            <span className="mono text-sm text-hijau">akses selamanya + pembaruan</span>
          </div>
          <p className="mt-4 text-sm text-redup">
            Harga naik bertahap mengikuti kelengkapan materi. Yang sudah membeli tetap mendapat semua
            pembaruan tanpa biaya tambahan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/harga"
              className="mono rounded-md border border-hijau/50 bg-hijau/15 px-6 py-2.5 text-sm font-semibold text-hijau hover:bg-hijau/25"
            >
              Lihat tahap harga →
            </Link>
            <Link
              href={`/belajar/${kelas.slug}`}
              className="mono rounded-md border border-tepian px-6 py-2.5 text-sm hover:bg-panel-2"
            >
              Coba 4 modul gratis dulu
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

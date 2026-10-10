import Link from 'next/link'
import { ambilKelas } from '@/lib/kurikulum'
import { TombolBeli } from '@/components/TombolBeli'
import { CatatanDemo } from '@/components/CatatanDemo'
import { penggunaAktif, punyaAkses } from '@/lib/supabase/server'
import { rupiah } from '@/lib/format'

export const metadata = { title: 'Harga' }

const TAHAP = [
  {
    harga: 99000,
    nama: 'Early bird',
    syarat: '50 pembeli pertama atau 2 minggu sejak launch',
    isi: 'Fondasi gratis + seluruh modul berbayar yang sudah terbit, kuis, sertifikat, pembaruan selamanya',
    aktif: true,
  },
  {
    harga: 199000,
    nama: 'Tahap 2',
    syarat: 'Setelah modul B1–B4 lengkap',
    isi: 'Sama seperti early bird, ditambah bank soal kuis lengkap',
  },
  {
    harga: 299000,
    nama: 'Tahap 3',
    syarat: 'Setelah semua modul lengkap',
    isi: 'Termasuk repositori contoh lengkap dan templat proyek akhir',
  },
  {
    harga: 499000,
    nama: 'Tahap 4',
    syarat: 'Ditambah sesi live & review kode berkala',
    isi: 'Termasuk sesi tanya jawab langsung dan review proyek akhir',
  },
]

const FAQ = [
  {
    t: 'Apa bedanya gratis dan berbayar?',
    j: 'Empat modul pertama gratis dan berakhir dengan agent yang benar-benar berjalan di mesinmu. Tujuh modul berikutnya mengubah percobaan itu menjadi sistem yang bisa dipakai orang lain: orkestrasi, memory, guardrails, evaluasi, dan deploy produksi.',
  },
  {
    t: 'Kalau saya beli di tahap awal, apa dapat materi yang belum selesai?',
    j: 'Ya. Satu kali beli, semua pembaruan berikutnya tetap kamu dapat tanpa biaya tambahan. Itu sebabnya harganya naik bertahap — yang beli lebih awal mengambil risiko materi belum lengkap, dan dikompensasi dengan harga lebih murah.',
  },
  {
    t: 'Bisakah saya minta refund?',
    j: 'Bisa, dalam 7 hari sejak pembelian, selama progres belajarmu belum melewati 30%. Tujuannya sederhana: kamu punya waktu untuk memutuskan, tapi tidak untuk mengambil seluruh isi kelas lalu mengembalikannya.',
  },
  {
    t: 'Saya tidak punya GPU. Apakah kelas ini masih berguna?',
    j: 'Masih. Modul G2 justru mengajarkan cara mengukur kemampuan mesinmu lebih dulu, dan menjalankan model 3B di CPU adalah jalur yang sah. Bagian produksi (B7) membahas pilihan server dengan dan tanpa GPU.',
  },
  {
    t: 'Apakah ada kelas untuk instansi?',
    j: 'Ada jalur terpisah dengan laporan kehadiran, sertifikat per peserta, dan penagihan ke instansi. Hubungi lewat halaman kontak di niumination.web.id.',
  },
]

export default async function HalamanHarga() {
  const kelas = ambilKelas('ai-agent-self-host')
  const pengguna = await penggunaAktif()
  const sudahPunya = kelas && pengguna ? await punyaAkses(kelas.slug) : false

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <CatatanDemo ringkas />
      <h1 className="text-3xl font-bold tracking-tight">Harga</h1>
      <p className="mt-3 max-w-2xl text-redup">
        Fondasinya selalu gratis. Yang kamu bayar adalah bagian yang mengubah percobaan menjadi sistem:
        orkestrasi, keamanan, evaluasi, dan deploy produksi. Harga naik bertahap mengikuti kelengkapan
        materi — yang sudah membeli tetap mendapat semua pembaruan.
      </p>

      {sudahPunya && kelas && (
        <div className="kotak mt-8 border-hijau/40 p-5">
          <span className="mono text-xs font-bold uppercase tracking-wider text-hijau">akses aktif</span>
          <p className="mt-1 text-sm text-redup">
            Kamu sudah memiliki {kelas.judul}.{' '}
            <Link href={`/belajar/${kelas.slug}`} className="text-hijau hover:underline">
              Lanjut belajar →
            </Link>
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TAHAP.map((t) => (
          <div
            key={t.nama}
            className={`kotak p-6 ${t.aktif ? 'border-hijau/50' : ''}`}
            style={t.aktif ? { background: 'rgba(74,222,128,0.04)' } : undefined}
          >
            <div className="flex items-baseline justify-between">
              <span className="mono text-xs uppercase tracking-wider text-redup">{t.nama}</span>
              {t.aktif && (
                <span className="mono rounded bg-hijau/15 px-2 py-0.5 text-[0.65rem] text-hijau">
                  sekarang
                </span>
              )}
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tight">{rupiah(t.harga)}</div>
            <div className="mono mt-1 text-xs text-hijau">akses selamanya</div>
            <p className="mt-4 text-sm text-redup">{t.syarat}</p>
            <p className="mt-2 text-sm">{t.isi}</p>
            {t.aktif && !sudahPunya && kelas && (
              <div className="mt-5">
                <TombolBeli slugKelas={kelas.slug} label={`Ambil harga ${rupiah(t.harga)}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="kotak mt-6 p-6">
        <div className="mono text-xs uppercase tracking-wider text-kuning">jalur instansi</div>
        <p className="mt-2 text-sm text-redup">
          Untuk dinas, Bappeda, atau organisasi yang butuh laporan kehadiran, sertifikat per peserta, dan
          penagihan ke instansi — penawaran disusun terpisah, dengan materi yang sama.
        </p>
      </div>

      <h2 className="mt-16 text-xl font-semibold">Pertanyaan yang sering muncul</h2>
      <div className="mt-6 space-y-4">
        {FAQ.map((f) => (
          <details key={f.t} className="kotak group p-5">
            <summary className="cursor-pointer font-medium marker:text-hijau">{f.t}</summary>
            <p className="mt-3 text-sm text-redup">{f.j}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

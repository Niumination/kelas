import Link from 'next/link'

export const metadata = { title: 'Kebijakan & refund' }

const BAGIAN = [
  {
    id: 'materi-gratis',
    judul: 'Materi gratis',
    isi: 'Dua modul fondasi pertama berisi empat pelajaran dan dapat dibaca siapa pun tanpa akun. Materi gratis serta kode sumber terkait dilisensikan MIT: boleh dipakai, diubah, dan diajarkan ulang dengan mencantumkan sumber.',
  },
  {
    id: 'materi-premium',
    judul: 'Materi premium',
    isi: 'Satu kali pembayaran memberi akses selamanya ke kelas tersebut, termasuk pembaruan berikutnya. Pembelian di tahap lebih awal tidak dikenakan biaya tambahan untuk materi yang terbit belakangan. Materi premium hanya dapat diakses oleh akun yang memiliki entitlement aktif.',
  },
  {
    id: 'refund',
    judul: 'Refund',
    isi: 'Permintaan refund diterima dalam 7 hari sejak pembelian selama progres belajar belum melewati 30% pelajaran. Refund diproses ke metode pembayaran asal dalam 5–10 hari kerja. Hubungi kami melalui kanal yang tercantum di situs utama Niumination dengan menyertakan email akun dan bukti transaksi.',
  },
  {
    id: 'sertifikat',
    judul: 'Sertifikat',
    isi: 'Sertifikat dapat diklaim setelah seluruh pelajaran selesai dan semua kuis wajib lulus; modul proyek akhir merupakan bagian dari kurikulum. Setiap sertifikat memiliki nomor unik yang dapat diverifikasi publik di halaman Verifikasi. Sertifikat dapat dibatalkan bila ditemukan pelanggaran, termasuk plagiarisme pada tugas atau proyek.',
  },
  {
    id: 'data-pribadi',
    judul: 'Data pribadi',
    isi: 'Kami menyimpan email, nama tampilan, dan catatan progres belajar yang diperlukan untuk menjalankan layanan. Data pembayaran diproses oleh Midtrans dan tidak disimpan sebagai nomor kartu di server kelas. Data pribadi tidak dijual kepada pihak ketiga.',
  },
  {
    id: 'batas-tanggung-jawab',
    judul: 'Batas tanggung jawab',
    isi: 'Materi disusun sebaik mungkin, tetapi teknologi berubah cepat. Contoh kode harus diuji di lingkunganmu sendiri sebelum digunakan untuk pekerjaan penting, terutama yang menyangkut keamanan, data sensitif, atau keputusan berdampak tinggi.',
  },
]

export default function Kebijakan() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <header className="relative overflow-hidden rounded-[1.5rem] bg-ink px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="kicker text-[#d9ed8e]">TRANSPARANSI / NIUMINATION</p>
            <h1 className="display-serif mt-4 max-w-[12ch] text-5xl leading-[1.04] sm:text-6xl">Kebijakan &amp; refund.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">Informasi tentang akses materi, pembayaran, data, dan sertifikat kelas.</p>
          </div>
          <p className="mono text-[0.63rem] text-white/50">TERAKHIR DIPERBARUI · 11 OKTOBER 2026</p>
        </div>
      </header>

      <div className="mt-9 grid gap-9 lg:grid-cols-[15rem_1fr] lg:gap-14">
        <aside className="h-fit rounded-2xl border border-tepian bg-panel p-5 lg:sticky lg:top-28">
          <p className="kicker text-hijau">DAFTAR ISI</p>
          <nav aria-label="Daftar isi kebijakan" className="mt-4 grid gap-1.5">
            {BAGIAN.map((bagian, index) => (
              <a key={bagian.id} href={`#${bagian.id}`} className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-redup transition-colors hover:bg-panel-2 hover:text-teks">
                <span className="mono text-[0.62rem] text-hijau">0{index + 1}</span>{bagian.judul}
              </a>
            ))}
          </nav>
        </aside>

        <div className="max-w-3xl divide-y divide-tepian rounded-2xl border border-tepian bg-panel px-5 sm:px-8">
          {BAGIAN.map((bagian, index) => (
            <section key={bagian.id} id={bagian.id} className="scroll-mt-28 py-6 sm:py-7">
              <div className="flex items-start gap-4">
                <span className="mono mt-1 text-[0.66rem] text-hijau">0{index + 1}</span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{bagian.judul}</h2>
                  <p className="mt-2 text-sm leading-7 text-redup">{bagian.isi}</p>
                </div>
              </div>
            </section>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-redup">
            <span>Butuh informasi lain?</span>
            <Link href="https://niumination.web.id" target="_blank" rel="noreferrer" className="font-semibold text-hijau-gelap hover:underline">Kunjungi Niumination ↗</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

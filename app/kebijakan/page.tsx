export const metadata = { title: 'Kebijakan & refund' }

const BAGIAN = [
  {
    j: 'Materi gratis',
    p: 'Empat modul pertama dapat dibaca siapa pun secara gratis. Materi gratis dilisensikan MIT bersama kode sumbernya: boleh dipakai, diubah, dan diajarkan ulang, dengan mencantumkan sumber.',
  },
  {
    j: 'Materi berbayar',
    p: 'Satu kali pembayaran memberi akses selamanya ke kelas tersebut, termasuk seluruh pembaruan berikutnya. Harga naik bertahap; pembelian di tahap lebih awal tidak dikenakan biaya tambahan untuk materi yang terbit belakangan.',
  },
  {
    j: 'Refund',
    p: 'Permintaan refund diterima dalam 7 hari sejak pembelian, selama progres belajar belum melewati 30% pelajaran. Refund diproses ke metode pembayaran asal dalam 5–10 hari kerja.',
  },
  {
    j: 'Sertifikat',
    p: 'Sertifikat diterbitkan setelah semua kuis lulus dan proyek akhir disetujui. Setiap sertifikat memiliki nomor unik yang dapat diverifikasi publik di /verify. Sertifikat dapat dibatalkan bila ditemukan pelanggaran, misalnya plagiarisme pada proyek akhir.',
  },
  {
    j: 'Data pribadi',
    p: 'Kami menyimpan hanya email, nama tampilan, dan catatan progres belajar. Data pembayaran diproses oleh Midtrans dan tidak disimpan di server kelas. Tidak ada data yang dijual kepada pihak ketiga.',
  },
  {
    j: 'Batas tanggung jawab',
    p: 'Materi disusun sebaik mungkin, tetapi teknologi ini berubah cepat. Contoh kode harus diuji di lingkunganmu sendiri sebelum dipakai untuk pekerjaan yang penting, terutama yang menyangkut keamanan.',
  },
]

export default function Kebijakan() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Kebijakan &amp; refund</h1>
      <p className="mono mt-2 text-sm text-redup">Terakhir diperbarui: Oktober 2026</p>
      <div className="mt-10 space-y-8">
        {BAGIAN.map((b) => (
          <section key={b.j}>
            <h2 className="text-lg font-semibold">{b.j}</h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-[#cfd5dd]">{b.p}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

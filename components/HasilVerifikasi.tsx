import { klienServer } from '@/lib/supabase/server'
import { CatatanDemo } from './CatatanDemo'

interface Baris {
  nomor: string
  nama: string
  judul_kelas: string
  terbit_pada: string
  status: string
}

/** Membaca lewat RPC publik; data email atau profil privat tidak pernah ditampilkan. */
export async function HasilVerifikasi({ nomor }: { nomor: string }) {
  const sb = await klienServer()

  if (!sb) {
    return (
      <div>
        <CatatanDemo ringkas />
        <div className="rounded-2xl border border-tepian bg-panel p-5 sm:p-6">
          <span className="kicker text-kuning">DATABASE BELUM TERHUBUNG</span>
          <p className="mt-3 text-sm leading-6 text-redup">Verifikasi publik memerlukan koneksi database. Dalam mode demo, data sertifikat belum dapat ditampilkan.</p>
        </div>
      </div>
    )
  }

  const { data, error } = await sb.rpc('verifikasi_sertifikat', { p_nomor: nomor })
  const baris = (Array.isArray(data) ? data[0] : data) as Baris | null

  if (error || !baris) {
    return (
      <div className="rounded-2xl border border-merah/20 bg-merah/5 p-5 sm:p-6">
        <span className="mono inline-flex items-center gap-2 rounded-full bg-merah/10 px-3 py-1 text-[0.63rem] font-bold uppercase tracking-[0.1em] text-merah">
          <span className="h-1.5 w-1.5 rounded-full bg-merah" /> Tidak ditemukan
        </span>
        <h2 className="mt-4 text-lg font-semibold">Nomor sertifikat tidak terdaftar.</h2>
        <p className="mt-2 text-sm leading-6 text-redup">Nomor <span className="mono break-all text-teks">{nomor}</span> tidak cocok dengan catatan sertifikat aktif. Periksa kembali penulisannya—huruf O dan angka 0 sering tertukar.</p>
      </div>
    )
  }

  const aktif = baris.status === 'aktif'
  const tanggal = new Date(baris.terbit_pada).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="overflow-hidden rounded-2xl border border-tepian bg-panel shadow-[var(--shadow-card)]">
      <div className={`flex flex-wrap items-center justify-between gap-4 border-b p-5 sm:px-6 sm:py-5 ${aktif ? 'border-hijau/15 bg-hijau/5' : 'border-merah/15 bg-merah/5'}`}>
        <div>
          <span className="kicker text-redup">HASIL VERIFIKASI PUBLIK</span>
          <p className="mono mt-1 break-all text-base font-bold tracking-wide text-teks sm:text-lg">{baris.nomor}</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${aktif ? 'border-hijau/20 bg-panel text-hijau-gelap' : 'border-merah/20 bg-panel text-merah'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${aktif ? 'bg-hijau' : 'bg-merah'}`} />
          {aktif ? 'Sertifikat aktif' : `Status: ${baris.status}`}
        </span>
      </div>
      <dl className="divide-y divide-tepian">
        {[
          ['Nama penerima', baris.nama],
          ['Kelas', baris.judul_kelas],
          ['Tanggal terbit', tanggal],
        ].map(([label, nilai]) => (
          <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:px-6">
            <dt className="text-xs font-medium text-redup">{label}</dt>
            <dd className="text-sm font-semibold">{nilai}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-tepian px-5 py-3 text-[0.68rem] leading-5 text-redup sm:px-6">Hanya nama, kelas, dan tanggal terbit yang ditampilkan. Data akun lainnya tetap privat.</p>
    </section>
  )
}

import { klienServer } from '@/lib/supabase/server'
import { CatatanDemo } from './CatatanDemo'

interface Baris {
  nomor: string
  nama: string
  judul_kelas: string
  terbit_pada: string
  status: string
}

/** Membaca lewat RPC publik — tidak boleh mengembalikan email atau data pribadi lain. */
export async function HasilVerifikasi({ nomor }: { nomor: string }) {
  const sb = await klienServer()

  if (!sb) {
    return (
      <div>
        <CatatanDemo ringkas />
        <div className="kotak p-6">
          <p className="text-sm text-redup">
            Verifikasi memerlukan koneksi database. Mode demo aktif, jadi data sertifikat belum bisa
            ditampilkan.
          </p>
        </div>
      </div>
    )
  }

  const { data, error } = await sb.rpc('verifikasi_sertifikat', { p_nomor: nomor })
  const baris = (Array.isArray(data) ? data[0] : data) as Baris | null

  if (error || !baris) {
    return (
      <div
        className="kotak p-6"
        style={{ borderColor: 'rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.05)' }}
      >
        <div className="mono mb-2 text-xs font-bold uppercase tracking-wider text-merah">
          tidak ditemukan
        </div>
        <p className="text-sm text-redup">
          Nomor <span className="mono text-teks">{nomor}</span> tidak terdaftar. Periksa kembali
          penulisannya — huruf O dan angka 0 sering tertukar.
        </p>
      </div>
    )
  }

  return (
    <div className="kotak overflow-hidden">
      <div className="flex items-center justify-between border-b border-tepian px-6 py-4">
        <div>
          <div className="mono text-[0.7rem] uppercase tracking-wider text-redup">nomor sertifikat</div>
          <div className="mono mt-0.5 text-lg font-bold text-hijau">{baris.nomor}</div>
        </div>
        <span className="mono rounded bg-hijau/15 px-3 py-1 text-xs text-hijau">
          {baris.status === 'aktif' ? '✓ aktif' : baris.status}
        </span>
      </div>
      <dl className="divide-y divide-tepian">
        {[
          ['Nama', baris.nama],
          ['Kelas', baris.judul_kelas],
          [
            'Diterbitkan',
            new Date(baris.terbit_pada).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          ],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-6 py-3.5">
            <dt className="text-sm text-redup">{k}</dt>
            <dd className="text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

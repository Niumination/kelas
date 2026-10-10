import Link from 'next/link'
import { daftarKelas } from '@/lib/kurikulum'
import { Lencana } from '@/components/Lencana'
import { rupiah, durasiMenit } from '@/lib/format'

export const metadata = { title: 'Semua kelas' }

export default function DaftarKelas() {
  const semua = daftarKelas()
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Kelas</h1>
      <p className="mt-2 max-w-2xl text-redup">
        Fondasi selalu gratis. Yang berbayar adalah bagian yang mengubah percobaan menjadi sistem yang bisa
        dipakai orang lain.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {semua.map((k) => (
          <Link key={k.slug} href={`/kelas/${k.slug}`} className="kotak kotak-hover block p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <Lencana anak={`${k.jumlahGratis} modul gratis`} warna="hijau" />
              <Lencana anak={k.level.split(' ')[0]} />
              <Lencana anak={durasiMenit(k.totalMenit)} />
            </div>
            <h2 className="text-xl font-semibold">{k.judul}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-redup">{k.deskripsi}</p>
            <div className="mono mt-5 flex items-center justify-between text-sm">
              <span className="text-hijau">{rupiah(k.harga)}</span>
              <span className="text-redup">Lihat →</span>
            </div>
          </Link>
        ))}
        {semua.length === 0 && (
          <p className="text-redup">Belum ada kelas yang diterbitkan.</p>
        )}
      </div>
    </div>
  )
}

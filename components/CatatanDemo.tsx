import { SUPABASE_AKTIF } from '@/lib/supabase/konfigurasi'

/**
 * Ditampilkan saat env Supabase belum diisi: konten tetap terbaca penuh,
 * hanya fitur akun & pembayaran yang nonaktif.
 */
export function CatatanDemo({ ringkas = false }: { ringkas?: boolean }) {
  if (SUPABASE_AKTIF) return null
  return (
    <div
      className="mb-6 rounded-lg border px-4 py-3 text-sm"
      style={{ borderColor: 'rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.06)' }}
    >
      <span className="mono text-[0.7rem] font-bold uppercase tracking-wider text-kuning">mode demo</span>
      {ringkas ? (
        <span className="ml-2 text-redup">Login & pembayaran nonaktif — materi tetap bisa dibaca.</span>
      ) : (
        <p className="mt-1 text-redup">
          Variabel Supabase belum diisi, jadi akun, progres, dan pembayaran belum menyala. Seluruh materi
          tetap bisa dibaca. Isi <code className="mono text-teks">.env.local</code> lalu jalankan ulang untuk
          mengaktifkan fitur penuh (lihat README).
        </p>
      )}
    </div>
  )
}

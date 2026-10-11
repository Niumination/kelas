import { SUPABASE_AKTIF } from '@/lib/supabase/konfigurasi'

/** Akun dan transaksi nonaktif tanpa env Supabase; konten gratis tetap terbaca. */
export function CatatanDemo({ ringkas = false }: { ringkas?: boolean }) {
  if (SUPABASE_AKTIF) return null

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-kuning/20 bg-kuning/5 px-4 py-3 text-sm">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-kuning/10 text-xs font-bold text-kuning" aria-hidden="true">i</span>
      <div className="min-w-0">
        <span className="mono text-[0.63rem] font-bold uppercase tracking-[0.12em] text-kuning">Mode demo</span>
        {ringkas ? (
          <span className="ml-2 text-xs leading-5 text-redup">Akun, progres tersimpan, dan pembayaran belum diaktifkan. Materi gratis tetap bisa dibaca.</span>
        ) : (
          <p className="mt-1 text-xs leading-6 text-redup">
            Variabel Supabase belum diisi, jadi login, progres tersimpan, dan pembayaran belum aktif. Materi gratis tetap bisa dibaca. Untuk konfigurasi lengkap, siapkan <code className="mono rounded bg-panel px-1 py-0.5 text-teks">.env.local</code> sesuai README.
          </p>
        )}
      </div>
    </div>
  )
}

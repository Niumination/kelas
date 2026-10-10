import { HasilVerifikasi } from '@/components/HasilVerifikasi'
import { SUPABASE_AKTIF } from '@/lib/supabase/konfigurasi'

export const metadata = { title: 'Verifikasi sertifikat' }

export default async function HalamanVerifikasi({
  searchParams,
}: {
  searchParams: Promise<{ nomor?: string }>
}) {
  const { nomor } = await searchParams
  const bersih = (nomor ?? '').trim()

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Verifikasi sertifikat</h1>
      <p className="mt-2 text-sm text-redup">
        Masukkan nomor sertifikat untuk memastikan keasliannya. Hanya nama, kelas, dan tanggal terbit
        yang ditampilkan — tidak ada data pribadi lain.
      </p>

      <form method="get" action="/verify" className="mt-8 flex gap-3">
        <input
          type="text"
          name="nomor"
          defaultValue={bersih}
          placeholder="NIUM-2026-AIAGENT-XXXXXX"
          className="mono min-w-0 flex-1 rounded-md border border-tepian bg-panel px-4 py-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-redup/60 focus:border-hijau/50"
        />
        <button
          type="submit"
          className="mono rounded-md border border-hijau/50 bg-hijau/15 px-6 py-3 text-sm font-semibold text-hijau hover:bg-hijau/25"
        >
          Periksa
        </button>
      </form>

      {!SUPABASE_AKTIF && (
        <p className="mono mt-3 text-xs text-kuning">
          Mode demo — verifikasi baru bekerja setelah database dikonfigurasi.
        </p>
      )}

      {bersih && (
        <div className="mt-10">
          <HasilVerifikasi nomor={bersih} />
        </div>
      )}
    </div>
  )
}

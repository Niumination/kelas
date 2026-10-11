import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FormMasuk } from '@/components/FormMasuk'
import { SUPABASE_AKTIF } from '@/lib/supabase/konfigurasi'
import { penggunaAktif } from '@/lib/supabase/server'

export const metadata = { title: 'Masuk' }

function tujuanAman(nilai?: string) {
  if (!nilai || !nilai.startsWith('/') || nilai.startsWith('//')) return '/dashboard'
  return nilai
}

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string }>
}) {
  const { lanjut } = await searchParams
  const tujuan = tujuanAman(lanjut)
  const pengguna = await penggunaAktif()
  if (pengguna) redirect(tujuan)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="grid overflow-hidden rounded-[1.5rem] border border-tepian bg-panel shadow-[var(--shadow-lift)] lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-ink p-6 text-white sm:p-9 lg:min-h-[43rem] lg:p-12">
          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute -bottom-10 right-10 h-48 w-48 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative">
            <span className="kicker text-[#d9ed8e]">AKUN / RUANG BELAJAR</span>
            <h1 className="display-serif mt-5 max-w-[10ch] text-4xl leading-[1.08] sm:text-5xl">Belajar dengan ritmemu sendiri.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">Masuk untuk menyimpan progres, membuka materi premium, mengikuti kuis, dan mengelola sertifikatmu.</p>
          </div>
          <div className="relative mt-9 border-t border-white/15 pt-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d9ed8e] text-ink">
                <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M7 24V8l18 16V8" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
                  <path d="M7 8h5" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
              <div>
                <span className="block text-xs font-bold tracking-[0.14em]">NIUMINATION</span>
                <span className="mono block text-[0.58rem] tracking-[0.15em] text-white/50">KELAS / DOCS-DRIVEN</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="p-6 sm:p-9 lg:p-12">
          <div className="mx-auto max-w-md">
            <p className="kicker text-hijau">SELAMAT DATANG</p>
            <h2 className="display-serif mt-3 text-4xl leading-tight">Masuk ke akunmu.</h2>
            <p className="mt-3 text-sm leading-6 text-redup">Pilih cara masuk yang paling nyaman. Tidak perlu membuat kata sandi.</p>

            <div className="mt-8">
              <FormMasuk aktif={SUPABASE_AKTIF} lanjut={tujuan} />
            </div>

            <div className="mt-8 border-t border-tepian pt-5">
              <p className="text-xs leading-6 text-redup">
                Dengan masuk, kamu menyetujui kebijakan kelas. Materi gratis dapat dibaca siapa pun; materi premium hanya untuk peserta yang memiliki akses.
              </p>
              <Link href="/kebijakan" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-hijau-gelap hover:underline">
                Baca kebijakan &amp; refund <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

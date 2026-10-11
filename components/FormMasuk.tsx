'use client'

import { useState } from 'react'
import { klienBrowser } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/supabase/konfigurasi'

interface Props {
  aktif: boolean
  lanjut: string
}

function IkonGitHub() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="currentColor" aria-hidden="true">
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.31-3.76-1.31-.51-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.31 1.75 3.28 1.75.8 0 1.39-.16 1.9-.43.09-.7.4-1.18.73-1.45-2.47-.28-5.06-1.24-5.06-5.51 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.55.23 2.7.11 2.98.73.78 1.16 1.78 1.16 3.01 0 4.27-2.6 5.22-5.08 5.5.4.34.76 1.01.76 2.04v3.03c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  )
}

function IkonGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="h-[1.1rem] w-[1.1rem]" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.7-3.5-11.3-8.2H5.8v5.3A20.4 20.4 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.7 27.8a12.2 12.2 0 0 1 0-7.6v-5.3H5.8a20.4 20.4 0 0 0 0 18.2l6.9-5.3Z" />
      <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3l5.9-5.8C34.1 5.9 29.5 4 24 4A20.4 20.4 0 0 0 5.8 14.9l6.9 5.3C14.3 15.5 18.8 12 24 12Z" />
    </svg>
  )
}

export function FormMasuk({ aktif, lanjut }: Props) {
  const [email, setEmail] = useState('')
  const [tahap, setTahap] = useState<'diam' | 'memuat' | 'terkirim'>('diam')
  const [pesan, setPesan] = useState('')

  const redirectTo = `${SITE_URL}/auth/callback?lanjut=${encodeURIComponent(lanjut)}`

  async function oauth(penyedia: 'github' | 'google') {
    const sb = klienBrowser()
    if (!sb) {
      setPesan('Login belum bisa dimulai. Muat ulang halaman atau coba lagi nanti.')
      return
    }
    setTahap('memuat')
    setPesan('')
    const { error } = await sb.auth.signInWithOAuth({ provider: penyedia, options: { redirectTo } })
    if (error) {
      setPesan(error.message)
      setTahap('diam')
    }
  }

  async function tautanAjaib(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const sb = klienBrowser()
    if (!sb) {
      setPesan('Login belum bisa dimulai. Muat ulang halaman atau coba lagi nanti.')
      return
    }
    setTahap('memuat')
    setPesan('')
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    if (error) {
      setPesan(error.message)
      setTahap('diam')
    } else {
      setTahap('terkirim')
    }
  }

  if (!aktif) {
    return (
      <div className="rounded-2xl border border-kuning/20 bg-kuning/5 p-5 sm:p-6">
        <span className="mono rounded-full bg-kuning/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-kuning">Mode demo</span>
        <h2 className="mt-4 text-lg font-semibold">Akun belum diaktifkan.</h2>
        <p className="mt-2 text-sm leading-6 text-redup">
          Login, progres tersimpan, dan pembayaran membutuhkan konfigurasi Supabase. Kamu tetap bisa membaca materi gratis tanpa akun.
        </p>
        <p className="mt-3 text-xs leading-5 text-redup">
          Untuk mengaktifkannya, salin <code className="mono rounded bg-panel px-1.5 py-0.5 text-teks">.env.example</code> menjadi <code className="mono rounded bg-panel px-1.5 py-0.5 text-teks">.env.local</code>, isi URL dan anon key Supabase, lalu jalankan ulang server.
        </p>
      </div>
    )
  }

  if (tahap === 'terkirim') {
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-hijau/20 bg-hijau/5 p-6">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hijau/10 text-lg text-hijau-gelap" aria-hidden="true">✓</span>
        <h2 className="mt-4 text-xl font-semibold">Cek emailmu.</h2>
        <p className="mt-2 text-sm leading-6 text-redup">Tautan masuk sudah dikirim ke <span className="mono font-semibold text-teks">{email}</span>. Buka email itu di perangkat ini untuk melanjutkan.</p>
        <p className="mt-3 text-xs text-redup">Tautan hanya bisa digunakan sekali. Jika belum terlihat, periksa folder spam.</p>
      </div>
    )
  }

  return (
    <div aria-busy={tahap === 'memuat'}>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => oauth('github')}
          disabled={tahap === 'memuat'}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-tepian bg-panel px-4 py-3 text-sm font-semibold transition-colors hover:border-hijau/40 hover:bg-[#f7f7ef] disabled:cursor-wait disabled:opacity-60"
        >
          <IkonGitHub /> Lanjut dengan GitHub
        </button>
        <button
          type="button"
          onClick={() => oauth('google')}
          disabled={tahap === 'memuat'}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-tepian bg-panel px-4 py-3 text-sm font-semibold transition-colors hover:border-hijau/40 hover:bg-[#f7f7ef] disabled:cursor-wait disabled:opacity-60"
        >
          <IkonGoogle /> Lanjut dengan Google
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-[0.63rem] font-medium uppercase tracking-[0.12em] text-redup">
        <span className="h-px flex-1 bg-tepian" /> <span>atau gunakan email</span> <span className="h-px flex-1 bg-tepian" />
      </div>

      <form onSubmit={tautanAjaib} className="space-y-3">
        <label htmlFor="email-masuk" className="text-sm font-semibold">Alamat email</label>
        <input
          id="email-masuk"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nama@contoh.com"
          className="mono min-h-12 w-full rounded-xl border border-tepian bg-panel px-4 py-3 text-sm outline-none transition-shadow placeholder:font-sans placeholder:text-redup/60 focus:border-hijau/55 focus:ring-4 focus:ring-hijau/10"
        />
        <button type="submit" disabled={tahap === 'memuat'} className="button-light min-h-12 w-full rounded-xl">
          {tahap === 'memuat' ? 'Menyiapkan tautan…' : 'Kirim tautan masuk'}
          {tahap !== 'memuat' && <span aria-hidden="true">→</span>}
        </button>
      </form>

      {pesan && <p role="alert" className="mt-4 rounded-lg border border-merah/20 bg-merah/5 px-3 py-2 text-xs leading-5 text-merah">{pesan}</p>}
      <p className="mt-4 text-xs leading-5 text-redup">Tanpa kata sandi. Kami hanya menyimpan data akun dan progres yang diperlukan untuk kelas.</p>
    </div>
  )
}

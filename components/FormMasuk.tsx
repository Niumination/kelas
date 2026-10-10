'use client'

import { useState } from 'react'
import { klienBrowser } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/supabase/konfigurasi'

interface Props {
  aktif: boolean
  lanjut: string
}

export function FormMasuk({ aktif, lanjut }: Props) {
  const [email, setEmail] = useState('')
  const [tahap, setTahap] = useState<'diam' | 'memuat' | 'terkirim'>('diam')
  const [pesan, setPesan] = useState('')

  const redirectTo = `${SITE_URL}/auth/callback?lanjut=${encodeURIComponent(lanjut)}`

  async function oauth(penyedia: 'github' | 'google') {
    const sb = klienBrowser()
    if (!sb) return
    setTahap('memuat')
    const { error } = await sb.auth.signInWithOAuth({ provider: penyedia, options: { redirectTo } })
    if (error) {
      setPesan(error.message)
      setTahap('diam')
    }
  }

  async function tautanAjaib(e: React.FormEvent) {
    e.preventDefault()
    const sb = klienBrowser()
    if (!sb) return
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
      <div
        className="rounded-lg border p-5 text-sm"
        style={{ borderColor: 'rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.06)' }}
      >
        <div className="mono mb-2 text-[0.7rem] font-bold uppercase tracking-wider text-kuning">
          mode demo
        </div>
        <p className="text-redup">
          Login belum aktif karena variabel Supabase belum diisi. Seluruh materi tetap bisa dibaca tanpa
          akun. Untuk mengaktifkan akun, progres, dan pembayaran: salin{' '}
          <code className="mono text-teks">.env.example</code> menjadi{' '}
          <code className="mono text-teks">.env.local</code>, isi{' '}
          <code className="mono text-teks">NEXT_PUBLIC_SUPABASE_URL</code> dan{' '}
          <code className="mono text-teks">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, lalu jalankan ulang
          server.
        </p>
      </div>
    )
  }

  if (tahap === 'terkirim') {
    return (
      <div className="rounded-lg border border-hijau/40 bg-hijau/[0.06] p-6">
        <h2 className="font-semibold">Cek emailmu</h2>
        <p className="mt-2 text-sm text-redup">
          Tautan masuk sudah dikirim ke <span className="mono text-teks">{email}</span>. Tautan berlaku
          sekali pakai.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => oauth('github')}
        disabled={tahap === 'memuat'}
        className="mono flex w-full items-center justify-center gap-3 rounded-md border border-tepian bg-panel px-5 py-3 text-sm transition-colors hover:border-hijau/40 disabled:opacity-60"
      >
        <span>⌥</span> Lanjut dengan GitHub
      </button>
      <button
        onClick={() => oauth('google')}
        disabled={tahap === 'memuat'}
        className="mono flex w-full items-center justify-center gap-3 rounded-md border border-tepian bg-panel px-5 py-3 text-sm transition-colors hover:border-hijau/40 disabled:opacity-60"
      >
        <span>G</span> Lanjut dengan Google
      </button>

      <div className="mono my-5 flex items-center gap-3 text-[0.7rem] uppercase tracking-wider text-redup">
        <span className="h-px flex-1 bg-tepian" /> atau <span className="h-px flex-1 bg-tepian" />
      </div>

      <form onSubmit={tautanAjaib} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="namamu@email.com"
          className="mono w-full rounded-md border border-tepian bg-panel px-4 py-3 text-sm outline-none placeholder:text-redup/60 focus:border-hijau/50"
        />
        <button
          type="submit"
          disabled={tahap === 'memuat'}
          className="mono w-full rounded-md border border-hijau/50 bg-hijau/15 px-5 py-3 text-sm font-semibold text-hijau transition-colors hover:bg-hijau/25 disabled:opacity-60"
        >
          {tahap === 'memuat' ? 'Mengirim…' : 'Kirim tautan masuk'}
        </button>
      </form>

      {pesan && <p className="text-xs text-merah">{pesan}</p>}
      <p className="pt-2 text-xs text-redup">
        Tanpa kata sandi. Kami hanya menyimpan email dan nama tampilanmu.
      </p>
    </div>
  )
}

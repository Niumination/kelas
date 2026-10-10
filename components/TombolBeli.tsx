'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  slugKelas: string
  label?: string
  kelas?: string
}

type Tahap = 'diam' | 'memuat' | 'error'

export function TombolBeli({ slugKelas, label = 'Beli sekarang', kelas }: Props) {
  const [tahap, setTahap] = useState<Tahap>('diam')
  const [pesan, setPesan] = useState('')
  const router = useRouter()

  async function bayar() {
    setTahap('memuat')
    setPesan('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugKelas }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.butuhLogin) {
          router.push('/masuk?lanjut=/harga')
          return
        }
        throw new Error(data.pesan ?? 'Gagal membuat transaksi')
      }

      if (!data.aktif) {
        setTahap('diam')
        setPesan(data.pesan ?? 'Pembayaran belum aktif')
        return
      }

      // Muat Snap.js lalu buka popup pembayaran Midtrans
      const snapUrl = data.snapUrl as string
      if (!(window as any).snap) {
        await new Promise<void>((lanjut, gagal) => {
          const s = document.createElement('script')
          s.src = snapUrl
          s.setAttribute('data-client-key', data.clientKey)
          s.onload = () => lanjut()
          s.onerror = () => gagal(new Error('Gagal memuat Snap.js'))
          document.head.appendChild(s)
        })
      }
      ;(window as any).snap.pay(data.token, {
        onSuccess: () => router.push(`/belajar/${slugKelas}?bayar=sukses`),
        onPending: () => router.push(`/dashboard?bayar=menunggu`),
        onError: () => setPesan('Transaksi gagal, coba lagi.'),
        onClose: () => setTahap('diam'),
      })
      setTahap('diam')
    } catch (e) {
      setTahap('error')
      setPesan(e instanceof Error ? e.message : 'Terjadi kesalahan')
    }
  }

  return (
    <div className={kelas}>
      <button
        onClick={bayar}
        disabled={tahap === 'memuat'}
        className="mono w-full rounded-md border border-hijau/50 bg-hijau/15 px-5 py-3 text-sm font-semibold text-hijau transition-colors hover:bg-hijau/25 disabled:opacity-60"
      >
        {tahap === 'memuat' ? 'Menyiapkan pembayaran…' : label}
      </button>
      {pesan && <p className="mt-2 text-xs text-merah">{pesan}</p>}
    </div>
  )
}

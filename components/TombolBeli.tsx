'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  slugKelas: string
  label?: string
  kelas?: string
  lanjut?: string
}

type Tahap = 'diam' | 'memuat' | 'error'

export function TombolBeli({ slugKelas, label = 'Beli sekarang', kelas, lanjut = '/harga' }: Props) {
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
          router.push(`/masuk?lanjut=${encodeURIComponent(lanjut)}`)
          return
        }
        throw new Error(data.pesan ?? 'Gagal membuat transaksi')
      }

      if (!data.aktif) {
        setTahap('diam')
        setPesan(data.pesan ?? 'Pembayaran belum aktif')
        return
      }

      // Muat Snap.js hanya saat pengguna benar-benar memulai checkout.
      const snapUrl = data.snapUrl as string
      if (!(window as any).snap) {
        await new Promise<void>((lanjutkan, gagal) => {
          const skrip = document.createElement('script')
          skrip.src = snapUrl
          skrip.setAttribute('data-client-key', data.clientKey)
          skrip.onload = () => lanjutkan()
          skrip.onerror = () => gagal(new Error('Gagal memuat halaman pembayaran. Periksa koneksi lalu coba lagi.'))
          document.head.appendChild(skrip)
        })
      }

      ;(window as any).snap.pay(data.token, {
        onSuccess: () => router.push(`/belajar/${slugKelas}?bayar=sukses`),
        onPending: () => router.push('/dashboard?bayar=menunggu'),
        onError: () => {
          setTahap('error')
          setPesan('Transaksi gagal. Periksa metode pembayaran atau coba lagi.')
        },
        onClose: () => setTahap('diam'),
      })
      setTahap('diam')
    } catch (error) {
      setTahap('error')
      setPesan(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyiapkan pembayaran.')
    }
  }

  return (
    <div className={kelas}>
      <button type="button" onClick={bayar} disabled={tahap === 'memuat'} className="button-light w-full">
        {tahap === 'memuat' ? (
          <>
            <svg viewBox="0 0 20 20" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
              <path d="M17 10a7 7 0 0 0-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Menyiapkan pembayaran…
          </>
        ) : label}
      </button>
      {pesan && <p role="status" aria-live="polite" className="mt-2 text-xs leading-5 text-merah">{pesan}</p>}
    </div>
  )
}

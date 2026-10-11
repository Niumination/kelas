'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  slugKelas: string
  siap: boolean
  pelajaranSelesai: number
  totalPelajaran: number
  kuisLulus: number
  totalKuis: number
  sertifikat: { nomor: string; status: string } | null
  aktif: boolean
}

export function TombolSertifikat(p: Props) {
  const [menunggu, mulai] = useTransition()
  const [pesan, setPesan] = useState('')
  const [nomor, setNomor] = useState(p.sertifikat?.nomor ?? null)
  const [status, setStatus] = useState(p.sertifikat?.status ?? 'aktif')
  const router = useRouter()

  if (!p.aktif) {
    return <p className="text-xs text-redup">Masuk untuk mengklaim sertifikat dan menyimpannya di dasbor.</p>
  }

  if (nomor) {
    return (
      <div className="rounded-xl border border-hijau/20 bg-hijau/5 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="kicker text-hijau-gelap">SERTIFIKAT {status === 'aktif' ? 'TERBIT' : status.toUpperCase()}</span>
            <div className="mono mt-2 break-all text-sm font-bold tracking-wide">{nomor}</div>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hijau/20 bg-panel text-hijau" aria-hidden="true">✓</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`/api/sertifikat/${encodeURIComponent(nomor)}`} className="button-light min-h-10 rounded-lg px-4 py-2 text-xs">Unduh sertifikat <span aria-hidden="true">↓</span></a>
          <a href={`/verify/${encodeURIComponent(nomor)}`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-tepian px-4 py-2 text-xs font-semibold transition-colors hover:bg-panel">Lihat verifikasi <span className="ml-1" aria-hidden="true">↗</span></a>
        </div>
      </div>
    )
  }

  function terbitkan() {
    setPesan('')
    mulai(async () => {
      try {
        const response = await fetch('/api/sertifikat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugKelas: p.slugKelas }),
        })
        const data = await response.json()
        if (!response.ok) {
          setPesan(data.pesan ?? 'Sertifikat belum dapat diterbitkan.')
          return
        }
        setNomor(data.sertifikat?.nomor ?? null)
        setStatus(data.sertifikat?.status ?? 'aktif')
        router.refresh()
      } catch {
        setPesan('Terjadi kendala saat menerbitkan sertifikat. Coba lagi.')
      }
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <span className="kicker text-redup">SYARAT SERTIFIKAT</span>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className={`rounded-lg border px-3 py-2 text-xs ${p.pelajaranSelesai === p.totalPelajaran ? 'border-hijau/20 bg-hijau/5 text-hijau-gelap' : 'border-tepian bg-panel text-redup'}`}>
            <span className="mono mr-2">{p.pelajaranSelesai === p.totalPelajaran ? '✓' : '01'}</span>Pelajaran {p.pelajaranSelesai}/{p.totalPelajaran}
          </div>
          <div className={`rounded-lg border px-3 py-2 text-xs ${p.kuisLulus === p.totalKuis ? 'border-hijau/20 bg-hijau/5 text-hijau-gelap' : 'border-tepian bg-panel text-redup'}`}>
            <span className="mono mr-2">{p.kuisLulus === p.totalKuis ? '✓' : '02'}</span>Kuis lulus {p.kuisLulus}/{p.totalKuis}
          </div>
        </div>
      </div>
      <div className="sm:min-w-48">
        <button type="button" onClick={terbitkan} disabled={!p.siap || menunggu} className="button-light min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-45">
          {menunggu ? 'Menerbitkan…' : p.siap ? 'Terbitkan sertifikat' : 'Syarat belum lengkap'}
        </button>
        {pesan && <p role="alert" className="mt-2 text-xs leading-5 text-merah">{pesan}</p>}
      </div>
    </div>
  )
}

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
  const router = useRouter()

  if (!p.aktif) {
    return <p className="mono text-xs text-redup">Masuk untuk mengklaim sertifikat.</p>
  }

  if (nomor) {
    return (
      <div className="kotak border-hijau/40 p-4">
        <div className="mono text-[0.7rem] uppercase tracking-wider text-hijau">sertifikat terbit</div>
        <div className="mono mt-1 text-sm font-bold">{nomor}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`/api/sertifikat/${nomor}`}
            className="mono rounded-md border border-hijau/50 bg-hijau/15 px-4 py-2 text-xs text-hijau hover:bg-hijau/25"
          >
            Unduh PDF
          </a>
          <a
            href={`/verify/${nomor}`}
            className="mono rounded-md border border-tepian px-4 py-2 text-xs hover:bg-panel-2"
          >
            Halaman verifikasi
          </a>
        </div>
      </div>
    )
  }

  function terbitkan() {
    setPesan('')
    mulai(async () => {
      const res = await fetch('/api/sertifikat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugKelas: p.slugKelas }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPesan(data.pesan ?? 'Gagal menerbitkan sertifikat')
        return
      }
      setNomor(data.sertifikat?.nomor ?? null)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="mono mb-2 text-[0.7rem] uppercase tracking-wider text-redup">syarat</div>
      <ul className="mb-4 space-y-1 text-xs">
        <li className={p.pelajaranSelesai === p.totalPelajaran ? 'text-hijau' : 'text-redup'}>
          {p.pelajaranSelesai === p.totalPelajaran ? '✓' : '○'} Pelajaran {p.pelajaranSelesai}/
          {p.totalPelajaran}
        </li>
        <li className={p.kuisLulus === p.totalKuis ? 'text-hijau' : 'text-redup'}>
          {p.kuisLulus === p.totalKuis ? '✓' : '○'} Kuis lulus {p.kuisLulus}/{p.totalKuis}
        </li>
      </ul>
      <button
        onClick={terbitkan}
        disabled={!p.siap || menunggu}
        className="mono w-full rounded-md border border-hijau/50 bg-hijau/15 px-4 py-2.5 text-xs font-semibold text-hijau hover:bg-hijau/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {menunggu ? 'Menerbitkan…' : p.siap ? 'Terbitkan sertifikat' : 'Syarat belum terpenuhi'}
      </button>
      {pesan && <p className="mt-2 text-xs text-merah">{pesan}</p>}
    </div>
  )
}

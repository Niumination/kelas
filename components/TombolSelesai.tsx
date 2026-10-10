'use client'

import { useState, useTransition } from 'react'
import { tandaiSelesai } from '@/app/aksi'

interface Props {
  slugKelas: string
  jalur: string
  awalSelesai: boolean
  aktif: boolean
}

export function TombolSelesai({ slugKelas, jalur, awalSelesai, aktif }: Props) {
  const [selesai, setSelesai] = useState(awalSelesai)
  const [pesan, setPesan] = useState<string | null>(null)
  const [menunggu, mulai] = useTransition()

  if (!aktif) {
    return (
      <button
        disabled
        title="Masuk untuk menyimpan progres"
        className="mono cursor-not-allowed rounded-md border border-tepian px-4 py-2 text-sm text-redup"
      >
        ✓ Tandai selesai
      </button>
    )
  }

  function klik() {
    const nilai = !selesai
    setSelesai(nilai)
    setPesan(null)
    mulai(async () => {
      const hasil = await tandaiSelesai(slugKelas, jalur, nilai)
      if (!hasil.ok) {
        setSelesai(!nilai)
        setPesan(hasil.pesan ?? 'Gagal menyimpan progres')
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={klik}
        disabled={menunggu}
        className={`mono rounded-md border px-4 py-2 text-sm transition-colors disabled:opacity-60 ${
          selesai
            ? 'border-hijau/50 bg-hijau/15 text-hijau hover:bg-hijau/25'
            : 'border-tepian text-redup hover:border-hijau/40 hover:text-hijau'
        }`}
      >
        {menunggu ? '…' : selesai ? '✓ Selesai' : 'Tandai selesai'}
      </button>
      {pesan && <span className="text-xs text-merah">{pesan}</span>}
    </div>
  )
}

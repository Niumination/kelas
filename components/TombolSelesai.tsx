'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const tujuan = `/belajar/${slugKelas}/${jalur}`

  useEffect(() => {
    setSelesai(awalSelesai)
  }, [awalSelesai])

  if (!aktif) {
    return (
      <Link
        href={`/masuk?lanjut=${encodeURIComponent(tujuan)}`}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-tepian bg-panel px-4 text-sm font-semibold text-redup transition-colors hover:border-hijau/35 hover:text-hijau-gelap"
      >
        Masuk untuk simpan progres <span aria-hidden="true">→</span>
      </Link>
    )
  }

  function klik() {
    const nilai = !selesai
    setSelesai(nilai)
    setPesan(null)
    mulai(async () => {
      try {
        const hasil = await tandaiSelesai(slugKelas, jalur, nilai)
        if (!hasil.ok) {
          setSelesai(!nilai)
          setPesan(hasil.pesan ?? 'Progres belum tersimpan. Coba lagi.')
          return
        }
        router.refresh()
      } catch {
        setSelesai(!nilai)
        setPesan('Koneksi bermasalah. Periksa sambungan lalu coba lagi.')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={klik}
        disabled={menunggu}
        aria-pressed={selesai}
        aria-busy={menunggu}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
          selesai
            ? 'border-hijau/20 bg-hijau/10 text-hijau-gelap hover:bg-hijau/15'
            : 'border-tepian bg-panel text-teks hover:border-hijau/35 hover:text-hijau-gelap'
        }`}
      >
        {menunggu ? 'Menyimpan…' : selesai ? '✓ Pelajaran selesai' : 'Tandai selesai'}
      </button>
      {pesan && <span role="alert" className="text-xs text-merah">{pesan}</span>}
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export interface Soal {
  id: string
  tipe: string
  pertanyaan: string
  opsi: { id: string; teks: string }[]
  urutan: number
}

interface Props {
  slugKelas: string
  modul: string
  quizId: string
  judul: string
  nilaiLulus: number
  soal: Soal[]
  aktif: boolean
}

interface Hasil {
  nilai: number
  lulus: boolean
  benar: number
  total: number
  percobaan: number
}

/** Penilaian terjadi di database (RPC nilai_kuis), bukan di sini. */
export function FormKuis({ slugKelas, modul, quizId, judul, nilaiLulus, soal, aktif }: Props) {
  const [jawaban, setJawaban] = useState<Record<string, string>>({})
  const [hasil, setHasil] = useState<Hasil | null>(null)
  const [pesan, setPesan] = useState('')
  const [menunggu, mulai] = useTransition()
  const router = useRouter()

  const terjawab = Object.keys(jawaban).length
  const lengkap = terjawab === soal.length

  if (!aktif) {
    return (
      <div className="kotak p-6 text-sm text-redup">
        Masuk untuk mengikuti kuis. Penilaiannya dilakukan di server, jadi progresmu tersimpan.
      </div>
    )
  }

  function kirim() {
    setPesan('')
    mulai(async () => {
      const res = await fetch('/api/kuis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, jawaban }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPesan(data.pesan ?? 'Gagal menilai kuis')
        return
      }
      setHasil(data.hasil as Hasil)
      router.refresh()
    })
  }

  if (hasil) {
    return (
      <div
        className="kotak p-6"
        style={
          hasil.lulus
            ? { borderColor: 'rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.05)' }
            : { borderColor: 'rgba(251,191,36,0.45)', background: 'rgba(251,191,36,0.05)' }
        }
      >
        <div className="mono text-xs uppercase tracking-wider text-redup">hasil</div>
        <div className="mt-2 flex items-baseline gap-3">
          <span className={`text-4xl font-bold ${hasil.lulus ? 'text-hijau' : 'text-kuning'}`}>
            {hasil.nilai}
          </span>
          <span className="text-sm text-redup">
            {hasil.benar}/{hasil.total} benar · lulus {nilaiLulus} · percobaan ke-{hasil.percobaan}
          </span>
        </div>
        <p className="mt-3 text-sm">
          {hasil.lulus
            ? 'Selamat — modul ini tuntas. Lanjut ke modul berikutnya.'
            : 'Belum lulus. Baca ulang materinya, lalu coba lagi. Tidak ada batas percobaan.'}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              setHasil(null)
              setJawaban({})
            }}
            className="mono rounded-md border border-tepian px-4 py-2 text-sm hover:bg-panel-2"
          >
            Coba lagi
          </button>
          <a
            href={`/belajar/${slugKelas}`}
            className="mono rounded-md border border-hijau/50 bg-hijau/15 px-4 py-2 text-sm text-hijau hover:bg-hijau/25"
          >
            Kembali ke materi
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="mono text-xs text-redup">
          {terjawab}/{soal.length} terjawab · nilai lulus {nilaiLulus}
        </div>
      </div>

      <ol className="space-y-6">
        {soal.map((s, i) => (
          <li key={s.id} className="kotak p-5">
            <div className="mb-3 flex gap-3">
              <span className="mono flex h-6 w-6 shrink-0 items-center justify-center rounded border border-tepian text-xs text-redup">
                {i + 1}
              </span>
              <p className="font-medium leading-relaxed">{s.pertanyaan}</p>
            </div>
            <div className="ml-9 space-y-2">
              {s.opsi.map((o) => {
                const dipilih = jawaban[s.id] === o.id
                return (
                  <label
                    key={o.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                      dipilih
                        ? 'border-hijau/50 bg-hijau/10'
                        : 'border-tepian hover:border-redup/40 hover:bg-panel-2'
                    }`}
                  >
                    <input
                      type="radio"
                      name={s.id}
                      value={o.id}
                      checked={dipilih}
                      onChange={() => setJawaban((j) => ({ ...j, [s.id]: o.id }))}
                      className="mt-1 accent-[color:var(--color-hijau)]"
                    />
                    <span>
                      <span className="mono mr-2 text-redup">{o.id.toUpperCase()}.</span>
                      {o.teks}
                    </span>
                  </label>
                )
              })}
            </div>
          </li>
        ))}
      </ol>

      {pesan && <p className="mt-4 text-sm text-merah">{pesan}</p>}

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={kirim}
          disabled={!lengkap || menunggu}
          className="mono rounded-md border border-hijau/50 bg-hijau/15 px-6 py-3 text-sm font-semibold text-hijau hover:bg-hijau/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {menunggu ? 'Menilai…' : 'Kirim jawaban'}
        </button>
        {!lengkap && (
          <span className="text-xs text-redup">Jawab semua soal dulu sebelum mengirim.</span>
        )}
      </div>
      <p className="mt-4 text-xs text-redup">
        Jawaban dinilai di server. Kunci jawaban tidak pernah dikirim ke browser, jadi hasilnya tidak
        bisa dimanipulasi dari sini.
      </p>
    </div>
  )
}

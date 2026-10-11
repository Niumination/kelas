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
  quizId: string
  judul: string
  nilaiLulus: number
  soal: Soal[]
  aktif: boolean
  hrefMateri?: string
}

interface Hasil {
  nilai: number
  lulus: boolean
  benar: number
  total: number
  percobaan: number
}

/** Penilaian terjadi di database (RPC nilai_kuis), bukan di browser. */
export function FormKuis({ slugKelas, quizId, judul, nilaiLulus, soal, aktif, hrefMateri }: Props) {
  const [jawaban, setJawaban] = useState<Record<string, string>>({})
  const [hasil, setHasil] = useState<Hasil | null>(null)
  const [pesan, setPesan] = useState('')
  const [menunggu, mulai] = useTransition()
  const router = useRouter()

  const terjawab = Object.keys(jawaban).length
  const lengkap = terjawab === soal.length

  if (!aktif) {
    return (
      <div className="rounded-2xl border border-tepian bg-panel p-6 text-sm text-redup">
        Masuk untuk mengikuti kuis. Penilaian dilakukan di server agar hasil dan progresmu tersimpan dengan aman.
      </div>
    )
  }

  function kirim() {
    setPesan('')
    mulai(async () => {
      try {
        const response = await fetch('/api/kuis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId, jawaban }),
        })
        const data = await response.json()
        if (!response.ok) {
          setPesan(data.pesan ?? 'Jawaban belum dapat dinilai. Coba lagi.')
          return
        }
        setHasil(data.hasil as Hasil)
        router.refresh()
      } catch {
        setPesan('Koneksi bermasalah. Periksa sambungan internet lalu coba kirim ulang.')
      }
    })
  }

  if (hasil) {
    return (
      <section className={`overflow-hidden rounded-2xl border ${hasil.lulus ? 'border-hijau/25 bg-hijau/5' : 'border-kuning/25 bg-kuning/5'}`} aria-live="polite">
        <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-7">
          <div className={`grid h-24 w-24 place-items-center rounded-full border-[5px] bg-panel text-center ${hasil.lulus ? 'border-hijau/25 text-hijau-gelap' : 'border-kuning/25 text-kuning'}`}>
            <div>
              <span className="block text-3xl font-bold tracking-tight">{hasil.nilai}</span>
              <span className="mono block text-[0.55rem] uppercase tracking-[0.12em]">NILAI</span>
            </div>
          </div>
          <div>
            <span className={`kicker ${hasil.lulus ? 'text-hijau-gelap' : 'text-kuning'}`}>{hasil.lulus ? '✓ LULUS' : 'BELUM LULUS'} · PERCOBAAN {hasil.percobaan}</span>
            <h2 className="display-serif mt-2 text-3xl leading-tight">{hasil.lulus ? 'Bagus. Lanjutkan.' : 'Satu putaran lagi.'}</h2>
            <p className="mt-2 text-sm leading-6 text-redup">{hasil.benar} dari {hasil.total} jawaban benar. Nilai lulus modul ini adalah {nilaiLulus}.</p>
            <p className="mt-2 text-xs leading-5 text-redup">{hasil.lulus ? 'Hasil kuis tersimpan di akunmu.' : 'Baca kembali materi, lalu coba lagi. Tidak ada batas percobaan.'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-tepian/80 px-5 py-4 sm:px-7">
          {!hasil.lulus && <button type="button" onClick={() => { setHasil(null); setJawaban({}) }} className="button-light min-h-10 rounded-lg px-4 py-2 text-xs">Coba lagi</button>}
          <a href={hrefMateri ?? `/belajar/${slugKelas}`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-tepian bg-panel px-4 py-2 text-xs font-semibold hover:bg-panel-2">Kembali ke materi <span className="ml-1" aria-hidden="true">→</span></a>
        </div>
      </section>
    )
  }

  return (
    <div>
      <section className="mb-5 rounded-xl border border-tepian bg-panel px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="kicker text-hijau">CEK PEMAHAMAN</span>
            <h2 className="mt-1 font-semibold">{judul}</h2>
          </div>
          <span className="mono rounded-full bg-panel-2 px-3 py-1.5 text-[0.65rem] text-redup">LULUS ≥ {nilaiLulus}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-xs text-redup">{terjawab} dari {soal.length} soal dijawab</span>
          <span className="mono text-xs font-semibold text-hijau-gelap">{soal.length ? Math.round((terjawab / soal.length) * 100) : 0}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-label="Progres mengerjakan kuis" aria-valuemin={0} aria-valuemax={soal.length} aria-valuenow={terjawab}>
          <div className="h-full rounded-full bg-hijau transition-all" style={{ width: `${soal.length ? (terjawab / soal.length) * 100 : 0}%` }} />
        </div>
      </section>

      <ol className="space-y-3">
        {soal.map((item, index) => (
          <li key={item.id} className="rounded-2xl border border-tepian bg-panel p-4 sm:p-6">
            <div className="flex items-start gap-3.5">
              <span className="mono grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel-2 text-xs font-bold text-hijau-gelap">{String(index + 1).padStart(2, '0')}</span>
              <p className="pt-1 text-sm font-semibold leading-6 sm:text-base">{item.pertanyaan}</p>
            </div>
            <div className="mt-4 grid gap-2 sm:ml-11">
              {item.opsi.map((opsi) => {
                const dipilih = jawaban[item.id] === opsi.id
                const id = `soal-${item.id}-${opsi.id}`
                return (
                  <label
                    key={opsi.id}
                    htmlFor={id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm leading-6 transition-colors ${
                      dipilih ? 'border-hijau/40 bg-hijau/5' : 'border-tepian bg-white/55 hover:border-hijau/30 hover:bg-panel-2/50'
                    }`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name={item.id}
                      value={opsi.id}
                      checked={dipilih}
                      onChange={() => setJawaban((sebelumnya) => ({ ...sebelumnya, [item.id]: opsi.id }))}
                      className="mt-1 accent-[color:var(--color-hijau)]"
                    />
                    <span><span className="mono mr-2 text-[0.65rem] font-bold text-hijau-gelap">{opsi.id.toUpperCase()}.</span>{opsi.teks}</span>
                  </label>
                )
              })}
            </div>
          </li>
        ))}
      </ol>

      {pesan && <p role="alert" className="mt-4 rounded-xl border border-merah/20 bg-merah/5 px-4 py-3 text-sm text-merah">{pesan}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={kirim} disabled={!lengkap || menunggu} className="button-light min-h-12 px-6 disabled:cursor-not-allowed disabled:opacity-45">
          {menunggu ? 'Menilai jawaban…' : 'Kirim jawaban'}
          {!menunggu && <span aria-hidden="true">→</span>}
        </button>
        {!lengkap && <span className="text-xs text-redup">Jawab semua soal sebelum mengirim.</span>}
      </div>
      <p className="mt-4 text-xs leading-5 text-redup">Jawaban dinilai di server. Kunci jawaban tidak pernah dikirim ke browser.</p>
    </div>
  )
}

import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

/**
 * Kurikulum dibaca dari sistem berkas, bukan hardcode di komponen.
 * Menambah kelas = folder baru di content/. Menambah pelajaran = file .mdx baru.
 * Tidak ada perubahan kode frontend (PRD §0.2 aturan 3).
 *
 * Struktur:
 *   content/<slug-kelas>/kelas.json
 *   content/<slug-kelas>/<folder-modul>/_modul.json
 *   content/<slug-kelas>/<folder-modul>/<urutan>-<slug-pelajaran>.mdx
 */

export type Akses = 'gratis' | 'berbayar'

export interface MetaKelas {
  slug: string
  judul: string
  tagline: string
  deskripsi: string
  bahasa: string
  status: 'draft' | 'pra-rilis' | 'terbit'
  harga: number
  hargaAsli?: number
  tahapHarga?: string
  estimasiJam: number
  level: string
  prasyarat: string[]
  yangDidapat: string[]
  instruktur: string
  /** Nama pendek untuk blok tanda tangan sertifikat (kolom `instruktur` bisa berupa bio). */
  instrukturSingkat?: string
}

export interface MetaModul {
  slug: string
  judul: string
  urutan: number
  ringkasan: string
  akses: Akses
}

export interface MetaPelajaran {
  slug: string
  judul: string
  ringkasan: string
  menit: number
  urutan: number
  akses: Akses
  tags: string[]
}

export interface Pelajaran extends MetaPelajaran {
  /** path relatif untuk URL: modul/pelajaran */
  jalur: string
  modulSlug: string
  modulJudul: string
  /** isi MDX mentah (tanpa frontmatter) */
  isi: string
}

export interface Modul extends MetaModul {
  pelajaran: Pelajaran[]
}

export interface Kelas extends MetaKelas {
  modul: Modul[]
  jumlahPelajaran: number
  jumlahGratis: number
  jumlahBerbayar: number
  totalMenit: number
}

const DIR_CONTENT = path.join(process.cwd(), 'content')

function bacaJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function angkaDepan(nama: string): number {
  const m = nama.match(/^(\d+)/)
  return m ? Number(m[1]) : 999
}

export function daftarSlugKelas(): string[] {
  if (!fs.existsSync(DIR_CONTENT)) return []
  return fs
    .readdirSync(DIR_CONTENT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => fs.existsSync(path.join(DIR_CONTENT, d.name, 'kelas.json')))
    .map((d) => d.name)
}

export function ambilKelas(slug: string): Kelas | null {
  const dirKelas = path.join(DIR_CONTENT, slug)
  const meta = bacaJson<MetaKelas>(path.join(dirKelas, 'kelas.json'))
  if (!meta) return null

  const modul: Modul[] = []

  for (const entriModul of fs.readdirSync(dirKelas, { withFileTypes: true })) {
    if (!entriModul.isDirectory()) continue
    const dirModul = path.join(dirKelas, entriModul.name)
    const metaModul = bacaJson<MetaModul>(path.join(dirModul, '_modul.json'))
    if (!metaModul) continue

    const pelajaran: Pelajaran[] = fs
      .readdirSync(dirModul)
      .filter((f) => f.endsWith('.mdx'))
      .sort((a, b) => angkaDepan(a) - angkaDepan(b))
      .map((namaBerkas) => {
        const slugPelajaran = namaBerkas.replace(/^\d+-/, '').replace(/\.mdx$/, '')
        const { data, content } = matter(fs.readFileSync(path.join(dirModul, namaBerkas), 'utf8'))
        return {
          slug: slugPelajaran,
          judul: (data.judul as string) ?? slugPelajaran,
          ringkasan: (data.ringkasan as string) ?? '',
          menit: (data.menit as number) ?? 10,
          urutan: (data.urutan as number) ?? angkaDepan(namaBerkas),
          akses: metaModul.akses,
          tags: (data.tags as string[]) ?? [],
          jalur: `${metaModul.slug}/${slugPelajaran}`,
          modulSlug: metaModul.slug,
          modulJudul: metaModul.judul,
          isi: content,
        }
      })

    modul.push({ ...metaModul, pelajaran })
  }

  modul.sort((a, b) => a.urutan - b.urutan)

  const semua = modul.flatMap((m) => m.pelajaran)
  return {
    ...meta,
    modul,
    jumlahPelajaran: semua.length,
    jumlahGratis: semua.filter((p) => p.akses === 'gratis').length,
    jumlahBerbayar: semua.filter((p) => p.akses === 'berbayar').length,
    totalMenit: semua.reduce((t, p) => t + p.menit, 0),
  }
}

export function daftarKelas(): Kelas[] {
  return daftarSlugKelas()
    .map((s) => ambilKelas(s))
    .filter((k): k is Kelas => k !== null)
    .sort((a, b) => a.judul.localeCompare(b.judul))
}

/** Daftar pelajaran datar (urutan baca) — dipakai untuk prev/next & progres */
export function pelajaranDatar(kelas: Kelas): Pelajaran[] {
  return kelas.modul.flatMap((m) => m.pelajaran)
}

export function cariPelajaran(kelas: Kelas, jalur: string[]): Pelajaran | null {
  const target = jalur.join('/')
  return pelajaranDatar(kelas).find((p) => p.jalur === target) ?? null
}

export function tetangga(kelas: Kelas, pelajaran: Pelajaran) {
  const datar = pelajaranDatar(kelas)
  const i = datar.findIndex((p) => p.jalur === pelajaran.jalur)
  return {
    sebelumnya: i > 0 ? datar[i - 1] : null,
    berikutnya: i >= 0 && i < datar.length - 1 ? datar[i + 1] : null,
    indeks: i,
    total: datar.length,
  }
}

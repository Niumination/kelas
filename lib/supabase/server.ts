import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_AKTIF } from './konfigurasi'

/** Klien Supabase untuk Server Component / Route Handler / Server Action. */
export async function klienServer() {
  if (!SUPABASE_AKTIF) return null
  const gudangCookie = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return gudangCookie.getAll()
      },
      setAll(dafar) {
        try {
          for (const { name, value, options } of dafar) gudangCookie.set(name, value, options)
        } catch {
          // Server Component tidak boleh menulis cookie — aman diabaikan,
          // refresh sesi ditangani middleware.
        }
      },
    },
  })
}

export interface Pengguna {
  id: string
  email: string
  nama: string | null
  peran: 'siswa' | 'instruktur' | 'admin'
}

/** Ambil pengguna login + profilnya. null kalau belum login atau mode demo. */
export async function penggunaAktif(): Promise<Pengguna | null> {
  const sb = await klienServer()
  if (!sb) return null
  const { data } = await sb.auth.getUser()
  if (!data.user) return null
  const { data: profil } = await sb
    .from('profiles')
    .select('nama, peran')
    .eq('id', data.user.id)
    .maybeSingle()
  return {
    id: data.user.id,
    email: data.user.email ?? '',
    nama: profil?.nama ?? null,
    peran: (profil?.peran as Pengguna['peran']) ?? 'siswa',
  }
}

/**
 * Apakah pengguna memiliki kelas ini (enrollment aktif).
 * Inilah yang membuka materi berbayar — bukan `punya_akses_kelas`.
 */
export async function punyaAkses(slugKelas: string): Promise<boolean> {
  const sb = await klienServer()
  if (!sb) return false
  const { data } = await sb.rpc('punya_akses_materi', { p_slug: slugKelas })
  return data === true
}

/** Apakah kelas ini bisa dilihat di katalog (status terbit/pra-rilis). */
export async function kelasTerlihat(slugKelas: string): Promise<boolean> {
  const sb = await klienServer()
  if (!sb) return true
  const { data } = await sb.rpc('punya_akses_kelas', { p_slug: slugKelas })
  return data === true
}

/** Pelajaran mana saja yang sudah ditandai selesai. */
export async function progresKelas(slugKelas: string): Promise<Set<string>> {
  const sb = await klienServer()
  if (!sb) return new Set()
  const { data } = await sb.rpc('progres_kelas', { p_slug: slugKelas })
  return new Set<string>((data ?? []).map((b: { jalur: string }) => b.jalur))
}

export interface BarisKuis {
  modul: string
  judul_kuis: string
  nilai_terbaik: number | null
  lulus: boolean | null
  percobaan: number
}

export async function rekapKuis(slugKelas: string): Promise<BarisKuis[]> {
  const sb = await klienServer()
  if (!sb) return []
  const { data } = await sb.rpc('rekap_kuis', { p_slug: slugKelas })
  return (data ?? []) as BarisKuis[]
}

export interface SyaratSertifikat {
  pelajaran_selesai: number
  total_pelajaran: number
  kuis_lulus: number
  total_kuis: number
  siap: boolean
}

export async function syaratSertifikat(slugKelas: string): Promise<SyaratSertifikat | null> {
  const sb = await klienServer()
  if (!sb) return null
  const { data } = await sb.rpc('syarat_sertifikat', { p_slug: slugKelas })
  const baris = Array.isArray(data) ? data[0] : data
  return (baris ?? null) as SyaratSertifikat | null
}

export interface SoalKuis {
  id: string
  tipe: string
  pertanyaan: string
  opsi: { id: string; teks: string }[]
  urutan: number
}

export interface KuisModul {
  quizId: string
  judul: string
  nilaiLulus: number
  soal: SoalKuis[]
}

/** Mengambil soal lewat RPC — kunci jawaban tidak ikut dikembalikan. */
export async function ambilKuisModul(
  slugKelas: string,
  modul: string,
): Promise<{ kuis: KuisModul | null; error: string | null }> {
  const sb = await klienServer()
  if (!sb) return { kuis: null, error: 'Mode demo: kuis belum aktif.' }
  const { data, error } = await sb.rpc('kuis_modul', { p_slug: slugKelas, p_modul: modul })
  if (error) return { kuis: null, error: error.message }

  const baris = (data ?? []) as Array<{
    quiz_id: string
    judul: string
    nilai_lulus: number
    id: string
    tipe: string
    pertanyaan: string
    opsi: { id: string; teks: string }[]
    urutan: number
  }>
  if (baris.length === 0) return { kuis: null, error: 'Belum ada soal untuk modul ini.' }

  return {
    kuis: {
      quizId: baris[0].quiz_id,
      judul: baris[0].judul,
      nilaiLulus: baris[0].nilai_lulus,
      soal: baris.map((b) => ({
        id: b.id,
        tipe: b.tipe,
        pertanyaan: b.pertanyaan,
        opsi: b.opsi,
        urutan: b.urutan,
      })),
    },
    error: null,
  }
}

export interface Sertifikat {
  nomor: string
  judul_kelas: string
  slug: string
  terbit_pada: string
  status: string
  nama_sertifikat: string | null
}

export async function sertifikatSaya(): Promise<Sertifikat[]> {
  const sb = await klienServer()
  if (!sb) return []
  const { data } = await sb.rpc('sertifikat_saya')
  return (data ?? []) as Sertifikat[]
}

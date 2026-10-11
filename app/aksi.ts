'use server'

import { revalidatePath } from 'next/cache'
import { klienServer } from '@/lib/supabase/server'

const slugAman = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Server action untuk menandai pelajaran selesai.
 * Penulisan dilakukan lewat RPC `tandai_selesai` agar aturan akses
 * tetap berada di database (PRD §0.2 aturan 4 — satu pintu akses).
 */
export async function tandaiSelesai(slugKelas: string, jalur: string, selesai: boolean) {
  if (typeof slugKelas !== 'string' || !slugAman.test(slugKelas)) {
    return { ok: false, pesan: 'Kelas tidak valid. Muat ulang halaman lalu coba lagi.' }
  }

  const bagianJalur = typeof jalur === 'string' ? jalur.split('/') : []
  if (bagianJalur.length !== 2 || bagianJalur.some((bagian) => !slugAman.test(bagian)) || typeof selesai !== 'boolean') {
    return { ok: false, pesan: 'Pelajaran tidak valid. Muat ulang halaman lalu coba lagi.' }
  }

  const sb = await klienServer()
  if (!sb) return { ok: false, pesan: 'Mode demo: progres tidak disimpan.' }

  // Autentikasi server-side sebelum mutasi; RPC tetap menjadi otoritas akses.
  const { data: { user }, error: authError } = await sb.auth.getUser()
  if (authError || !user) {
    return { ok: false, pesan: 'Sesi masuk tidak aktif. Masuk kembali untuk menyimpan progres.' }
  }

  const { error } = await sb.rpc('tandai_selesai', {
    p_slug: slugKelas,
    p_jalur: jalur,
    p_selesai: selesai,
  })
  if (error) {
    if (error.message === 'Tidak punya akses ke materi ini') {
      return { ok: false, pesan: 'Materi ini memerlukan akses premium sebelum progres bisa disimpan.' }
    }
    if (error.message.startsWith('Pelajaran tidak ditemukan')) {
      return { ok: false, pesan: 'Pelajaran tidak ditemukan. Muat ulang halaman lalu coba lagi.' }
    }
    return { ok: false, pesan: 'Progres belum tersimpan. Periksa koneksi dan coba lagi.' }
  }

  revalidatePath(`/belajar/${slugKelas}/${jalur}`)
  revalidatePath(`/kelas/${slugKelas}`)
  revalidatePath('/dashboard')
  return { ok: true }
}

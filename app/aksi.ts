'use server'

import { revalidatePath } from 'next/cache'
import { klienServer } from '@/lib/supabase/server'

/**
 * Server action untuk menandai pelajaran selesai.
 * Penulisan dilakukan lewat RPC `tandai_selesai` agar aturan akses
 * tetap berada di database (PRD §0.2 aturan 4 — satu pintu akses).
 */
export async function tandaiSelesai(slugKelas: string, jalur: string, selesai: boolean) {
  const sb = await klienServer()
  if (!sb) return { ok: false, pesan: 'Mode demo: progres tidak disimpan.' }
  const { error } = await sb.rpc('tandai_selesai', { p_slug: slugKelas, p_jalur: jalur, p_selesai: selesai })
  if (error) return { ok: false, pesan: error.message }
  revalidatePath(`/belajar/${slugKelas}/${jalur}`)
  revalidatePath('/dashboard')
  return { ok: true }
}

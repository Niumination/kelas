import { NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'

/**
 * POST /api/kuis { quizId, jawaban }
 *
 * Penilaian dilakukan oleh RPC `nilai_kuis` di database.
 * Rute ini hanya meneruskan; tidak ada perbandingan jawaban di sisi server
 * aplikasi, apalagi di browser.
 */
export async function POST(req: Request) {
  const sb = await klienServer()
  if (!sb) return NextResponse.json({ pesan: 'Mode demo: kuis belum aktif.' }, { status: 503 })

  let quizId: string
  let jawaban: Record<string, string>
  try {
    ;({ quizId, jawaban } = await req.json())
  } catch {
    return NextResponse.json({ pesan: 'Permintaan tidak valid' }, { status: 400 })
  }

  if (!quizId || typeof jawaban !== 'object' || jawaban === null) {
    return NextResponse.json({ pesan: 'quizId dan jawaban wajib diisi' }, { status: 400 })
  }

  const { data, error } = await sb.rpc('nilai_kuis', { p_quiz_id: quizId, p_jawaban: jawaban })
  if (error) return NextResponse.json({ pesan: error.message }, { status: 422 })

  const hasil = Array.isArray(data) ? data[0] : data
  return NextResponse.json({ ok: true, hasil })
}

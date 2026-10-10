import { NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'
import { tandaTanganCocok, statusBerhasil, statusFinal } from '@/lib/midtrans'

/**
 * POST /api/webhooks/midtrans
 *
 * Dua hal yang tidak boleh ditawar:
 *   1. verifikasi signature sebelum memproses apa pun
 *   2. idempoten — webhook bisa datang berkali-kali untuk order yang sama
 *
 * Perubahan status dilakukan lewat RPC `proses_webhook` (SECURITY DEFINER),
 * karena webhook datang tanpa sesi pengguna.
 */
export async function POST(req: Request) {
  const sb = await klienServer()
  if (!sb) return NextResponse.json({ pesan: 'Mode demo' }, { status: 503 })

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ pesan: 'Bad request' }, { status: 400 })
  }

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status = '',
    payment_type = '',
  } = body as Record<string, string>

  if (!order_id || !signature_key) {
    return NextResponse.json({ pesan: 'Field tidak lengkap' }, { status: 400 })
  }

  if (!tandaTanganCocok(order_id, status_code ?? '', gross_amount ?? '', signature_key)) {
    return NextResponse.json({ pesan: 'Signature tidak valid' }, { status: 401 })
  }

  const lulus = statusBerhasil(transaction_status, fraud_status)
  const selesai = statusFinal(transaction_status)

  const { error } = await sb.rpc('proses_webhook', {
    p_order_id: order_id,
    p_status: lulus ? 'settlement' : selesai ? transaction_status : 'pending',
    p_metode: payment_type,
    p_jumlah: Number(gross_amount ?? 0),
  })

  if (error) return NextResponse.json({ pesan: error.message }, { status: 500 })

  // Balas 200 cepat; pekerjaan berat (email, sertifikat) dikerjakan terpisah.
  return NextResponse.json({ ok: true })
}

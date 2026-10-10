import 'server-only'
import crypto from 'node:crypto'

/**
 * Midtrans Snap — QRIS, Virtual Account, GoPay, ShopeePay, kartu kredit.
 * Dokumen: https://docs.midtrans.com
 *
 * Alur (PRD §3.2):
 *   1. server membuat order_id unik → simpan purchases.status='pending'
 *   2. Snap API → snap_token → popup di browser
 *   3. webhook /api/webhooks/midtrans → verifikasi signature → entitlement
 */

const PRODUKSI = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? ''

export const MIDTRANS_AKTIF = SERVER_KEY.length > 0
export const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY ?? ''

const DASAR_SNAP = PRODUKSI
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

export const DASAR_SNAP_JS = PRODUKSI
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

/** Format: NIM-<KELAS>-<8 char user>-<timestamp base36><3 byte hex> */
export function orderId(slugKelas: string, userId: string): string {
  const stempel = Date.now().toString(36).toUpperCase()
  const acak = crypto.randomBytes(3).toString('hex').toUpperCase()
  const kelas = slugKelas.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  return `NIM-${kelas}-${userId.slice(0, 8).toUpperCase()}-${stempel}${acak}`
}

export interface PermintaanTransaksi {
  orderId: string
  jumlah: number
  slugKelas: string
  namaKelas: string
  email: string
  nama: string
}

export interface HasilTransaksi {
  token: string
  redirect_url: string
}

export async function buatTransaksi(p: PermintaanTransaksi): Promise<HasilTransaksi> {
  if (!MIDTRANS_AKTIF) throw new Error('MIDTRANS_SERVER_KEY belum diisi')

  const auth = Buffer.from(`${SERVER_KEY}:`).toString('base64')
  const res = await fetch(DASAR_SNAP, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      transaction_details: { order_id: p.orderId, gross_amount: p.jumlah },
      customer_details: { email: p.email, first_name: p.nama || p.email.split('@')[0] },
      item_details: [{ id: p.slugKelas, name: p.namaKelas, price: p.jumlah, quantity: 1 }],
      enabled_payments: ['qris', 'gopay', 'shopeepay', 'bank_transfer', 'credit_card', 'other_qris'],
      credit_card: { secure: true },
      expiry: { unit: 'day', duration: 1 },
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const teks = await res.text()
    throw new Error(`Midtrans ${res.status}: ${teks}`)
  }
  return (await res.json()) as HasilTransaksi
}

/**
 * WAJIB dipanggil sebelum memproses webhook.
 * signature_key = SHA512(order_id + status_code + gross_amount + server_key)
 */
export function tandaTanganCocok(
  orderIdParam: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): boolean {
  if (!MIDTRANS_AKTIF || !signatureKey) return false
  const hitung = crypto
    .createHash('sha512')
    .update(`${orderIdParam}${statusCode}${grossAmount}${SERVER_KEY}`)
    .digest('hex')
  const a = Buffer.from(hitung)
  const b = Buffer.from(signatureKey)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Status yang berarti "sudah dibayar" → berikan akses. */
export function statusBerhasil(status: string, fraud: string): boolean {
  return (status === 'capture' && fraud === 'accept') || status === 'settlement'
}

/** Status yang berarti "transaksi selesai, jangan ditagih lagi". */
export function statusFinal(status: string): boolean {
  return ['expire', 'cancel', 'deny', 'failure', 'refund'].includes(status)
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Tanpa env Supabase, aplikasi tetap hidup dalam MODE DEMO:
 * seluruh materi bisa dibaca, tapi login/dashboard/pembayaran dinonaktifkan.
 * Ini membuat repo tetap bisa di-clone dan dijalankan siapa pun (sesuai semangat open source).
 */
export const SUPABASE_AKTIF = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

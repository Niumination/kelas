import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_AKTIF } from '@/lib/supabase/konfigurasi'

/**
 * Menyegarkan sesi Supabase di setiap request.
 * Cookie yang diperbarui harus masuk ke request (Server Components/Actions)
 * sekaligus response (browser), supaya keduanya tidak kehilangan sinkronisasi.
 * Mode demo (tanpa env) → lewati saja.
 */
export default async function proxy(req: NextRequest) {
  if (!SUPABASE_AKTIF) return NextResponse.next({ request: req })

  let res = NextResponse.next({ request: req })
  const sb = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(daftarCookie) {
        // Supabase SSR mengharuskan cookie baru tersedia untuk kode server
        // pada request yang sama, bukan hanya tertulis ke browser.
        for (const { name, value } of daftarCookie) req.cookies.set(name, value)

        // Response baru membawa request yang cookie-nya sudah diperbarui.
        res = NextResponse.next({ request: req })
        for (const { name, value, options } of daftarCookie) {
          res.cookies.set(name, value, options)
        }
      },
    },
  })

  // Jangan ganti dengan getSession(): getUser memvalidasi token ke Auth server.
  await sb.auth.getUser()
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

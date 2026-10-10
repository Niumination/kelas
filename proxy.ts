import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_AKTIF } from '@/lib/supabase/konfigurasi'

/**
 * Menyegarkan sesi Supabase di setiap request.
 * Mode demo (tanpa env) → lewati saja.
 */
export default async function proxy(req: NextRequest) {
  if (!SUPABASE_AKTIF) return NextResponse.next()

  const res = NextResponse.next({ request: { headers: req.headers } })
  const sb = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(dafar) {
        for (const { name, value, options } of dafar) {
          req.cookies.set(name, value)
          res.cookies.set(name, value, options)
        }
      },
    },
  })

  await sb.auth.getUser()
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

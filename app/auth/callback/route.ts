import { NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'

/** Menukar code OAuth menjadi sesi, lalu mengarahkan ke tujuan. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const lanjut = url.searchParams.get('lanjut') ?? '/dashboard'

  if (code) {
    const sb = await klienServer()
    if (sb) {
      const { error } = await sb.auth.exchangeCodeForSession(code)
      if (error) return NextResponse.redirect(new URL('/masuk?gagal=1', url.origin))
    }
  }

  return NextResponse.redirect(new URL(lanjut.startsWith('/') ? lanjut : '/dashboard', url.origin))
}

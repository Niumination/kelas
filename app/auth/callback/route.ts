import { NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'

/** Tukar code OAuth menjadi sesi, lalu kembalikan pengguna ke rute lokal yang aman. */
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

  let tujuan = new URL('/dashboard', url.origin)
  if (lanjut.startsWith('/') && !lanjut.startsWith('//')) {
    const kandidat = new URL(lanjut, url.origin)
    if (kandidat.origin === url.origin) tujuan = kandidat
  }

  return NextResponse.redirect(tujuan)
}

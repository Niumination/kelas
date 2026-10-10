import { NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const sb = await klienServer()
  if (sb) await sb.auth.signOut()
  return NextResponse.redirect(new URL('/', url.origin), { status: 303 })
}

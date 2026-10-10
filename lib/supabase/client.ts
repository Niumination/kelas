'use client'
import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './konfigurasi'

let simpanan: ReturnType<typeof createBrowserClient> | null = null

export function klienBrowser() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  if (!simpanan) simpanan = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return simpanan
}

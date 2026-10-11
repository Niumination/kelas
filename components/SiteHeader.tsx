import { penggunaAktif } from '@/lib/supabase/server'
import { SiteHeaderNav } from './SiteHeaderNav'

/** Header server-rendered agar status akun mengikuti cookie sesi Supabase. */
export async function SiteHeader() {
  const pengguna = await penggunaAktif()

  return (
    <SiteHeaderNav
      pengguna={pengguna ? { email: pengguna.email, nama: pengguna.nama } : null}
    />
  )
}

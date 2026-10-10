/**
 * Uji alur sertifikat dari ujung ke ujung — terhadap Supabase yang nyata.
 *
 * Kenapa skrip ini ada: Hermes adalah agen CLI. Ia tidak bisa membuka browser,
 * tidak bisa login lewat GitHub/Google, dan tidak bisa mengklik dua belas
 * pelajaran satu per satu. Padahal alur "semua pelajaran selesai → semua kuis
 * lulus → sertifikat terbit" adalah rantai terpanjang di sistem ini, dan
 * persis yang paling perlu dibuktikan sebelum kelas dibuka.
 *
 * Skrip ini memakai service role hanya untuk menyiapkan pengguna uji dan
 * memberinya akses. Semua langkah yang diuji dijalankan sebagai pengguna
 * tersebut, jadi RLS dan `auth.uid()` ikut teruji.
 *
 *   node scripts/uji-alur-sertifikat.mjs
 *
 * Butuh env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Opsional : UJI_EMAIL (default dibuat acak), UJI_BERSIH=1 (hapus pengguna uji)
 *
 * PERHATIAN: skrip ini belum pernah dijalankan dari sandbox — ia butuh project
 * Supabase sungguhan. Kalau gagal, salin keluarannya apa adanya ke LAPORAN.md.
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOK = join(ROOT, 'docs')
const SLUG = 'ai-agent-self-host'

// ── Muat .env.local tanpa dependensi ──────────────────────────────────────
const envLokal = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local')
if (existsSync(envLokal)) {
  for (const baris of readFileSync(envLokal, 'utf8').split('\n')) {
    const m = baris.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL
const KUNCI_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const KUNCI_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!URL_SB || !KUNCI_SERVICE || !KUNCI_ANON) {
  console.error('✗ Butuh NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_ROLE_KEY')
  console.error('  Salin .env.example ke .env.local lalu isi ketiganya.')
  process.exit(1)
}

// Impor sengaja dinamis: kalau dependensi belum terpasang, pesannya harus
// jelas, bukan "Cannot find package" di baris pertama.
let createClient
try {
  ;({ createClient } = await import('@supabase/supabase-js'))
} catch {
  console.error('✗ Dependensi belum terpasang. Jalankan: npm install')
  process.exit(1)
}

const admin = createClient(URL_SB, KUNCI_SERVICE, { auth: { persistSession: false } })

let gagal = 0
function lapor(ok, pesan, rincian) {
  console.log(`  ${ok ? '✓' : '✗'} ${pesan}`)
  if (!ok) {
    gagal++
    if (rincian) console.log(`      ${String(rincian).slice(0, 300)}`)
  }
}

const cap = (t) => new Date().toISOString().replace(/\D/g, '').slice(0, 14)
const EMAIL = process.env.UJI_EMAIL ?? `uji-sertifikat+${cap()}@niumination.web.id`
const SANDI = `Uji-${cap()}-${Math.random().toString(36).slice(2, 12)}`

// Mode bersih-bersih hanya menghapus alamat uji yang dihasilkan skrip ini.
// Dibatasi prefix supaya salah ketik tidak menghapus akun sungguhan.
if (process.env.UJI_BERSIH === '1') {
  if (!process.env.UJI_EMAIL) {
    console.error('✗ Untuk bersih-bersih, isi UJI_EMAIL dengan alamat uji yang ingin dihapus.')
    process.exit(1)
  }
  if (!/^uji-sertifikat\+\d{14}@niumination\.web\.id$/i.test(process.env.UJI_EMAIL)) {
    console.error('✗ Demi keamanan, hanya akun uji-sertifikat+<timestamp>@niumination.web.id yang bisa dihapus lewat skrip ini.')
    process.exit(1)
  }
  const ukuranHalaman = 1000
  for (let halaman = 1; ; halaman++) {
    const daftar = await admin.auth.admin.listUsers({ page: halaman, perPage: ukuranHalaman })
    if (daftar.error) {
      console.error(`✗ Gagal mencari pengguna uji: ${daftar.error.message}`)
      process.exit(1)
    }
    const ada = daftar.data.users.find((u) => u.email?.toLowerCase() === process.env.UJI_EMAIL.toLowerCase())
    if (ada) {
      const hapus = await admin.auth.admin.deleteUser(ada.id)
      if (hapus.error) {
        console.error(`✗ Gagal menghapus pengguna uji: ${hapus.error.message}`)
        process.exit(1)
      }
      console.log(`✓ Pengguna uji dan data terkait dihapus: ${process.env.UJI_EMAIL}`)
      console.log('  PDF contoh lokal (jika ada) tidak dihapus.')
      process.exit(0)
    }
    if (daftar.data.users.length < ukuranHalaman) break
  }
  console.log(`· Pengguna uji tidak ditemukan: ${process.env.UJI_EMAIL}`)
  process.exit(0)
}

console.log('\n═══ Uji alur sertifikat ═══')
console.log(`  Supabase : ${URL_SB}`)
console.log(`  Pengguna : ${EMAIL}`)

// ── 1. Pengguna uji ───────────────────────────────────────────────────────
console.log('\n── 1. Pengguna uji')
const dibuat = await admin.auth.admin.createUser({
  email: EMAIL,
  password: SANDI,
  email_confirm: true, // tanpa konfirmasi email, supaya bisa masuk lewat API
  user_metadata: { full_name: 'Siswa Uji Otomatis', name: 'Siswa Uji Otomatis' },
})
if (dibuat.error) {
  console.error(`✗ Gagal membuat pengguna uji: ${dibuat.error.message}`)
  process.exit(1)
}
const UID = dibuat.data.user.id
lapor(true, `pengguna dibuat (${UID})`)

// ── 2. Masuk sebagai pengguna uji ─────────────────────────────────────────
console.log('\n── 2. Masuk sebagai pengguna uji')
const siswa = createClient(URL_SB, KUNCI_ANON, { auth: { persistSession: false } })
const masuk = await siswa.auth.signInWithPassword({ email: EMAIL, password: SANDI })
if (masuk.error) {
  console.error(`✗ Gagal masuk: ${masuk.error.message}`)
  process.exit(1)
}
lapor(true, 'sesi aktif — auth.uid() ikut teruji')

// ── 3. Beri akses berbayar (pendaftaran + pembelian) ──────────────────────
console.log('\n── 3. Akses berbayar')
const kelas = await admin.from('courses').select('id, harga').eq('slug', SLUG).single()
if (kelas.error || !kelas.data) {
  console.error(`✗ Kelas ${SLUG} tidak ditemukan. Migrasi 0003_seed.sql sudah dijalankan?`)
  process.exit(1)
}

const daftar = await admin
  .from('enrollments')
  .upsert(
    { user_id: UID, course_id: kelas.data.id, sumber: 'pembelian', aktif: true },
    { onConflict: 'user_id,course_id' },
  )
  .select()
lapor(!daftar.error, 'enrollment aktif', daftar.error?.message)

const beli = await admin.from('purchases').insert({
  user_id: UID,
  course_id: kelas.data.id,
  order_id: `UJI-${cap()}`,
  jumlah: kelas.data.harga ?? 0,
  status: 'settlement',
  metode: 'uji-otomatis',
  dibayar_pada: new Date().toISOString(),
})
lapor(!beli.error, 'pembelian tercatat settlement', beli.error?.message)

// ── 4. Selesaikan seluruh pelajaran ───────────────────────────────────────
console.log('\n── 4. Menyelesaikan pelajaran')
const pelajaran = await admin
  .from('lessons')
  .select('jalur, modules!inner(slug, courses!inner(slug))')
  .eq('modules.courses.slug', SLUG)

if (pelajaran.error) {
  console.error(`✗ Gagal mengambil pelajaran: ${pelajaran.error.message}`)
  process.exit(1)
}

// Jumlah pelajaran mengikuti seed (0003_seed.sql), bukan angka tetap —
// seed bertambah saat modul baru lengkap, dan assertion yang usang membuat
// uji ini gagal padahal sistemnya benar.
lapor(pelajaran.data.length > 0, `${pelajaran.data.length} pelajaran ditemukan`)

let selesai = 0
for (const p of pelajaran.data) {
  const { error } = await siswa.rpc('tandai_selesai', {
    p_slug: SLUG,
    p_jalur: p.jalur,
    p_selesai: true,
  })
  if (error) console.log(`      ✗ ${p.jalur}: ${error.message}`)
  else selesai++
}
lapor(selesai === pelajaran.data.length, `${selesai}/${pelajaran.data.length} pelajaran ditandai selesai`)

// ── 5. Kerjakan seluruh kuis ──────────────────────────────────────────────
console.log('\n── 5. Mengerjakan kuis')
const kuis = await admin
  .from('quizzes')
  .select('id, judul, nilai_lulus, modules!inner(slug, courses!inner(slug))')
  .eq('modules.courses.slug', SLUG)

if (kuis.error || !kuis.data) {
  console.error(`✗ Gagal mengambil kuis: ${kuis.error?.message}`)
  process.exit(1)
}
lapor(kuis.data.length === 5, `${kuis.data.length} kuis ditemukan (harus 5)`)

let lulus = 0
for (const k of kuis.data) {
  const modul = k.modules.slug

  // Soal diambil lewat RPC yang dipakai aplikasi — tanpa kunci jawaban.
  const soal = await siswa.rpc('kuis_modul', { p_slug: SLUG, p_modul: modul })
  if (soal.error) {
    console.log(`      ✗ ${modul}: ${soal.error.message}`)
    continue
  }
  const adaKunci = soal.data.some((s) => 'kunci' in s)
  if (adaKunci) lapor(false, `${modul}: kunci jawaban ikut terkirim ke klien`)

  // Kunci jawaban dibaca dengan service role, seperti halnya kunci tidak
  // pernah boleh sampai ke browser.
  const kunci = await admin.from('questions').select('id, kunci').eq('quiz_id', k.id)
  if (kunci.error || !kunci.data?.length) {
    console.log(`      ✗ ${modul}: gagal membaca kunci soal dengan service role: ${kunci.error?.message ?? 'tidak ada soal'}`)
    continue
  }
  const jawaban = {}
  for (const s of kunci.data) jawaban[s.id] = s.kunci?.jawaban

  const nilai = await siswa.rpc('nilai_kuis', { p_quiz_id: k.id, p_jawaban: jawaban })
  if (nilai.error) {
    console.log(`      ✗ ${modul}: ${nilai.error.message}`)
    continue
  }
  const baris = nilai.data?.[0]
  if (baris?.lulus) lulus++
  lapor(
    baris?.lulus === true,
    `${modul}: nilai ${baris?.nilai} (lulus ${k.nilai_lulus}) — ${baris?.benar}/${baris?.total} benar`,
  )
}

// ── 6. Syarat sertifikat ──────────────────────────────────────────────────
console.log('\n── 6. Syarat sertifikat')
const syarat = await siswa.rpc('syarat_sertifikat', { p_slug: SLUG })
const s = syarat.data?.[0]
lapor(
  !syarat.error && s?.siap === true,
  `${s?.pelajaran_selesai}/${s?.total_pelajaran} pelajaran · ${s?.kuis_lulus}/${s?.total_kuis} kuis lulus · siap=${s?.siap}`,
  syarat.error?.message,
)

// ── 7. Terbitkan & verifikasi ─────────────────────────────────────────────
console.log('\n── 7. Terbitkan sertifikat')
let nomor = null
if (s?.siap) {
  const terbit = await siswa.rpc('terbitkan_sertifikat', { p_slug: SLUG })
  const t = terbit.data?.[0]
  nomor = t?.nomor ?? null
  lapor(!terbit.error && !!nomor, `nomor terbit: ${nomor}`, terbit.error?.message)

  if (nomor) {
    const idempoten = await siswa.rpc('terbitkan_sertifikat', { p_slug: SLUG })
    lapor(
      idempoten.data?.[0]?.nomor === nomor,
      'penerbitan idempoten (nomor tidak berubah)',
      idempoten.error?.message,
    )

    const verifikasi = await siswa.rpc('verifikasi_sertifikat', { p_nomor: nomor })
    const v = verifikasi.data?.[0]
    lapor(!verifikasi.error && v?.status === 'aktif', `verifikasi publik: ${JSON.stringify(v)?.slice(0, 120)}`, verifikasi.error?.message ?? 'nomor tidak ditemukan atau status bukan aktif')

    // Pakai metadata penerima/kelas yang sama dengan sumber sertifikat.
    try {
      const { buatPdfSertifikat } = await import('../lib/sertifikat-pdf.mjs')
      const profil = await admin.from('profiles').select('nama').eq('id', UID).single()
      const metadata = JSON.parse(readFileSync(join(ROOT, 'content', SLUG, 'kelas.json'), 'utf8'))
      const pdf = buatPdfSertifikat({
        nomor,
        nama: profil.data?.nama ?? 'Siswa Uji Otomatis',
        judulKelas: metadata.judul,
        tanggal: new Date(t?.terbit_pada ?? Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        instruktur: metadata.instrukturSingkat ?? metadata.instruktur,
        estimasiJam: metadata.estimasiJam ?? null,
      })
      writeFileSync(join(DOK, 'uji-sertifikat.pdf'), pdf)
      lapor(true, `PDF contoh ditulis: docs/uji-sertifikat.pdf (${pdf.length} bita)`)
    } catch (e) {
      lapor(false, 'gagal membuat PDF', e.message)
    }
  }
} else {
  lapor(false, 'syarat belum terpenuhi — sertifikat tidak diterbitkan')
}

// ── 8. Bersih-bersih ──────────────────────────────────────────────────────
console.log('\n── 8. Selesai')
console.log(`  · pengguna uji dipertahankan agar sertifikat tetap bisa diverifikasi publik.`)
console.log(`  · setelah T-14/T-16 selesai, hapus dengan:`)
console.log(`    UJI_BERSIH=1 UJI_EMAIL=${EMAIL} node scripts/uji-alur-sertifikat.mjs`)

if (nomor) {
  console.log(`\n  Sertifikat: ${nomor}`)
  console.log(`  Verifikasi: https://kelas.niumination.web.id/verify/${nomor}  (butuh deployed)`)
}

console.log(gagal === 0 ? '\n✅ ALUR SERTIFIKAT LULUS\n' : `\n❌ ${gagal} PEMERIKSAAN GAGAL\n`)
process.exit(gagal === 0 ? 0 : 1)

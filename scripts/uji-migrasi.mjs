/**
 * Menguji seluruh migrasi secara lokal memakai PGlite (Postgres WASM).
 *
 * Tujuannya: SQL yang dikirim ke Hermes sudah pernah dijalankan, bukan
 * sekadar ditulis. Karena Supabase tidak bisa dijangkau dari sini,
 * auth.uid() dan auth.users ditiru secukupnya.
 *
 *   node scripts/uji-migrasi.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'

const DIREKTORI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'migrations')
const berkas = fs.readdirSync(DIREKTORI).filter((f) => f.endsWith('.sql')).sort()

const db = new PGlite()
let gagal = 0

function lapor(ok, pesan) {
  console.log(`${ok ? '  ✓' : '  ✗'} ${pesan}`)
  if (!ok) gagal++
}

async function sebagaiAuthenticated(jalankan) {
  await db.exec('set role authenticated')
  try {
    return await jalankan()
  } finally {
    await db.exec('reset role')
  }
}

// ── Tiruan lingkungan Supabase ───────────────────────────────
// Peran Supabase — supaya REVOKE/GRANT di migrasi benar-benar teruji
await db.exec(`do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;`)
await db.exec(`do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;`)

await db.exec(`
  create schema if not exists auth;
  create table if not exists auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb default '{}'::jsonb
  );
  create or replace function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
`)

// ── Jalankan migrasi berurutan ───────────────────────────────
for (const f of berkas) {
  const sql = fs.readFileSync(path.join(DIREKTORI, f), 'utf8')
  try {
    await db.exec(sql)
    console.log(`\n▶ ${f} — OK`)
  } catch (e) {
    console.log(`\n▶ ${f} — GAGAL`)
    console.log(String(e.message).split('\n').slice(0, 6).join('\n'))
    gagal++
    break
  }
}

// ── Uji struktural ────────────────────────────────────────────
const tabel = await db.query(`
  select table_name from information_schema.tables
  where table_schema='public' and table_type='BASE TABLE' order by 1
`)
console.log(`\nTabel (${tabel.rows.length}): ${tabel.rows.map((r) => r.table_name).join(', ')}`)
lapor(tabel.rows.length >= 13, 'minimal 13 tabel terbentuk')

const fungsi = await db.query(`
  select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' order by 1
`)
console.log(`Fungsi schema public: ${fungsi.rows.map((r) => r.proname).join(', ')}`)
const hakHelper = await db.query(`
  select has_function_privilege('authenticated', p.oid, 'EXECUTE') as boleh
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='catat_modul_tuntas'
`)
lapor(hakHelper.rows.length === 1 && hakHelper.rows[0].boleh === false, 'helper modul_tuntas tidak bisa dipanggil langsung oleh authenticated')

// ── Uji data: seed ───────────────────────────────────────────
const kursus = await db.query(`select id, slug, status, harga, estimasi_jam from courses`)
lapor(kursus.rows.length === 1, 'satu kelas tersemat (seed)')
const modul = await db.query(`select count(*)::int jml from modules`)
const pelajaran = await db.query(`select count(*)::int jml from lessons`)
lapor(modul.rows[0].jml === 6, `6 modul (dapat ${modul.rows[0].jml})`)
lapor(pelajaran.rows[0].jml === 12, `12 pelajaran (dapat ${pelajaran.rows[0].jml})`)

const estimasi = await db.query(`select coalesce(sum(menit),0)::int total from lessons`)
lapor(kursus.rows[0]?.estimasi_jam === 15, `estimasi database 15 jam (dapat ${kursus.rows[0]?.estimasi_jam})`)
lapor(estimasi.rows[0]?.total === 915, `durasi database 915 menit (dapat ${estimasi.rows[0]?.total})`)
const urutProduksi = await db.query(`
  select l.slug, l.urutan from lessons l
  join modules m on m.id = l.module_id
  where m.slug = 'produksi' order by l.urutan
`)
lapor(
  urutProduksi.rows.map((r) => r.slug).join(',') === 'guardrails,deploy-produksi,observability-evaluasi',
  `urutan produksi sesuai content (dapat ${urutProduksi.rows.map((r) => r.slug).join(',')})`,
)

const gratis = await db.query(`select count(*)::int jml from lessons where akses='gratis'`)
lapor(gratis.rows[0].jml === 4, `4 pelajaran gratis (dapat ${gratis.rows[0].jml})`)

// ── Uji akses anonim ─────────────────────────────────────────
const aksesAnon = await db.query(`select punya_akses_kelas('ai-agent-self-host') as boleh`)
lapor(aksesAnon.rows[0].boleh === true, 'kelas pra-rilis bisa dilihat anonim')

// ── Uji pengguna ─────────────────────────────────────────────
const UID = '11111111-1111-1111-1111-111111111111'
await db.exec(`insert into auth.users (id, email, raw_user_meta_data)
               values ('${UID}', 'siswa@contoh.id', '{"full_name":"Siswa Uji"}'::jsonb)
               on conflict do nothing`)
await db.exec(`select set_config('request.jwt.claim.sub', '${UID}', false)`)

const profil = await db.query(`select id, email, nama, peran from profiles where id='${UID}'`)
lapor(profil.rows.length === 1, 'profil otomatis terbentuk (trigger)')
lapor(profil.rows[0]?.nama === 'Siswa Uji', `nama dari metadata: ${profil.rows[0]?.nama}`)

// Progres: materi gratis boleh, berbayar tidak
try {
  await sebagaiAuthenticated(() => db.exec(`select tandai_selesai('ai-agent-self-host', 'fondasi/kenapa-self-host', true)`))
  lapor(true, 'tandai selesai materi gratis diterima')
} catch (e) {
  lapor(false, `tandai selesai gratis: ${e.message}`)
}

try {
  await sebagaiAuthenticated(() => db.exec(`select tandai_selesai('ai-agent-self-host', 'produksi/guardrails', true)`))
  lapor(false, 'materi berbayar seharusnya ditolak')
} catch {
  lapor(true, 'materi berbayar ditolak sebelum pembelian')
}

const progres = await db.query(`select * from progres_kelas('ai-agent-self-host')`)
lapor(progres.rows.length === 1, `progres tercatat: ${JSON.stringify(progres.rows.map((r) => r.jalur))}`)

// ── Uji pembayaran → entitlement ─────────────────────────────
const idKursus = kursus.rows[0].id
await db.exec(`
  insert into purchases (user_id, course_id, order_id, jumlah, status)
  values ('${UID}', '${idKursus}', 'NIM-UJI-001', 99000, 'pending')
`)
await db.exec(`select proses_webhook('NIM-UJI-001', 'settlement', 'qris', 99000)`)
const enrollment = await db.query(
  `select sumber, aktif from enrollments where user_id='${UID}' and course_id='${idKursus}'`,
)
lapor(
  enrollment.rows.length === 1 && enrollment.rows[0].aktif === true,
  'webhook settlement membuka akses',
)

try {
  await sebagaiAuthenticated(() => db.exec(`select tandai_selesai('ai-agent-self-host', 'produksi/guardrails', true)`))
  lapor(true, 'materi berbayar bisa diselesaikan setelah bayar')
} catch (e) {
  lapor(false, `setelah bayar: ${e.message}`)
}

// Idempotensi webhook
await db.exec(`select proses_webhook('NIM-UJI-001', 'settlement', 'qris', 99000)`)
const jumlahEnroll = await db.query(`select count(*)::int jml from enrollments where user_id='${UID}'`)
lapor(jumlahEnroll.rows[0].jml === 1, 'webhook idempoten (tidak menggandakan enrollment)')

// ── Uji kuis (kalau migrasinya ada) ──────────────────────────
const adaKuis = fungsi.rows.some((r) => r.proname === 'nilai_kuis')
if (adaKuis) {
  const kuis = await db.query(`
    select q.id
    from quizzes q
    join modules m on m.id = q.module_id
    where m.slug = 'fondasi'
    limit 1
  `)
  if (kuis.rows.length) {
    const soal = await sebagaiAuthenticated(() => db.query(`select * from kuis_modul('ai-agent-self-host', 'fondasi')`))
    lapor(soal.rows.length > 0, `kuis_modul mengembalikan ${soal.rows.length} soal`)

    // Bank soal harus sepadan dengan materi: setiap modul berisi kuis,
    // kecuali proyek akhir (yang dinilai dari proyeknya sendiri).
    const perModul = await db.query(`
      select m.slug, count(q.id)::int as soal
      from modules m
      left join quizzes z on z.module_id = m.id
      left join questions q on q.quiz_id = z.id
      group by m.slug, m.urutan
      order by m.urutan
    `)
    const peta = Object.fromEntries(perModul.rows.map((r) => [r.slug, r.soal]))
    const totalSoal = perModul.rows.reduce((n, r) => n + r.soal, 0)
    lapor(totalSoal >= 20, `bank soal: ${totalSoal} soal (minimal 20)`)
    for (const [slug, jumlah] of Object.entries(peta)) {
      if (slug === 'proyek-akhir') continue
      lapor(jumlah >= 3, `modul ${slug}: ${jumlah} soal (minimal 3)`)
    }
    lapor(peta['proyek-akhir'] === 0, 'proyek akhir tidak punya kuis (dinilai dari proyeknya)')
    lapor(
      !('kunci' in (soal.rows[0] ?? {})),
      'kunci jawaban tidak ikut dikirim ke klien',
    )
    // Jawab benar semua
    const kunci = await db.query(`select id, kunci from questions where quiz_id='${kuis.rows[0].id}'`)
    const jawaban = {}
    for (const k of kunci.rows) jawaban[k.id] = k.kunci.jawaban
    const hasil = await sebagaiAuthenticated(() => db.query(`select * from nilai_kuis($1, $2)`, [kuis.rows[0].id, JSON.stringify(jawaban)]))
    lapor(hasil.rows[0]?.nilai === 100, `nilai kuis sempurna: ${hasil.rows[0]?.nilai}`)
    const ulang = await sebagaiAuthenticated(() => db.query(`select * from nilai_kuis($1, $2)`, [kuis.rows[0].id, JSON.stringify(jawaban)]))
    lapor(ulang.rows[0]?.percobaan >= 2, `percobaan tercatat: ${ulang.rows[0]?.percobaan}`)

    const eventFondasi = `
      select count(*)::int jml from events
      where user_id='${UID}' and nama='modul_tuntas'
        and properti->>'slug'='ai-agent-self-host'
        and properti->>'modul'='fondasi'
    `
    const sebelumPelajaranTerakhir = await db.query(eventFondasi)
    lapor(sebelumPelajaranTerakhir.rows[0].jml === 0, 'kuis lulus saja belum menuntaskan modul yang pelajarannya belum lengkap')

    // Urutan 1: kuis lulus lebih dahulu, pelajaran terakhir diselesaikan belakangan.
    await sebagaiAuthenticated(() => db.exec(`select tandai_selesai('ai-agent-self-host', 'fondasi/ollama-101', true)`))
    const setelahPelajaranTerakhir = await db.query(eventFondasi)
    lapor(setelahPelajaranTerakhir.rows[0].jml === 1, 'pelajaran terakhir mencatat modul tuntas jika kuis sudah lulus')

    await sebagaiAuthenticated(() => db.exec(`select tandai_selesai('ai-agent-self-host', 'fondasi/ollama-101', true)`))
    await sebagaiAuthenticated(() => db.query(`select * from nilai_kuis($1, $2)`, [kuis.rows[0].id, JSON.stringify(jawaban)]))
    const setelahPercobaanUlang = await db.query(eventFondasi)
    lapor(setelahPercobaanUlang.rows[0].jml === 1, 'event modul tuntas idempoten setelah klik/percobaan berulang')

    // Urutan 2: semua pelajaran selesai lebih dahulu, baru kuis diluluskan.
    await sebagaiAuthenticated(() => db.exec(`select tandai_selesai('ai-agent-self-host', 'agent-pertama/tool-calling', true)`))
    await sebagaiAuthenticated(() => db.exec(`select tandai_selesai('ai-agent-self-host', 'agent-pertama/byok-keamanan', true)`))
    const kuisAgent = await db.query(`
      select q.id from quizzes q join modules m on m.id=q.module_id
      where m.slug='agent-pertama' limit 1
    `)
    const kunciAgent = await db.query(`select id, kunci from questions where quiz_id=$1`, [kuisAgent.rows[0]?.id])
    const jawabanAgent = Object.fromEntries(kunciAgent.rows.map((k) => [k.id, k.kunci.jawaban]))
    const hasilAgent = await sebagaiAuthenticated(() => db.query(`select * from nilai_kuis($1, $2)`, [kuisAgent.rows[0]?.id, JSON.stringify(jawabanAgent)]))
    lapor(hasilAgent.rows[0]?.lulus === true, 'kuis lulus setelah pelajaran lengkap')
    const eventAgent = await db.query(`
      select count(*)::int jml from events
      where user_id='${UID}' and nama='modul_tuntas'
        and properti->>'slug'='ai-agent-self-host'
        and properti->>'modul'='agent-pertama'
    `)
    lapor(eventAgent.rows[0].jml === 1, 'kuis mencatat modul tuntas jika pelajaran sudah lengkap')
  } else {
    lapor(false, 'belum ada soal tersemat')
  }
}

// ── Uji sertifikat (kalau migrasinya ada) ────────────────────
const adaSertifikat = fungsi.rows.some((r) => r.proname === 'terbitkan_sertifikat')
if (adaSertifikat) {
  try {
    const belum = await db.query(`select * from terbitkan_sertifikat('ai-agent-self-host')`)
    lapor(false, `sertifikat seharusnya belum terbit: ${JSON.stringify(belum.rows[0])}`)
  } catch (e) {
    lapor(true, `sertifikat ditolak sebelum syarat terpenuhi (${e.message.slice(0, 60)}…)`)
  }
}

console.log(`\n${gagal === 0 ? '✅ SEMUA UJI LULUS' : `❌ ${gagal} UJI GAGAL`}`)
process.exit(gagal === 0 ? 0 : 1)

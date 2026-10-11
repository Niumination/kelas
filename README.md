# Kelas Niumination

Platform kelas gratis + berbayar. Kelas pertama: **AI Agent Self-Host** — membangun sistem AI yang berjalan di mesin sendiri, dari `ollama run` sampai siap produksi.

**Persyaratan:** Node.js **22 LTS** (sesuai `.nvmrc` dan versi CI).

```bash
npm ci
cp .env.example .env.local     # opsional — tanpa ini aplikasi berjalan dalam mode demo
npm run dev                    # http://localhost:3000
npm run verifikasi             # typecheck + uji unit + uji migrasi + contoh sertifikat
npm run build                  # build produksi
```

Tanpa variabel environment, aplikasi tetap menampilkan materi gratis dan pratinjau singkat materi berbayar. Login, progres, kuis, dan pembayaran nonaktif.

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | dev server di `0.0.0.0:3000` |
| `npm run typecheck` | periksa tipe TypeScript |
| `npm run uji` | uji unit (encoder QR, tata letak & PDF sertifikat, integritas materi) |
| `npm run db:uji` | **menjalankan seluruh migrasi di Postgres WASM (PGlite)** — termasuk uji akses, kuis, dan sertifikat |
| `npm run contoh` | bangkitkan ulang `docs/contoh-sertifikat.pdf` + kembaran HTML-nya |
| `npm run verifikasi` | typecheck + 39 uji + uji migrasi PGlite + bangkitkan contoh sertifikat |
| `npm run uji:alur` | alur sertifikat end-to-end terhadap Supabase nyata; hanya untuk project uji kelas |

`npm run db:uji` adalah yang terpenting: migrasi yang dikirim ke Hermes sudah pernah dijalankan, bukan sekadar ditulis.

---

## Benang merah

> Platform ini membantu orang Indonesia membangun sistem AI yang berjalan di mesin mereka sendiri — dimulai dari fondasi yang gratis, diakhiri dengan sistem yang siap produksi dan terbukti.

Enam aturan ekstensibilitas ada di [`docs/PRD-kelas-ai-agent.md`](docs/PRD-kelas-ai-agent.md) §0. Yang paling sering relevan saat ngoding:

1. **Fondasi gratis, produksi berbayar.**
2. **Docs-driven** — teks + kode + repo, bukan video.
3. **Konten adalah data** — menambah materi tidak boleh butuh perubahan kode.
4. **Satu pintu akses** — hak akses selalu `enrollments` + `purchases`, tidak pernah flag di halaman.
5. **Publik dulu, instansi belakangan** — fitur B2B adalah lapisan, bukan cabang.
6. **Bahasa Indonesia default.**

---

## Struktur

```
app/
  page.tsx                       beranda
  kelas/page.tsx                 daftar kelas
  kelas/[slug]/page.tsx          detail kelas + kurikulum + cart
  belajar/[kursus]/              pembaca materi + sidebar progres
  masuk/                         login (GitHub · Google · magic link)
  dashboard/                     progres belajar + kuis + sertifikat
  kuis/[kursus]/[modul]/         halaman kuis
  harga/                         tahap harga + FAQ
  verify/                        verifikasi sertifikat publik
  kebijakan/                     refund & privasi
  api/checkout/                  buat transaksi Midtrans Snap
  api/webhooks/midtrans/         webhook — verifikasi signature → entitlement
  api/kuis/                      nilai kuis (diteruskan ke RPC database)
  api/sertifikat/                daftar & terbitkan sertifikat
  api/sertifikat/[nomor]/        unduh PDF (hanya pemiliknya)
  auth/callback|keluar/          OAuth
  aksi.ts                        server action: tandai selesai
components/                      UI & komponen MDX
content/<slug-kelas>/            ← MATERI ADA DI SINI
  kelas.json                     metadata kelas
  <modul>/_modul.json            metadata modul (akses: gratis | berbayar)
  <modul>/<nn>-<judul>.mdx       materi
lib/
  kurikulum.ts                   pembaca konten dari filesystem
  midtrans.ts                    Snap API + verifikasi signature
  qr.mjs                         encoder QR (mode byte, versi 1–6) — tanpa dependensi
  tata-letak-sertifikat.mjs      satu spesifikasi tata letak untuk PDF & HTML
  sertifikat-pdf.mjs             perender PDF sertifikat — tanpa dependensi
  supabase/                      klien server, klien browser, konfigurasi
proxy.ts                         penyegaran sesi (konvensi Next 16 = proxy, bukan middleware)
scripts/uji-migrasi.mjs          menjalankan migrasi di PGlite
scripts/buat-contoh.mjs          bangkitkan contoh sertifikat (PDF + HTML)
tests/pdf.test.mjs               uji struktur PDF & keterbacaan oleh pdf.js
tests/qr.test.mjs                uji encoder QR (didekode balik oleh jsQR)
tests/tata-letak.test.mjs        uji hierarki & batas tata letak sertifikat
tests/materi.test.mjs            uji integritas MDX, frontmatter, dan nomor tugas
supabase/migrations/             0001 skema · 0002 RLS · 0003 seed · 0004 kuis · 0005 sertifikat · 0006 bank soal · 0007 progres modul
.agents/skills/                  panduan pengembangan opsional (bukan dependensi runtime)
skills-lock.json                 sumber + SHA-256 bundle skill

docs/
  PRD-kelas-ai-agent.md          PRD + benang merah & aturan ekstensibilitas
  one-pager-instansi.md          penawaran B2B
  CATATAN-TERTUNDA.md            register pekerjaan yang butuh mesin/kredensial lain
  THIRD-PARTY-NOTICES.md          atribusi dan batas lisensi skill pihak ketiga
  ALUR-KERJA-HERMES.md           protokol serah terima Arena ↔ Hermes
  hermes/PROMPT.md               prompt siap-tempel untuk Hermes Agent
  hermes/TERAPKAN.md             panduan penerapan bertahap ke GitHub/Supabase/Vercel/Midtrans
  hermes/TUGAS.md                checklist status untuk Hermes
  hermes/LAPORAN.md              templat laporan balik
  contoh-sertifikat.pdf|.html    pratinjau tampilan sertifikat
```

## Menambah materi (tanpa menyentuh kode)

**Kelas baru** — buat folder + `kelas.json`:

```
content/nama-kelas/kelas.json
content/nama-kelas/01-modul-pertama/_modul.json
content/nama-kelas/01-modul-pertama/01-judul-pelajaran.mdx
```

**Pelajaran baru** — tambahkan satu berkas `.mdx`:

```markdown
---
judul: Judul pelajaran
ringkasan: "Satu kalimat. Wajib diapit tanda kutip kalau mengandung titik dua."
menit: 20
urutan: 3
tags: [konsep, contoh]
---

Isi materi. Komponen yang tersedia: <Callout>, <Terminal>, <Tugas>, <Langkah>, <Preview>.
```

Frontmatter diurai dengan YAML — **berkas yang mengandung `:` wajib diapit tanda kutip**.

Jangan lupa sinkronkan ke database: tambahkan modul/pelajaran yang sama di `supabase/migrations/0003_seed.sql` supaya progres dan kuis bisa merujuk pelajaran itu.

---

## Setup Supabase

1. Buat project di [supabase.com](https://supabase.com) — **terpisah** dari project instansi mana pun.
2. Jalankan migrasi berurutan di SQL Editor:

   ```
   0001_init.sql        13 tabel + trigger profil
   0002_rls.sql         RLS + fungsi akses
   0003_seed.sql        metadata kurikulum (6 modul, 12 pelajaran)
   0004_kuis.sql        view aman + penilaian sisi server
   0005_sertifikat.sql  nomor unik + syarat terbit
   0006_bank_soal.sql   23 soal (5 kuis: 4+5+5+4+5)
   0007_progres_modul.sql   progres modul idempoten, terlepas dari urutan kuis/pelajaran
   ```

   Verifikasi: 12 lessons, 23 questions, 5 quizzes, 6 modules, 15 RPC functions; `courses.estimasi_jam=15` dan `sum(lessons.menit)=915`.
3. **Authentication → Providers**: aktifkan GitHub dan Google setelah membuat OAuth apps; gunakan callback URL Supabase yang ditampilkan pada konfigurasi provider. Jangan mematikan konfirmasi email sebagai jalan pintas.
4. **Authentication → URL Configuration**:
   - Site URL: `https://kelas.niumination.web.id`
   - Redirect URLs: tambahkan `https://kelas.niumination.web.id/auth/callback` dan `http://localhost:3000/auth/callback`
5. Salin **Project URL** dan **anon key** ke `.env.local`.
6. Untuk login email magic link, atur **custom SMTP** Supabase sebelum dibuka ke publik; SMTP bawaan dibatasi. Detail Resend + DNS + pengujian ada di [`docs/hermes/TERAPKAN.md`](docs/hermes/TERAPKAN.md) (T-17). Catatan: email transaksional (pembelian/akses/sertifikat) yang tercantum sebagai arah di PRD belum tersambung di kode saat ini.

RLS menyala di semua tabel. Yang perlu diketahui:

- Tabel `questions` berisi `kunci` jawaban. Migrasi `0004_kuis.sql` sudah mencabut akses langsung dan membuat view `questions_publik`; jangan membuka tabel sumber ke browser.
- Fungsi `punya_akses_kelas`, `progres_kelas`, `tandai_selesai`, `proses_webhook`, dan `verifikasi_sertifikat` berjalan sebagai `SECURITY DEFINER` — jangan ubah tanpa membaca ulang logikanya.

---

## Setup Midtrans (Fase 2)

1. Daftar akun **bisnis** di [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com). Ajukan verifikasi di **minggu ke-5**, bukan minggu ke-7 — prosesnya bisa 1–2 minggu.
2. Ambil Server Key dan Client Key, taruh di `.env.local`.
3. **Settings → Configuration**:
   - Payment Notification URL: `https://kelas.niumination.web.id/api/webhooks/midtrans`
   - Finish / Unfinish / Error Redirect: `https://kelas.niumination.web.id/dashboard`
4. Aktifkan metode: QRIS, Virtual Account (BCA, Mandiri, BNI, BRI, Permata), GoPay, ShopeePay, kartu kredit.
5. Uji dengan transaksi Rp 10.000 secara nyata sebelum membuka early bird.

Fee (Juli 2026): QRIS **0,7%** (MDR diatur Bank Indonesia), VA ~Rp 4.000, e-wallet 1,5–2%, kartu 2,9% + Rp 2.000.

Alur pembayaran:

```
klik Beli → POST /api/checkout → simpan purchases(pending) → Snap token
  → popup Midtrans → siswa bayar → POST /api/webhooks/midtrans
  → verifikasi SHA512 signature → proses_webhook() → enrollments → akses terbuka
```

Signature dihitung dari `order_id + status_code + gross_amount + server_key`. Webhook yang tidak cocok ditolak dengan 401.

---

## Kuis & sertifikat

**Penilaian kuis terjadi di dalam database**, bukan di JavaScript:

```
browser → POST /api/kuis → RPC nilai_kuis() → bandingkan dengan questions.kunci → simpan
```

- Kunci jawaban tidak pernah dikirim ke browser: tabel `questions` dicabut akses bacanya dari peran `anon`/`authenticated`, diganti view `questions_publik` yang membuang kolom `kunci`.
- Kuis modul berbayar menolak peserta yang belum punya enrollment.
- Tidak ada batas percobaan; yang tersimpan tiap percobaan dan yang dipakai untuk syarat sertifikat adalah status lulus.

**Sertifikat** saat ini terbit kalau semua pelajaran ditandai selesai **dan** semua kuis lulus — keduanya diperiksa oleh `syarat_sertifikat()`. Persetujuan instruktur untuk proyek akhir belum ditegakkan otomatis (T-15); ini keputusan manual yang terdokumentasi. Nomor berbentuk `NIUM-<tahun>-<KODE>-<6 karakter>` dengan huruf yang mudah tertukar (0/O, 1/I/L) sengaja dibuang. PDF-nya dibuat sendiri tanpa dependensi (`lib/sertifikat-pdf.mjs`), dan hanya pemilik sertifikat yang bisa mengunduhnya.

Tata letaknya ditulis sekali di `lib/tata-letak-sertifikat.mjs`, lalu dirender ke dua tempat: PDF dan kembaran HTML untuk tinjauan visual. Jadi keduanya tidak mungkin bergeser sendiri-sendiri. Desainnya mengikuti temuan riset: minimalis, dua keluarga huruf (Helvetica untuk teks, Times untuk nama penerima — dan nama penerima adalah elemen terbesar), satu warna aksen, garis tipis bukan ornamen, serta **QR verifikasi** yang menunjuk ke `/verify/<nomor>` (QR-nya juga disandikan sendiri, `lib/qr.mjs`).

Pratinjau tampilan: buka `docs/contoh-sertifikat.html`, atau unduh PDF contohnya di `docs/contoh-sertifikat.pdf`. Bangkitkan ulang keduanya dengan `npm run contoh`.

---

## Deploy

```bash
# Vercel
vercel --prod

# DNS di niumination.web.id
kelas   CNAME   cname.vercel-dns.com
```

Env yang wajib dipasang di Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`.

---

## Status pengerjaan (roadmap 12 minggu)

| Fase | Minggu | Status |
|---|---|---|
| 1 — Fondasi | 1–4 | 🟡 Scaffold, skema DB, RLS, kurikulum, 2 modul gratis (4 pelajaran) **selesai**. Tersisa: deploy, DNS, auth produksi, dan soft launch ke komunitas. |
| 2 — Monetisasi | 5–8 | 🟡 Integrasi Midtrans **kode sudah siap**, tinggal kredensial + verifikasi akun bisnis. Seluruh materi berbayar (B1–B7 + proyek akhir, 8 pelajaran) sudah lengkap dan hanya tampil penuh setelah entitlement. |
| 3 — Kuis & B2B | 9–12 | ✅ **Kuis & sertifikat selesai** (bank soal 23 soal, penilaian server-side, PDF + QR tanpa dependensi, `/verify`) **dan seluruh modul berbayar lengkap**: orkestrasi, konteks, produksi, proyek akhir. |

Yang tidak bisa diselesaikan dari sandbox ini tercatat di [`docs/CATATAN-TERTUNDA.md`](docs/CATATAN-TERTUNDA.md), lengkap dengan penanggung jawab dan langkah persisnya. Acuan eksekusi Hermes: [`docs/hermes/TERAPKAN.md`](docs/hermes/TERAPKAN.md); statusnya di [`docs/hermes/TUGAS.md`](docs/hermes/TUGAS.md).

Checklist sebelum minggu 5 ada di PRD §5.

---

## Lisensi

Kode: MIT. Materi gratis (4 pelajaran pada 2 modul fondasi): MIT, dengan mencantumkan sumber. Materi berbayar: hak akses pribadi, bukan lisensi untuk diajarkan ulang. Karena direktori `content/` juga memuat materi berbayar, pemilik memilih repo GitHub privat (9 Oktober 2026); publikasi source baru boleh dipertimbangkan setelah konten berbayar dipisah.

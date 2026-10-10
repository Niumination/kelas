# Terapkan Kelas Niumination ke Ekosistem

**Untuk:** Hermes Agent di laptop
**Dari:** Arena (sandbox pengembangan)
**Isi:** instruksi berurutan untuk menghidupkan proyek ini di ekosistem nyata — repo, database, deploy, pembayaran, sampai sertifikat pertama terbit.

Dokumen ini **menggantikan `TUGAS.md` sebagai acuan eksekusi**. `TUGAS.md` cukup dipakai sebagai penanda status; urutan dan perintahnya ada di sini.

---

## Cara memakai dokumen ini

1. **Kerjakan berurutan.** Fase berikutnya bergantung pada fase sebelumnya.
2. **Berhenti kalau gagal.** Jangan mencari akal yang menyentuh data nyata.
3. **Laporkan keluarannya apa adanya** di `docs/hermes/LAPORAN.md` — termasuk perintah yang gagal dan pesan error lengkapnya. Jangan disunting supaya terlihat berhasil.
4. **Centang** setiap butir yang selesai (ganti `[ ]` jadi `[x]` di `LAPORAN.md`).
5. `npm run verifikasi` **wajib hijau** sebelum pindah fase. Skrip `npm run uji:alur` sengaja butuh `SUPABASE_SERVICE_ROLE_KEY` lokal; jangan jalankan di project produksi tanpa persetujuan pemilik.

**Konvensi di dokumen ini:**
- `← Kamu` artinya butuh identitas atau keputusan manusia; Hermes tidak bisa mengerjakannya sendiri.
- Blok perintah bisa disalin langsung.
- "Hasil yang diharapkan" adalah cara Hermes tahu langkahnya selesai.

---

## Peta ekosistem

Yang dibutuhkan proyek ini dari lingkungan nyata:

| Kebutuhan | Tempat | Dipakai untuk |
|---|---|---|
| Repo Git | `github.com/Niumination/kelas` (**private sementara**) | kode, CI, riwayat; berisi materi MDX berbayar |
| Project Supabase | supabase.com (project **tersendiri**) | database, auth, RLS |
| Project Vercel | vercel.com | hosting Next.js |
| Subdomain | `kelas.niumination.web.id` (CNAME) | alamat publik |
| Akun Midtrans | dashboard.midtrans.com | pembayaran (Fase 6) |
| Ollama di laptop | `localhost:11434` | verifikasi contoh materi (Fase 3) |

> **Penting:** project Supabase untuk kelas ini harus **terpisah** dari project instansi mana pun. Skema di sini memakai `auth.users`, dan mencampurnya dengan data instansi akan menyulitkan di kemudian hari.

---

## Fase 0 — Siapkan sumber & mesin

### 0.1 Pastikan sumber proyek tersedia

Hermes harus dijalankan di mesin yang memiliki **seluruh direktori proyek `kelas/` ini** — bukan folder kosong. Jika Hermes belum bisa melihat berkas proyek, salin/sinkronkan direktori proyek utuh dari workspace Arena ke laptop terlebih dahulu; jangan mulai dengan membuat repo kosong. Pertahankan `content/`, `supabase/`, `app/`, `lib/`, `scripts/`, dan `docs/`.

```bash
cd kelas
ls content/ai-agent-self-host
```

Yang harus terlihat: `kelas.json` serta enam folder modul. Jangan menyalin `node_modules/`, `.next/`, atau `.env.local` dari sumber lain.

### 0.2 Periksa alat

```bash
node --version     # >= 22.0.0 (repo memakai .nvmrc: 22)
npm --version
git --version
gh auth status     # GitHub CLI sudah login
python3 --version  # Python >= 3.10 untuk contoh materi
vercel --version
ollama --version   # untuk Fase 3
```

Pasang yang belum ada dari sumber resminya sesuai OS:

- Node.js LTS: `https://nodejs.org/`
- GitHub CLI: `https://cli.github.com/` — lalu `gh auth login`
- Vercel CLI: `npm install -g vercel` — lalu `vercel login`
- Python 3.10+: `https://www.python.org/downloads/`
- Ollama: `https://ollama.com/download`

Login `gh` dan Vercel mungkin meminta browser atau persetujuan Kamu; Hermes tidak boleh menyalin token ke berkas proyek.

Setelah Node 22 siap, pasang dependensi dan uji sebelum menghubungkan akun/database apa pun:

```bash
npm ci
npm run verifikasi
npm run build
```

**Hasil yang diharapkan:** seluruh uji, migrasi PGlite, typecheck, generator contoh, dan build lulus tanpa kredensial.

**Hasil yang diharapkan untuk fase ini:** alat tersedia, akses GitHub/Vercel berhasil, dan Hermes bekerja di direktori yang benar.

---

## Fase 1 — Repo GitHub  `→ T-05`

**Keputusan pemilik (9 Oktober 2026): repo GitHub dibuat private dulu.** Direktori `content/` berisi seluruh materi MDX berbayar; repo publik akan membuka unduh langsung yang melewati checkout dan `enrollments`. Jangan ubah visibility tanpa persetujuan. Kalau kelak perlu repo app publik, konten berbayar harus dipisahkan ke sumber private terlebih dahulu.

```bash
cd kelas
git init
git branch -M main
# Pastikan .env.local tidak ikut ke Git bila berkas itu sudah ada.
if [ -f .env.local ]; then git check-ignore .env.local; fi
git add .
git status --short
git diff --cached --stat
git commit -m "feat: platform kelas — Next.js 16 + Supabase + Midtrans

- skema database 13 tabel + RLS + 15 fungsi RPC
- 12 pelajaran AI Agent Self-Host (4 gratis, 8 berbayar)
- kuis berpenilaian server, sertifikat PDF + QR tanpa dependensi
- integrasi Midtrans Snap + webhook terverifikasi"

gh repo create Niumination/kelas --private --source=. --remote=origin --push
```

**Hasil yang diharapkan:** `github.com/Niumination/kelas` berisi seluruh berkas di branch `main` dan **private**, lalu tab **Actions** menampilkan workflow CI yang hijau (typecheck · uji · uji migrasi · build).

Jika repo `Niumination/kelas` sudah dibuat lebih dulu, jangan jalankan `gh repo create` lagi. Periksa visibilitas sebelum mendorong source:

```bash
gh repo view Niumination/kelas --json visibility -q .visibility  # harus PRIVATE
git remote -v
```

Jika hasilnya `PUBLIC`, **berhenti**; minta pemilik menjadikannya private dan verifikasi lagi sebelum push. Setelah status `PRIVATE`, pastikan remote benar lalu push ke branch `main` tanpa `--force`.

**Kalau gagal:**
- `gh: command not found` → pasang GitHub CLI, lalu `gh auth login`.
- CI merah → jalankan `npm run verifikasi` dan `npm run build` secara lokal, salin keluarannya ke laporan. Jangan memperbaiki CI dengan menonaktifkan langkahnya.

---

## Fase 2 — Database & Auth  `→ T-01, T-02, T-03, T-17`

### 2.1 Buat project Supabase  `← Kamu`

Yang dikerjakan **Kamu** di supabase.com: buat project baru khusus kelas ini, di region terdekat (Singapore).

Setelah project siap, **Hermes** mengambil kredensialnya dari Project Settings → API dan mengisi `.env.local`:

```bash
cp .env.example .env.local
# isi:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY (hanya lokal untuk npm run uji:alur; jangan expose)
#   NEXT_PUBLIC_SITE_URL=http://localhost:3000   (sementara, saat pengembangan)
```

**Hasil yang diharapkan:** `npm run dev` menampilkan aplikasi tanpa lencana **MODE DEMO**. `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai skrip uji lokal; jangan kirim ke browser, GitHub, Vercel, atau laporan.

### 2.2 Jalankan migrasi berurutan

Buka **SQL Editor** Supabase, jalankan berkas-berkas ini **satu per satu, berurutan**:

```
supabase/migrations/0001_init.sql
supabase/migrations/0002_rls.sql
supabase/migrations/0003_seed.sql
supabase/migrations/0004_kuis.sql
supabase/migrations/0005_sertifikat.sql
supabase/migrations/0006_bank_soal.sql
```

Lalu verifikasi:

```sql
select count(*) from lessons;      -- harus 12
select count(*) from questions;    -- harus 23
select count(*) from quizzes;      -- harus 5
select count(*) from modules;      -- harus 6

select count(*) from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'; -- harus 13; view questions_publik tidak dihitung

select proname from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' order by 1;   -- harus 15 fungsi
```

**Hasil yang diharapkan:** 12 pelajaran · 23 soal · 5 kuis · 6 modul · 13 tabel · 15 fungsi.

**Kalau gagal:** migrasi ini sudah diuji di PGlite (`npm run db:uji` hijau). Kalau gagal di Supabase, kemungkinan besar karena perbedaan lingkungan (peran `anon`/`authenticated` sudah ada di sana, atau ekstensi yang belum aktif). **Laporkan pesan error lengkapnya** — jangan menyunting berkas migrasi yang sudah dijalankan.

### 2.3 Aktifkan OAuth GitHub & Google  `← Kamu`

Untuk setiap provider, buat OAuth app/client di akun milikmu. Di halaman provider Supabase, salin callback URL Supabase yang ditampilkan (umumnya `https://<project-ref>.supabase.co/auth/v1/callback`) ke daftar callback/redirect provider GitHub dan Google. Jangan menebak project-ref. Tempel Client ID/Secret ke **Authentication → Providers** di Supabase.

- **Authentication → Providers**: GitHub **on**, Google **on**
- **Authentication → URL Configuration → Site URL**: `https://kelas.niumination.web.id`
- **Redirect URLs** (keduanya): `https://kelas.niumination.web.id/auth/callback` dan `http://localhost:3000/auth/callback`
- Google: selesaikan consent screen; jika masih Testing, tambahkan akunmu sebagai test user.

**Hasil yang diharapkan:** Kamu mencoba login GitHub dan Google di browser; keduanya mendarat di `/dashboard`.

### 2.4 Email magic link produksi  `→ T-17 · Kamu + Hermes`

Form `/masuk` memakai `supabase.auth.signInWithOtp()`. Email SMTP bawaan Supabase dibatasi dan tidak boleh dianggap layanan produksi. Konfigurasikan Resend sebagai SMTP Supabase:

1. Kamu membuat akun Resend dan memverifikasi domain pengirim; terbitkan record SPF/DKIM dari dashboard Resend pada DNS domainmu. Jangan lanjut sebelum status domain Verified.
2. Buat API key pengiriman Resend. **Jangan** taruh kunci di repo, `.env.local`, Vercel, atau `LAPORAN.md`.
3. Supabase → **Authentication → Email → SMTP Settings**: aktifkan custom SMTP; Host `smtp.resend.com`, Port `465`, Username `resend`, Password API key Resend, Sender name `Kelas Niumination`, Sender email yang sudah diverifikasi.
4. Uji dari `/masuk` dengan alamat email milikmu; klik tautan dan pastikan sesi mendarat di `/dashboard`.

Kunci SMTP hanya disimpan di Supabase. Aplikasi web tidak membaca `RESEND_API_KEY`, jadi `.env.example` tidak meminta variabel itu. Jika `kelas@niumination.web.id` belum disahkan sebagai alamat pengirim, minta keputusan Kamu sebelum memilih alamat lain.

Rujukan resmi: `https://supabase.com/docs/guides/auth/auth-smtp` · `https://resend.com/docs/send-with-supabase-smtp`.

> **Hermes tidak bisa menguji alur email/OAuth dari CLI saja** — browser, akun provider, dan inbox milikmu diperlukan. Kamu mencoba ketiga metode masuk (GitHub, Google, magic link), lalu catat hasilnya di laporan.

> **Batas cakupan email:** T-17 hanya mengaktifkan email **magic link untuk login**. Email konfirmasi pembelian/akses/sertifikat yang disebut sebagai arah produk di PRD belum diimplementasikan di webhook/aplikasi. Jangan menyatakan email transaksional aktif dan jangan menambahkan `RESEND_API_KEY` ke Vercel; itu memerlukan pekerjaan kode terpisah.

---

## Fase 3 — Verifikasi contoh kode dengan Ollama nyata  `→ T-08`

Ini fase yang paling menentukan kredibilitas kelas. Seluruh modul berbayar berisi kode yang dijanjikan bisa dijalankan; kalau ada yang tidak jalan, yang dipertanyakan bukan satu berkas, melainkan semuanya.

Periksa dahulu apakah Ollama API sudah hidup; jangan menjalankan server kedua pada port yang sama:

```bash
curl -fsS http://localhost:11434/api/tags
# Jika belum hidup: buka terminal kedua, jalankan `ollama serve`, lalu ulangi curl.
ollama pull qwen2.5:7b-instruct-q4_K_M
ollama pull nomic-embed-text
ollama show qwen2.5:7b-instruct-q4_K_M
```

Di setiap pelajaran, baca blok kode utuh dan ikuti nama berkas/dependensi yang disebutkan sebelum menjalankan perintah Terminal. Contoh `python ...` di materi biasanya dijalankan **setelah** kode contoh disalin ke berkas tersebut; berkas contoh tidak semuanya disediakan sebagai file mandiri di repo.

Lalu verifikasi per modul:

| Modul | Yang dijalankan | Hasil yang diharapkan | Yang paling sering gagal |
|---|---|---|---|
| G2 | `ollama pull qwen2.5:7b-instruct-q4_K_M`, `ollama ps`, contoh `curl /api/chat` | model menjawab; `eval rate` tampil | nama model tidak ada di registry |
| G3 | `python agent.py` | agent memanggil `baca_berkas` lalu `hitung` | model bukan varian *instruct*, tool tak pernah dipanggil |
| G4 | `keyring.set_password` / `get_password` | kunci tersimpan lalu terbaca | backend keyring absen di Linux tanpa GNOME Keyring |
| B1 | `python uji_verifier.py`, `python orkestrator.py` | verifier lulus; jejak tercetak | keluaran model tidak sesuai skema `Rencana` |
| B2 | `python jalankan_supervisor.py` | dua tugas selesai; anggaran tercetak | `psycopg` belum terpasang |
| B3 | `python jalankan.py`, `python evaluasi.py` | potongan tersimpan; `recall@5` tercetak | dimensi embedding bukan 768; ekstensi `vector` belum aktif |
| B4 | `python -c 'from registry import Registry, Izin; import alat; r = Registry(); alat.muat(r); print([t.nama for t in r.aktif(Izin.TULIS)])'` | tiga tool terdaftar | modul di `alat/` tidak terimpor |
| B5 | `python uji_pagar.py` | `jalankan_shell` ditolak, `baca_berkas` diizinkan | `maks_izin` salah, jadi `PermissionError` tak muncul |
| B6 | `docker compose up -d` lalu `curl localhost:8080/health` | status jujur: model + database + disk | `start_period` terlalu pendek untuk Ollama |
| B7 | `python eval_lari.py`, `python gerbang.py` | skor tercetak; gerbang menolak regresi | hakim model tidak mengembalikan angka |

**Yang harus dilaporkan:**
- versi Ollama
- `eval rate` dan porsi GPU/CPU (`ollama ps`) untuk `qwen2.5:7b-instruct`
- berapa kali agent gagal memanggil tool dari 10 percobaan
- **mana yang gagal dan di baris mana** — bukan sekadar "sudah dijalankan"

Angka-angka itu dipakai di materi dan di halaman kelas. Perbaikan kodenya dikerjakan Arena berdasarkan laporanmu.

---

## Fase 4 — Alur sertifikat ujung ke ujung  `→ T-13`

Rantai terpanjang di sistem: semua pelajaran selesai → semua kuis lulus → sertifikat terbit → bisa diverifikasi publik.
**Hermes tidak bisa mengujinya lewat browser** (tidak bisa login OAuth, tidak bisa mengklik 12 pelajaran). Karena itu ada skrip khusus:

```bash
npm run uji:alur
```

Skripnya (`scripts/uji-alur-sertifikat.mjs`) akan:

1. membuat pengguna uji, lalu **masuk sebagai pengguna itu** (jadi RLS dan `auth.uid()` ikut teruji);
2. memberinya akses berbayar (enrollment + pembelian `settlement`);
3. menandai 12 pelajaran selesai lewat `tandai_selesai()`;
4. mengerjakan 5 kuis lewat `kuis_modul()` → `nilai_kuis()`, dengan kunci jawaban dibaca memakai service role (seperti aplikasi yang tidak pernah mengirim kunci ke browser);
5. memeriksa `syarat_sertifikat()`;
6. menerbitkan sertifikat, memastikan **penerbitannya idempoten**, lalu memverifikasinya;
7. menulis `docs/uji-sertifikat.pdf` memakai generator yang sama dengan rute unduh.

**Batas uji ini:** akses dan pembelian `settlement` disiapkan langsung memakai service role, jadi skrip ini **tidak menguji checkout atau webhook Midtrans** — itu Fase 6. Ia juga menguji syarat sertifikat yang ada sekarang; persetujuan instruktur T-15 tetap keputusan manual (lihat `docs/CATATAN-TERTUNDA.md`).

**Hasil yang diharapkan:**

```
✓ 12 pelajaran ditemukan (harus 12)
✓ 12/12 pelajaran ditandai selesai
✓ 5 kuis ditemukan (harus 5)
✓ modul fondasi: nilai 100 (lulus 70)
✓ modul orkestrasi: nilai 100 (lulus 70)
✓ 12/12 pelajaran · 5/5 kuis lulus · siap=true
✓ nomor terbit: NIUM-2026-AIAGENT-XXXXXX
✅ ALUR SERTIFIKAT LULUS
```

Pengguna uji **sengaja dipertahankan** supaya halaman verifikasi publik tetap punya data saat Kamu memeriksa QR (T-16). PDF uji juga dapat ditinjau untuk T-14. Setelah pemeriksaan selesai, hapus akun uji (termasuk enrollment, pembelian, progres, kuis, dan sertifikat yang terkait) dengan:

```bash
UJI_BERSIH=1 UJI_EMAIL=<email-nya> node scripts/uji-alur-sertifikat.mjs
```

**Kalau gagal:** salin seluruh keluarannya. Skrip ini belum pernah dijalankan dari sandbox — ia butuh Supabase sungguhan — jadi kegagalan pertamanya bukan aib, melainkan temuan.

---

## Fase 5 — Deploy  `→ T-06, T-07`

### 5.1 Vercel

Pastikan akun Vercel milikmu sudah login (`vercel login`). Jika project belum pernah dihubungkan, jalankan `vercel link` di direktori proyek dan pilih/buat project **kelas** yang benar. Pasang env di dashboard dahulu, lalu deploy:

```bash
vercel --prod
```

Pasang env yang benar-benar dipakai aplikasi di dashboard Vercel (jangan pernah di-commit):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL       = https://kelas.niumination.web.id
MIDTRANS_IS_PRODUCTION     = false   (naik ke true setelah akun produksi aktif)
MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` **jangan dipasang di Vercel**: aplikasi web tidak memerlukannya. Kunci itu hanya untuk skrip administrasi lokal `npm run uji:alur`, disimpan di `.env.local` yang diabaikan Git. Jangan pernah mengeksposnya ke browser atau menempelkannya ke laporan.

**Hasil yang diharapkan:** build sukses dan situs bisa dibuka di alamat `*.vercel.app`. Setelah nomor dari Fase 4 tersedia, buka `/verify/<nomor>` di domain live dan pastikan nama + status sertifikat tampil benar.

### 5.2 Domain  `← Kamu`

Di pengelola DNS `niumination.web.id`:

```
kelas   CNAME   cname.vercel-dns.com
```

Lalu di Vercel → Settings → Domains, tambahkan `kelas.niumination.web.id`.

**Hasil yang diharapkan:** `https://kelas.niumination.web.id` terbuka dengan HTTPS valid, tanpa peringatan sertifikat.

### 5.3 Perbarui konfigurasi yang bergantung domain

Setelah domain hidup, tiga tempat harus disamakan:

1. Supabase → Authentication → URL Configuration → Site URL: `https://kelas.niumination.web.id`
2. `.env.local` → `NEXT_PUBLIC_SITE_URL=https://kelas.niumination.web.id`
3. Midtrans (Fase 6) → URL notifikasi: `https://kelas.niumination.web.id/api/webhooks/midtrans`

---

## Fase 6 — Pembayaran  `→ T-04, T-09`

### 6.1 Ajukan verifikasi akun bisnis  `← Kamu`

Mulai **paling lambat minggu ke-5** — prosesnya bisa makan 1–2 minggu. Siapkan data usaha; Midtrans butuh verifikasi sebelum transaksi produksi bisa jalan.

Sambil menunggu, Hermes memasang kunci **sandbox**:

```bash
# .env.local
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

### 6.2 Uji transaksi

1. Satu transaksi **sandbox** lewat tombol Beli di UI.
2. Pastikan webhook diterima:

```sql
select order_id, status, metode, dibayar_pada from purchases order by dibuat_pada desc limit 5;
select user_id, sumber, aktif from enrollments order by dibuat_pada desc limit 5;
```

Status harus berubah `pending` → `settlement`, dan baris `enrollments` bertambah.

3. Setelah akun produksi aktif: satu transaksi **Rp 10.000 dari akunmu sendiri**, lalu ulangi pemeriksaan di atas.

**Kalau webhook tidak masuk:**
- pastikan URL notifikasi di dashboard Midtrans **persis** `https://kelas.niumination.web.id/api/webhooks/midtrans`;
- pastikan rute itu tidak terlindungi auth (lihat `proxy.ts`);
- cek log Vercel untuk permintaan yang masuk.

---

## Fase 7 — Serah terima ke Kamu  `← T-11, T-12, T-14, T-16, T-15`

Setelah Fase 1–6 selesai, yang tersisa memang butuh manusia:

| ID | Item | Mengapa bukan Hermes |
|---|---|---|
| T-11 | Soft launch & sebar ke komunitas | butuh identitas dan jaringanmu |
| T-12 | Kirim penawaran B2B | butuh relasi instansi |
| T-14 | Tinjau tampilan sertifikat | butuh mata manusia; buka `docs/uji-sertifikat.pdf` |
| T-15 | Setujui proyek akhir peserta | keputusan manusia dengan rubrik |
| T-16 | Pindai QR sertifikat hasil cetak | butuh kamera ponsel |

Hermes menyiapkan bahan untuk T-14 dan T-16: `docs/contoh-sertifikat.pdf`, `docs/contoh-sertifikat.html`, dan `docs/uji-sertifikat.pdf`.

---

## Rutin setelahnya

Setiap kali menarik perubahan dari Arena:

```bash
git pull
npm install
npm run verifikasi     # typecheck + 39 uji + uji migrasi + bangkitkan contoh
npm run dev
```

Kalau ada perubahan pada `supabase/migrations/`, jalankan hanya berkas **baru** ke SQL Editor — yang sudah pernah dijalankan tidak boleh disunting.

Keamanan rutin:

```bash
pip install pre-commit
pre-commit install
gitleaks detect        # harus tanpa temuan
```

Kalau `gitleaks` menemukan sesuatu: **cabut kuncinya di penyedia dulu, baru bersihkan riwayat.** Urutan yang terbalik membuat kunci itu tetap hidup di tangan orang lain.

---

## Yang tidak boleh dilakukan Hermes

1. **Jangan mengubah `docs/PRD-kelas-ai-agent.md` §0** (benang merah & enam aturan) tanpa persetujuan. Itu konstitusi proyek.
2. **Jangan menyunting migrasi yang sudah dijalankan.** Perubahan baru = berkas `0007_*.sql`.
3. **Jangan menaruh kredensial di kode atau commit.** Hanya `.env.local` dan dashboard.
4. **Jangan `git push --force` ke `main`.**
5. **Jangan menghapus berkas di `content/`** tanpa konfirmasi — itu materi, bukan cache.
6. **Jangan memindahkan materi berbayar ke gratis** demi trafik, dan jangan mengunci materi yang seharusnya gratis.
7. **Jangan menyunting berkas di `docs/contoh-sertifikat.*` atau `docs/uji-sertifikat.pdf` dengan tangan** — keduanya dibangkitkan; sunting `lib/tata-letak-sertifikat.mjs` lalu jalankan `npm run contoh`.
8. Kalau gagal dengan cara yang tidak dipahami, **berhenti dan laporkan**.

---

## Format laporan

Isi `docs/hermes/LAPORAN.md` minimal dengan:

```
Fase          : 0/1/2/3/4/5/6
Perintah      : yang dijalankan, persis
Keluaran      : disalin apa adanya
Menyimpang    : apa yang berbeda dari dokumen ini, dan mengapa
Butuh keputusan: butir yang tidak bisa diputus sendiri
```

Satu laporan per fase. Arena membacanya, memperbaiki kalau perlu, lalu siklus berulang.

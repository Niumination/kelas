# Catatan Pekerjaan Tertunda

**Konvensi:** setiap pekerjaan yang *tidak bisa diselesaikan dari sandbox* dicatat di sini — lengkap dengan alasannya, penanggung jawabnya, dan langkah persisnya agar tidak ada yang hilang saat serah terima. Dokumen ini diperbarui di setiap akhir sesi kerja.

Penanggung jawab:
- **Arena (sini)** — eksperimen, draf kode & materi, audit, pengujian tanpa kredensial
- **Hermes** — agen di laptop: eksekusi repo lokal, git push, deploy, konfigurasi akun
- **Kamu** — keputusan, persetujuan, dan hal yang butuh identitas/instansi

---

## Ringkasan

| ID | Item | Penanggung jawab | Status |
|---|---|---|---|
| T-01 | Buat project Supabase & isi kredensial | Kamu + Hermes | ✅ **SELESAI 11 Okt 2026** — `kelas-niumination` / `xjefqbhavevfkhcunwmc` |
| T-02 | Jalankan migrasi ke Supabase | Hermes | ✅ **SELESAI 11 Okt 2026** — 6 migrasi, 22 pelajaran, 23 soal |
| T-03 | Aktifkan OAuth GitHub & Google | Kamu | ✅ **SELESAI 11 Okt 2026** — diuji pemilik di live site |
| T-04 | Verifikasi akun bisnis Midtrans | Kamu | ⏸ TERTUNDA — **mulai minggu ke-5** |
| T-05 | Buat repo GitHub baru | Kamu + Hermes | ✅ **SELESAI 9 Okt 2026** — `Niumination/kelas` private |
| T-06 | Deploy Vercel + set env | Hermes | ✅ **SELESAI 9 Okt 2026** — `kelas-hazel.vercel.app` |
| T-07 | Pasang DNS `kelas` CNAME | Kamu | ✅ **SELESAI 10 Okt 2026** — `kelas.niumination.web.id` LIVE |
| T-08 | Verifikasi contoh kode materi dengan Ollama nyata | Hermes | ⏸ TERTUNDA — Ollama belum terpasang di laptop |
| T-09 | Uji transaksi Midtrans Rp 10.000 | Kamu | ⏸ TERTUNDA — butuh T-04 |
| T-10 | Uji gitleaks di repo lokal | Hermes | ✅ **SELESAI 9 Okt 2026** — 8 temuan semua `.next/`, nol secret |
| T-11 | Soft launch & sebar ke komunitas | Kamu | ⏸ TERTUNDA |
| T-12 | Kirim penawaran B2B ke instansi | Kamu | ⏸ TERTUNDA |
| T-13 | Terbitkan sertifikat pertama | Hermes | ✅ **SELESAI 11 Okt 2026** — `NIUM-2026-AI-AS34PT`, verify 200 |
| T-14 | Tinjau tampilan sertifikat dengan mata (PDF & kembaran HTML) | Kamu | ⏸ TERTUNDA — butuh mata manusia |
| T-15 | Persetujuan proyek akhir oleh instruktur | Kamu | ⏸ TERTUNDA — manual |
| T-16 | Uji pindai QR dari sertifikat yang sudah dicetak/dibuka di layar | Kamu | ⏸ TERTUNDA — butuh kamera |
| T-17 | SMTP produksi untuk magic link Supabase Auth | Kamu + Hermes | ⏸ TERTUNDA — butuh akun Resend |
| T-18 | Uji visual UI/UX responsif & keyboard pada browser nyata | Kamu + Hermes | ⏸ TERTUNDA — perlu persetujuan visual dan perangkat nyata |

---

## Detail

### T-01 · Buat project Supabase & isi kredensial
**Kenapa tertunda di sini:** butuh akun Supabase dan pembuatan project lewat dasbor web. Sandbox tidak boleh menyimpan kredensial produksi.
**Definisi siap:** `.env.local` berisi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`; mode demo hilang dari aplikasi.
**Langkah:** buat project di supabase.com — **terpisah dari project instansi mana pun** — lalu salin Project URL dan anon key. Lihat README §Setup Supabase.

### T-02 · Jalankan migrasi ke Supabase
**Kenapa tertunda:** butuh koneksi ke project nyata. (Sebagai kompensasi, migrasi sudah diuji secara lokal memakai PGlite — lihat `npm run db:uji`.)
**Langkah:** jalankan `0001_init.sql` → `0002_rls.sql` → `0003_seed.sql` → `0004_kuis.sql` → `0005_sertifikat.sql` → `0006_bank_soal.sql` di SQL Editor, berurutan. Verifikasi: 12 pelajaran, 23 soal, 15 fungsi RPC; `estimasi_jam=15`; jumlah `lessons.menit=915` (termasuk proyek akhir 600 menit). `0003_seed.sql` sudah diselaraskan ke metadata materi dan urutan Produksi.

### T-03 · Aktifkan OAuth GitHub & Google
**Kenapa tertunda:** butuh persetujuan akun OAuth dan pendaftaran aplikasi di GitHub/Google.
**Langkah:** buat OAuth App GitHub dan OAuth client Google. Pada keduanya, pakai callback Supabase yang persis ditampilkan di Authentication → Providers (umumnya `https://<project-ref>.supabase.co/auth/v1/callback`). Masukkan Client ID/Secret ke provider di Supabase. Di URL Configuration, set Site URL `https://kelas.niumination.web.id` dan Redirect URLs `https://kelas.niumination.web.id/auth/callback` serta `http://localhost:3000/auth/callback`. Untuk Google, selesaikan consent screen/publishing dan tambahkan akun penguji bila masih dalam mode Testing.

### T-17 · SMTP produksi untuk magic link Supabase Auth
**Kenapa tertunda:** aplikasi menggunakan `signInWithOtp()` dari Supabase Auth; SMTP bawaan Supabase dibatasi dan tidak ditujukan untuk mengirim magic link kepada publik. Env `RESEND_API_KEY` dihapus dari `.env.example` karena aplikasi tidak mengirim email langsung.
**Penanggung jawab:** Kamu membuat/menverifikasi akun Resend dan record DNS; Hermes memasukkan konfigurasi ke Supabase Auth bersama Kamu.
**Langkah persis:** (1) buat akun Resend; (2) tambahkan domain pengirim yang kamu miliki dan terbitkan record DNS SPF/DKIM (serta DMARC jika disarankan dashboard Resend) persis seperti yang diberikan Resend; tunggu status domain **Verified**; (3) buat API key pengiriman, jangan tempelkan ke chat/laporan/repo; (4) di Supabase → Authentication → Email → SMTP Settings, aktifkan custom SMTP, isi host `smtp.resend.com`, port `465` (TLS), username `resend`, password = API key Resend, sender name `Kelas Niumination`, sender email yang sudah diverifikasi; (5) uji form `/masuk` dengan email milikmu, klik tautan, pastikan mendarat di `/dashboard`.
**Penyimpanan rahasia:** API key hanya di konfigurasi SMTP Supabase. Jangan masukkan ke `.env.local` maupun Vercel. Jika sender email `kelas@niumination.web.id` belum disetujui oleh Resend, berhenti dan konfirmasi alamat pengirim sebelum menggantinya.
**Rujukan resmi:** https://supabase.com/docs/guides/auth/auth-smtp · https://resend.com/docs/send-with-supabase-smtp

### T-04 · Verifikasi akun bisnis Midtrans
**Kenapa tertunda:** butuh KTP dan data usaha perorangan; diproses manual 1–2 minggu.
**Catatan jadwal:** ini satu-satunya hal di luar kendali teknis yang bisa menggagalkan jadwal 12 minggu. **Ajukan di minggu ke-5**, jangan menunggu minggu ke-7. Kalau molor, buka sementara dengan transfer manual + konfirmasi admin.

### T-05 · Buat repo GitHub
**Kenapa tertunda:** pembuatan repo dilakukan di akunmu.
**Keputusan pemilik (9 Okt 2026):** repo **private dulu**. `content/` berisi materi MDX berbayar lengkap; repo publik membuat sumbernya bisa diunduh tanpa entitlement. Ini juga selaras dengan permintaanmu agar entitlement menjadi satu-satunya pintu akses.
**Langkah:** `gh repo create Niumination/kelas --private` atau pilih **Private** di web, lalu Hermes push dari repo lokal. Repo ini sudah disiapkan: README, LICENSE, CI, issue template, CONTRIBUTING.
**Catatan ke depan:** jika repo aplikasi kelak ingin dibuat publik (PRD menyebut portofolio/kolaborasi), pisahkan konten berbayar ke sumber private terlebih dahulu; jangan membuka seluruh repo secara langsung.

### T-06 · Deploy Vercel + set env
**Kenapa tertunda:** butuh akun Vercel dan akses ke repo GitHub.
**Langkah:** `vercel --prod`, lalu pasang 6 env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`.

### T-07 · Pasang DNS subdomain `kelas`
**Kenapa tertunda:** butuh akses ke pengelola DNS domain niumination.web.id.
**Langkah:** record `CNAME  kelas  cname.vercel-dns.com`.

### T-08 · Verifikasi contoh kode materi dengan Ollama nyata
**Kenapa tertunda:** sandbox tidak punya GPU/RAM untuk menjalankan model, dan tidak bisa menginstal Ollama secara tetap.
**Kenapa penting:** kalau ada contoh yang tidak jalan, kredibilitas seluruh kelas turun. Ini harus selesai **sebelum** soft launch minggu ke-4.

**Cakupannya sekarang lebih besar**, karena seluruh modul berbayar sudah lengkap dan hampir semuanya berisi kode yang bisa dijalankan. Daftar periksa untuk Hermes:

| Modul | Yang dijalankan | Yang paling sering gagal |
|---|---|---|
| G2 | `ollama pull`, `ollama run`, `ollama show` | nama model tidak ada lagi di registry |
| G3 | loop agent + dua tool | model bukan varian *instruct*, jadi tool tidak pernah dipanggil |
| G4 | `keyring` di sistemmu | backend keyring tidak tersedia di Linux tanpa GNOME Keyring |
| B1 | `uji_verifier.py`, `orkestrator.py` | keluaran model tidak sesuai skema `Rencana` |
| B2 | `jalankan_supervisor.py`, `selesaikan()` | `psycopg` belum terpasang, atau tugasnya tumpang tindih |
| B3 | `jalankan.py`, `evaluasi.py` | dimensi embedding tidak 768; indeks HNSW gagal tanpa ekstensi `vector` |
| B4 | `alat.muat(reg)`, `uji_pagar.py` | modul di `alat/` tidak terimpor, jadi tool tidak pernah terdaftar |
| B5 | `uji_pagar.py` (tiga percobaan) | `PermissionError` tidak muncul karena `maks_izin`-nya salah |
| B6 | `health.py`, `compose.yaml` | health check Ollama gagal karena `start_period` terlalu pendek |
| B7 | `eval_lari.py`, `gerbang.py` | hakim model tidak mengembalikan angka |

Jalankan berurutan dan catat keluarannya apa adanya. Yang perlu dilaporkan bukan "sudah dijalankan", melainkan **mana yang gagal dan di baris mana**. Perbaikan kodenya dikerjakan di sebelah sini, lalu Hermes menjalankan ulang.

### T-09 · Uji transaksi Midtrans Rp 10.000
**Kenapa tertunda:** butuh akun Midtrans (T-04) dan uang nyata.
**Langkah:** mode sandbox dulu, lalu satu transaksi produksi Rp 10.000 dari akunmu sendiri sebelum early bird dibuka.

### T-10 · Uji gitleaks di repo lokal
**Kenapa tertunda:** alat ini memindai riwayat Git; repo di sini belum punya riwayat commit.
**Langkah:** setelah repo GitHub jadi, Hermes jalankan `gitleaks detect` dan pasang pre-commit hook (sudah ada templatnya di `.pre-commit-config.yaml`).

### T-11 · Soft launch & sebar ke komunitas
**Kenapa tertunda:** butuh akun media sosial / grup komunitas milikmu.
**Target:** 100–300 pendaftar gratis di minggu ke-4.

### T-12 · Kirim penawaran B2B ke instansi
**Kenapa tertunda:** butuh keputusan dan relasi kelembagaan; ada pertimbangan konflik kepentingan dengan posisimu di Diskominfo.
**Catatan:** one-pager sudah siap di `docs/one-pager-instansi.md`. Pastikan penawaran diajukan secara resmi, bukan memanfaatkan posisi.

### T-13 · Terbitkan sertifikat pertama
**Kenapa tertunda:** butuh seluruh rantai berjalan (DB + kuis + akses kelas).
**Langkah:** setelah migrasi, Hermes jalankan `npm run uji:alur` terhadap project Supabase khusus kelas. Skrip menyiapkan pembelian uji melalui service role, lalu menguji RPC sebagai siswa, menerbitkan sertifikat, dan membuat `docs/uji-sertifikat.pdf`. Setelah domain/deploy aktif, buka `/verify/<nomor>` yang dicetak skrip dan pastikan nama/status benar. Ini tidak menguji Midtrans; transaksi dibuktikan terpisah lewat T-09. Setelah T-14/T-16, bersihkan pengguna uji memakai perintah yang dicetak skrip.

---

### T-14 · Tinjau tampilan sertifikat dengan mata
**Kenapa tertunda:** sertifikat sudah didesain ulang dan lulus 28 uji otomatis — termasuk dibaca balik oleh pdf.js (parse PDF sungguhan) dan QR-nya didekode balik oleh jsQR. Tetapi sandbox tidak punya perender visual, jadi **estetikanya belum pernah dinilai mata manusia**. Uji otomatis hanya membuktikan tidak ada yang rusak, bukan bahwa hasilnya indah.

**Yang sudah dijamin mesin:**
- struktur PDF sah, bisa dibuka pdf.js, satu halaman A4 landscape 842 × 595;
- QR identik bit-demi-bit dengan pustaka QR referensi (versi 1, 2, dan 4) dan terbaca jsQR;
- tidak ada dua elemen yang saling bertumpuk, dan semuanya di dalam bingkai;
- nama penerima adalah teks terbesar; hanya dua keluarga huruf yang dipakai;
- `Tc` (spasi huruf) selalu ditulis ulang di setiap objek teks — dulu tidak, dan akibatnya nama penerima ikut terenggang.

**Langkah:** buka `docs/contoh-sertifikat.html` (disusun dari spesifikasi yang sama dengan PDF-nya) atau unduh `docs/contoh-sertifikat.pdf`. Yang perlu dinilai: proporsi, jarak, apakah terasa "mahal", dan apakah namamu sebagai instruktur sudah pas. Laporkan — perbaikannya di sebelah sini, cukup ubah `lib/tata-letak-sertifikat.mjs` lalu `npm run contoh`.

---

### T-15 · Persetujuan proyek akhir oleh instruktur
**Kenapa tertunda:** butuh keputusan manusia — membaca repositori peserta dan menilainya dengan rubrik. Tidak ada bagian dari ini yang bisa diotomasi dari sini.
**Keadaan sekarang:** proyek akhir ditandai selesai oleh peserta sendiri, jadi secara teknis sertifikat bisa terbit tanpa peninjauan. Untuk angkatan pertama (volume kecil) ini masih bisa diterima, dan setiap sertifikat bisa dibatalkan lewat `batalkan_sertifikat()`.
**Kapan harus dibenahi:** sebelum harga naik ke tahap 3, atau sebelum jalur instansi dijual — saat itu keabsahan sertifikat mulai punya nilai kelembagaan.
**Bentuk perbaikannya nanti:** kolom `proyek_status` di `enrollments` (`menunggu|disetujui|ditolak`), dan `syarat_sertifikat()` menambah satu syarat lagi. Perubahan ini **harus ditulis di sebelah sini**, lalu dijalankan Hermes sebagai migrasi baru — bukan disunting langsung di dashboard.

---

## Bukan tertunda, tapi sengaja ditunda

| Item | Alasan | Kapan |
|---|---|---|
| Isi lengkap modul B3, B4, B6 | Menunggu B1–B2 selesai (urutan produksi materi) | Fase 2–3 |
| Video | Bukan garis benang (PRD §0.2 aturan 2) | Tidak dijadwalkan |
| Terjemahan bahasa Inggris | Cabang, bukan pengganti (aturan 6) | Setelah kelas Indonesia laku |
| Multi-instruktur | Ekspansi, bukan MVP (PRD §0.4) | Setelah 2 kelas terbit |

---

### T-16 · Uji pindai QR dari sertifikat yang sudah dicetak
**Kenapa tertunda:** butuh kamera ponsel dan kertas hasil cetak. Sandbox tidak punya keduanya.
**Keadaan sekarang:** QR disandikan sendiri (`lib/qr.mjs`, mode byte, versi 1–6, tingkat koreksi M) dan sudah terbukti identik dengan pustaka referensi serta terbaca jsQR saat diraster. Yang belum teruji adalah rantai paling ujung: **cetak → kamera → buka**.
**Langkah:** cetak `docs/contoh-sertifikat.pdf` (atau buka di layar), pindai QR-nya dengan kamera ponsel, pastikan membuka `kelas.niumination.web.id/verify/NIUM-2026-AIAGENT-K7Q3MT`.
**Kalau gagal terpindai:** ukuran QR saat ini 86 pt (≈ 30 mm) dengan modul ≈ 2,1 pt. Naikkan `sisi` di `lib/tata-letak-sertifikat.mjs` (misal ke 100) dan jalankan `npm run contoh`. Jangan turunkan di bawah 70 pt.

---

### T-18 · Uji visual UI/UX responsif & keyboard pada browser nyata
**Kenapa tertunda:** build dan pengujian statis bisa memastikan route/komponen berjalan, tetapi penilaian rasa visual, interaksi sentuh, dan navigasi keyboard tetap perlu mata serta browser/perangkat nyata. Tidak ada sesi GitHub push atau deploy yang dilakukan dari Arena.
**Penanggung jawab:** Kamu menilai arah visual dan menyetujui hasil; Hermes menjalankan pemeriksaan pada repo lokal/staging dan membenahi regresi yang ditemukan.
**Langkah persis:** (1) jalankan `npm run dev` dengan Node 22, atau buka preview dari cabang kerja sebelum merge; (2) periksa `/`, `/kelas`, `/kelas/ai-agent-self-host`, `/harga`, `/masuk`, `/dashboard`, satu pelajaran gratis, satu pelajaran premium saat belum login, `/kuis/ai-agent-self-host/fondasi`, dan `/verify`; (3) ulangi sekurangnya pada lebar 1440 px dan 390 px; (4) di desktop, navigasikan header, form email, radio kuis, dan semua CTA memakai Tab/Shift+Tab/Enter; di ponsel, buka/tutup menu serta accordion kurikulum; (5) pastikan halaman belajar premium tanpa entitlement hanya menampilkan ringkasan—bukan isi MDX; (6) laporkan overflow, fokus yang hilang, teks/kontras yang sulit dibaca, atau transisi yang membingungkan sebelum merge.
**Catatan integrasi:** login provider/magic link, checkout Midtrans, webhook settlement, dan penerbitan sertifikat live tetap mengikuti T-03, T-04, T-09, T-13, dan T-17; semuanya memerlukan kredensial/perangkat pemilik dan jangan diuji dengan rahasia produksi di sandbox.

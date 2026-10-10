# Kontribusi

Repositori ini berisi platform kelas **Niumination** dan seluruh materinya. Kontribusi paling berharga justru yang paling membosankan: memperbaiki contoh kode yang tidak jalan, dan menambah soal kuis.

---

## Yang paling dibutuhkan

1. **Contoh kode yang error atau usang** — ekosistem ini berubah cepat. Kalau sebuah perintah di materi tidak lagi jalan, itu bug.
2. **Soal kuis tambahan** — bank soal ada di `supabase/migrations/0006_bank_soal.sql`.
3. **Salah ketik dan kalimat yang membingungkan** — materi teknis yang sulit dipahami adalah masalah nyata.
4. **Terjemahan istilah** — kelas ini berbahasa Indonesia; kalau ada istilah yang terasa dipaksakan, usulkan padanannya.

---

## Cara menambah materi

Materi hidup di `content/<slug-kelas>/`. Menambah pelajaran tidak boleh butuh perubahan kode — ini aturan #3 di PRD §0.2.

```
content/ai-agent-self-host/01-fondasi/03-topik-baru.mdx
```

```markdown
---
judul: Judul pelajaran
ringkasan: "Satu kalimat. Wajib diapit tanda kutip kalau mengandung titik dua."
menit: 20
urutan: 3
tags: [konsep, contoh]
---
```

Komponen yang tersedia di dalam MDX: `<Callout tipe="info|tips|peringatan|bahaya">`, `<Terminal perintah="…">`, `<Tugas ke="1">`, `<Langkah ke="1" judul="…">`, `<Preview judul="…">`.

Dua jebakan yang sudah pernah terjadi:

- **Titik dua di frontmatter wajib diapit tanda kutip.** Kalau tidak, YAML-nya rusak dan seluruh halaman kelas gagal dimuat.
- **Kurung kurawal di luar code fence akan dianggap ekspresi JSX.** Tulis `baca_berkas(jalur="catatan.txt")`, bukan `baca_berkas({jalur: "catatan.txt"})`.

Setelah menambah pelajaran, sinkronkan juga ke `supabase/migrations/0003_seed.sql` supaya progres dan kuis bisa merujuk pelajaran itu.

---

## Aturan konten

Setiap usulan harus lolos enam aturan di `PRD-kelas-ai-agent.md` §0.2. Yang paling sering relevan:

- **Fondasi gratis, produksi berbayar.** Jangan usulkan memindahkan materi berbayar ke gratis.
- **Docs-driven.** Video boleh jadi pelengkap, bukan syarat.
- **Bahasa Indonesia** sebagai default.

---

## Menjalankan lokal

```bash
npm install
npm run verifikasi     # typecheck + uji unit + uji migrasi
npm run dev
```

Tanpa `.env.local`, aplikasi berjalan dalam **mode demo**: seluruh materi bisa dibaca, login dan pembayaran nonaktif. Untuk mengaktifkan fitur penuh, ikuti README §Setup Supabase.

---

## Keamanan

Jangan pernah mengirim kunci API, kata sandi, atau data instansi dalam issue, PR, atau commit. Kalau menemukan kebocoran akses — misalnya materi berbayar bisa dibaca tanpa bayar — buka issue dengan label keamanan; itu prioritas tertinggi, di atas fitur apa pun.

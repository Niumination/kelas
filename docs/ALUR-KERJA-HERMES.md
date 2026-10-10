# Alur Kerja Dua Arah — Arena ↔ Hermes

Dokumen ini mengatur pembagian kerja antara **Arena (sandbox ini)** dan **Hermes Agent** di laptop, untuk proyek Kelas Niumination.

---

## Pembagian peran

| | Arena (sini) | Hermes (laptop) |
|---|---|---|
| Menulis & mengubah kode | ✅ | ✅ |
| Menulis & menyusun materi | ✅ | ✅ |
| Menjalankan aplikasi (dev server) | ✅ | ✅ |
| Uji unit & uji migrasi (PGlite) | ✅ | ✅ |
| Eksperimen arsitektur | ✅ | ✅ |
| Audit kode & keamanan | ✅ | ✅ |
| Menjalankan Ollama / contoh materi nyata | ❌ | ✅ |
| Membuat & mengelola repo Git lokal | ❌ | ✅ |
| Push ke GitHub | ❌ | ✅ |
| Deploy (Vercel, Supabase, DNS) | ❌ | ✅ |
| Menyimpan kredensial | ❌ sengaja tidak | ✅ (`.env.local`, tidak pernah di-commit) |

**Yang harus dikerjakan di sini:** apa pun yang tidak butuh kredensial, mesin lokal, atau identitas.
**Yang harus dikerjakan Hermes:** apa pun yang butuh salah satu dari tiga itu — plus semua eksekusi yang menyentuh repo nyata.

---

## Format serah terima

Berkas di `docs/hermes/`:

### 0. `PROMPT.md` — teks siap-tempel untuk memulai Hermes
Memberi konteks, tujuan, keputusan repo private, aturan keselamatan, dan menunjuk Hermes ke dokumen operasional. Salin-tempel saat folder proyek sudah tersedia di laptopnya.

### 1. `TERAPKAN.md` — dari Arena ke Hermes
**Instruksi eksekusi yang lengkap**: peta ekosistem, urutan tujuh fase, perintah siap salin, hasil yang diharapkan, dan daftar larangan. Untuk penerapan pertama kali, ikuti dokumen ini dari atas ke bawah.

### 2. `TUGAS.md` — penanda status
Bukan acuan perintah. Ia hanya daftar centang per fase, supaya `TERAPKAN.md` tidak perlu disunting setiap kali ada kemajuan.

Dokumen eksekusi dan checklist mengacu ke `docs/CATATAN-TERTUNDA.md` untuk ID tugas dan penanggung jawabnya.

### 3. `LAPORAN.md` — dari Hermes ke Arena
Berisi: apa yang dijalankan, keluarannya, dan apa yang menyimpang. Dibawa kembali ke sini untuk dievaluasi. Kalau ada perintah yang gagal, **laporkan keluarannya apa adanya** — jangan diubah agar terlihat berhasil.

---

## Aturan yang tidak boleh dilanggar Hermes

1. **Jangan mengubah `docs/PRD-kelas-ai-agent.md` §0 (benang merah & 6 aturan)** tanpa persetujuan. Bagian itu adalah konstitusi proyek; sisanya bisa direvisi.
2. **Jangan menyunting migrasi yang sudah pernah dijalankan ke Supabase.** Migrasi bersifat kumulatif: perubahan baru = berkas `000X_nama.sql` baru.
3. **Jangan pernah menaruh nilai kredensial di dalam kode atau commit.** Hanya di `.env.local` dan di dashboard Vercel/Supabase.
4. **Jangan memindahkan materi berbayar ke gratis** demi trafik, dan sebaliknya jangan mengunci materi yang seharusnya gratis.
5. **Jangan menjalankan `git push --force`** ke `main`.
6. **Jangan menghapus berkas di `content/`** tanpa konfirmasi — itu materi, bukan cache.
7. Kalau sebuah perintah gagal dengan cara yang tidak dipahami, **berhenti dan laporkan**. Jangan menebak-nebak solusi yang menyentuh data produksi.

---

## Urutan eksekusi pertama kali

Rinciannya ada di `docs/hermes/TERAPKAN.md`. Ringkasnya:

```
Fase 0  Persiapan mesin          (Hermes)
Fase 1  Repo GitHub              (Kamu/Hermes)  → T-05
Fase 2  Database & Auth          (Hermes + Kamu)→ T-01, T-02, T-03, T-17
Fase 3  Verifikasi materi Ollama (Hermes)       → T-08  ← sebelum soft launch
Fase 4  Alur sertifikat          (Hermes)       → T-13  ← memakai npm run uji:alur
Fase 5  Deploy Vercel & DNS      (Hermes + Kamu)→ T-06, T-07
Fase 6  Pembayaran               (Kamu)         → T-04 (minggu ke-5), T-09
Fase 7  Serah terima             (Kamu)         → T-11, T-12, T-14, T-15, T-16
```

Satu catatan yang penting untuk Fase 4: **Hermes adalah agen CLI**, jadi ia tidak bisa login lewat browser OAuth dan tidak bisa mengklik dua belas pelajaran. Karena itu alur sertifikat diuji memakai `npm run uji:alur` (`scripts/uji-alur-sertifikat.mjs`), yang membuat pengguna uji, masuk sebagai pengguna itu, lalu menempuh seluruh rantai lewat RPC.

---

## Siklus rutin setelahnya

```
Arena:  eksperimen / draf fitur / audit  →  commit  →  push
                                                          ↓
Hermes: pull  →  npm run verifikasi  →  jalankan lokal  →  uji dengan Ollama nyata
                                                          ↓
Hermes: isi LAPORAN.md  →  commit  →  push
                                                          ↓
Arena:  baca laporan  →  perbaiki / lanjutkan  →  siklus berulang
```

Satu siklus idealnya tidak lebih dari satu fitur atau satu modul materi, supaya kalau ada yang salah, jelas sumbernya.

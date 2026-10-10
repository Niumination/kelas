# Tugas untuk Hermes

**Dari:** Arena · **Untuk:** Hermes Agent di laptop
**Acuan eksekusi:** [`TERAPKAN.md`](./TERAPKAN.md) — ikuti urutan di sana.
**Berkas ini** hanya penanda status, supaya dua dokumen tidak saling mendahului.

**Aturan:** kerjakan berurutan, centang yang selesai, laporkan di `LAPORAN.md`. Kalau gagal, hentikan dan laporkan keluarannya apa adanya.

---

## Status penerapan

Salin daftar ini ke `LAPORAN.md` dan centang yang sudah selesai.

### Fase 0 — Persiapan mesin
- [ ] Node ≥ 22.0.0, git, `gh`, `vercel`, `python3`, `ollama` terpasang

### Fase 1 — Repo  `→ T-05`
- [ ] `github.com/Niumination/kelas` dibuat private (jangan public-kan konten berbayar tanpa keputusan pemilik)
- [ ] Kode terunggah, CI hijau

### Fase 2 — Database & Auth  `→ T-01, T-02, T-03, T-17`
- [ ] Project Supabase dibuat (terpisah dari project instansi)
- [ ] `.env.local` terisi, lencana MODE DEMO hilang
- [ ] Migrasi 0001–0006 dijalankan berurutan
- [ ] 12 pelajaran · 23 soal · 5 kuis · 6 modul · 13 tabel · 15 fungsi
- [ ] `courses.estimasi_jam=15`; jumlah `lessons.menit=915`; urutan Produksi sama dengan materi
- [ ] OAuth GitHub & Google aktif  `← Kamu`
- [ ] Redirect `/auth/callback` terdaftar untuk domain & localhost
- [ ] SMTP Resend dikonfigurasi di Supabase Auth; magic link sampai ke inbox dan login berhasil  `← T-17`

### Fase 3 — Verifikasi materi  `→ T-08`
- [ ] `qwen2.5:7b-instruct` dan `nomic-embed-text` tertarik
- [ ] G1–G4 dijalankan
- [ ] B1–B7 dijalankan
- [ ] `eval rate`, porsi GPU/CPU, versi Ollama, dan tingkat kegagalan tool dilaporkan

### Fase 4 — Alur sertifikat  `→ T-13`
- [ ] `npm run uji:alur` lulus
- [ ] Nomor sertifikat pertama tercatat
- [ ] Penerbitan terbukti idempoten

### Fase 5 — Deploy  `→ T-06, T-07`
- [ ] Deploy Vercel sukses
- [ ] Env produksi terpasang
- [ ] CNAME `kelas` → Vercel  `← Kamu`
- [ ] HTTPS valid di `kelas.niumination.web.id`
- [ ] `/verify/<nomor-uji>` menampilkan data sertifikat uji dengan benar

### Fase 6 — Pembayaran  `→ T-04, T-09`
- [ ] Kunci sandbox terpasang
- [ ] Transaksi sandbox → `settlement`, enrollment bertambah
- [ ] Verifikasi akun bisnis diajukan  `← Kamu, minggu ke-5`
- [ ] Transaksi produksi Rp 10.000 berhasil

### Fase 7 — Serah terima  `← T-11, T-12, T-14, T-15, T-16`
- [ ] Bahan T-14 & T-16 disiapkan (PDF contoh + PDF uji)
- [ ] Soft launch  `← Kamu`
- [ ] Penawaran B2B  `← Kamu`

---

## Pemeriksaan singkat

```bash
npm run verifikasi     # typecheck + 39 uji + uji migrasi + bangkitkan contoh
npm run uji:alur       # alur sertifikat — butuh Supabase nyata
npm run contoh         # bangkitkan ulang docs/contoh-sertifikat.{pdf,html}
```

Kalau `npm run verifikasi` merah, **jangan lanjut fase**. Laporkan keluarannya.

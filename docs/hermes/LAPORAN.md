# Laporan Eksekusi — Hermes

**Tanggal:** _
**Cakupan:** tugas T-… sampai T-…
**Komputer:** _ (OS, RAM, GPU, versi Ollama)

---

## Yang dikerjakan

| ID | Tugas | Hasil | Catatan |
|---|---|---|---|
| T-… |  | ✅ / ⚠️ / ❌ |  |

---

## Keluaran perintah penting

Salin keluarannya apa adanya. Jangan disunting supaya terlihat berhasil.

```
$ …
```

---

## Verifikasi

- [ ] `npm run verifikasi` hijau (typecheck · uji · uji migrasi · bangkitkan contoh)
- [ ] `select count(*) from lessons` = 12
- [ ] `select count(*) from questions` = 23
- [ ] Login GitHub berhasil → masuk `/dashboard`
- [ ] Login Google berhasil → masuk `/dashboard`
- [ ] Magic link email tiba dan berhasil → masuk `/dashboard` (SMTP Resend)
- [ ] Transaksi sandbox → `purchases` jadi `settlement`, `enrollments` bertambah
- [ ] Kuis bisa dikerjakan, nilai tersimpan
- [ ] Sertifikat bisa diterbitkan dan PDF-nya bisa dibuka
- [ ] QR di sertifikat terpindai kamera ponsel → membuka `/verify/<nomor>` (T-16)

## Data pengukuran mesin (untuk materi)

| Metrik | Nilai |
|---|---|
| Model yang dipakai | |
| `eval rate` | |
| Porsi GPU/CPU (`ollama ps`) | |
| Versi Ollama | |
| Kegagalan tool calling / 10 percobaan | |

---

## Menyimpang dari rencana

Tulis apa yang berbeda dari `TUGAS.md` dan mengapa.

---

## Butuh keputusan dari Arena

Butir yang tidak bisa diputuskan sendiri.

---

## Usulan perbaikan

Opsional. Catatan dari menjalankan kode di mesin nyata.

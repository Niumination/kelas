## Apa yang diubah

<!-- Satu paragraf. Kalau tidak bisa dijelaskan dalam satu paragraf, pecah PR-nya. -->

## Mengapa

<!-- Masalah yang diselesaikan. Bukan "biar lebih bagus". -->

## Daftar periksa

- [ ] `npm run verifikasi` lulus (typecheck + uji + uji migrasi)
- [ ] Tidak ada kunci API, kata sandi, atau data instansi di dalam diff
- [ ] Kalau menyentuh `supabase/migrations/`, migrasi bisa dijalankan ulang tanpa merusak data
- [ ] Kalau menambah materi, metadata-nya juga ditambahkan ke `supabase/migrations/0003_seed.sql`

## Lolos benang merah?

Bagian ini wajib diisi untuk perubahan yang menambah fitur.

- [ ] Fondasi tetap gratis; tidak ada materi produksi yang dipindah ke gratis
- [ ] Konten tetap docs-driven (teks + kode), bukan bergantung video
- [ ] Menambah materi tidak butuh perubahan kode (aturan #3)
- [ ] Hak akses tetap lewat `enrollments` + `purchases`, bukan flag di halaman (aturan #4)
- [ ] Fitur ini berguna untuk pembeli individu dulu, baru lapisan instansi (aturan #5)
- [ ] Semua teks berbahasa Indonesia (aturan #6)

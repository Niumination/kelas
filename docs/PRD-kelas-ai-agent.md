# PRD — Platform Kelas Niumination
### "AI Agent Self-Host" — kelas gratis + berbayar, docs-driven, bayar via Midtrans

Versi: 1.0 · 9 Oktober 2026 · Pemilik: Afrizal Munthe (Niumination)
Alamat: `https://kelas.niumination.web.id` (subdomain, deploy Vercel, CNAME)
Target rilis bertahap: **12 minggu (3 bulan)**

---

## 0. Benang merah & prinsip ekstensibilitas

Bagian ini adalah **konstitusi proyek**. Setiap fitur baru harus lolos 6 aturan ini; kalau tidak, fitur itu ditunda, bukan ditolak.

### 0.1 Benang merah (single sentence)

> **Platform ini membantu orang Indonesia membangun sistem AI yang berjalan di mesin mereka sendiri — dimulai dari fondasi yang gratis, diakhiri dengan sistem yang siap produksi dan terbukti.**

Satu kalimat itu menentukan segalanya: apa yang gratis (fondasi), apa yang berbayar (produksi), siapa audiensnya (orang Indonesia), dan apa bedanya dengan kursus AI lain (self-host + bukti, bukan sekadar teori).

### 0.2 Enam aturan ekstensibilitas

| # | Aturan | Artinya saat menambah fitur |
|---|---|---|
| 1 | **Fondasi gratis, produksi berbayar** | Kelas baru boleh ditambah bebas, tapi garisnya selalu sama: yang gratis berujung pada "sesuatu yang jalan di mesin saya", yang berbayar berujung pada "sistem yang siap produksi". Jangan pernah memindahkan materi *produksi* ke gratis hanya demi trafik. |
| 2 | **Docs-driven, tanpa video sebagai syarat** | Konten utama adalah teks + kode + repo. Video, kalau pernah ada, adalah pelengkap — bukan pengganti. Semua materi harus bisa dibaca, di-*copy*, dan dijalankan tanpa pemutar video. |
| 3 | **Konten adalah data, bukan halaman hardcode** | Kurikulum dibaca dari struktur direktori + frontmatter, bukan ditulis di dalam komponen. Menambah kelas = menambah folder. Menambah modul = menambah file `.mdx`. Tidak ada perubahan kode untuk menambah materi. |
| 4 | **Satu pintu akses** | Hak akses selalu ditentukan oleh `enrollments` + `purchases`, tidak pernah oleh *flag* di halaman. Fitur baru (kohort, bundel, lisensi tim/instansi) hanya menambah *jenis* enrollment — tidak menambah mekanisme akses baru. |
| 5 | **Publik dulu, instansi belakangan** | Setiap fitur harus berguna untuk pembeli individu dulu. Fitur khusus instansi (laporan kehadiran, sertifikat bermaterai, SSO) hanya boleh menjadi *lapisan* di atas fitur yang sudah ada. |
| 6 | **Bahasa Indonesia sebagai default** | Materi, UI, dan email berbahasa Indonesia. Terjemahan atau kelas berbahasa lain adalah cabang, bukan pengganti. |

### 0.3 Yang *bukan* garis benang (boleh berubah kapan saja)

Harga, jumlah modul, topik pasti tiap modul, gateway pembayaran, dan teknologi UI. Semua ini adalah keputusan taktis — diubah lewat revisi PRD tanpa mengubah identitas produk.

### 0.4 Peta ekspansi yang sudah diantisipasi (tanpa mengubah skema)

| Arah ekspansi | Cara menampungnya | Perubahan yang dibutuhkan |
|---|---|---|
| Kelas baru (Next.js, SPBE, Git) | Folder baru di `content/<slug>/` + baris di tabel `courses` | Nol perubahan kode |
| Bundel / paket beberapa kelas | Tabel `bundles` + `bundle_courses` | Hanya tabel baru; entitlement tetap lewat `enrollments` |
| Kohort live / angkatan | `courses.kohort = true` + kolom jadwal di `enrollments` | Kolom baru; aturan akses tetap sama |
| Lisensi tim / instansi (B2B) | Tabel `organizations` + `enrollments.organization_id` | 2 tabel baru; RLS ditambah, tidak ditulis ulang |
| Multi-instruktur | `courses.instructor_id` + `profiles.role` | Kolom + kebijakan RLS |
| Kuis & sertifikat | Sudah disiapkan di skema `0001` | Tinggal diaktifkan di Fase 3 |
| Video (kalau nanti perlu) | Kolom `lessons.video_url` + komponen MDX `<Video>` | 1 kolom + 1 komponen |

---

## 1. Keputusan final (hasil interview, 3 ronde)

| # | Aspek | Keputusan |
|---|---|---|
| 1 | Posisi | **Hibrida** — rilis publik dulu, versi instansi (B2B) menyusul |
| 2 | Niche | **Campuran**, mulai dari yang paling dikuasai |
| 3 | Pendekatan teknis | **Hibrida** — web & konten di Next.js milik sendiri, checkout Midtrans |
| 4 | Monetisasi | **Freemium** — gratis sebagai corong, berbayar sebagai produk utama |
| 5 | Kelas pertama | **AI Agent self-host** — Ollama, Hermes Agent, multi-agent, BYOK |
| 6 | Payment gateway | **Midtrans** — QRIS 0,7%, VA ~Rp 4.000, GoPay ~2%, kartu 2,9% + Rp 2.000 |
| 7 | Format konten | **Tanpa video** — teks + kode + repo + screenshot (docs-driven) |
| 8 | Target rilis | **3 bulan** — multi-kelas, kuis, sertifikat |
| 9 | Alamat | `kelas.niumination.web.id` |
| 10 | Garis gratis/berbayar | **Fondasi gratis** (sampai agent pertama jalan) → berbayar = orkestrasi & produksi |
| 11 | Harga | **Bertahap** — early bird Rp 99.000 → naik bertahap |
| 12 | Login | **Semua opsi** — GitHub + Google + email magic link |
| 13 | Bahasa | **Bahasa Indonesia** |
| 14 | Kuis & sertifikat | **Kuis per modul + sertifikat PDF** bernomor unik, bisa diverifikasi publik |

**Mengapa kombinasi ini kuat:** hampir tidak ada kelas AI Agent *self-host* berbahasa Indonesia, sementara audiensmu sudah punya bukti kerja nyata (Hermes Agent, SAPA AI, KMS SPBE, Ollama/Qdrant di stack). Format docs-driven cocok dengan brand "dibangun di depan umum" — repositori kelasnya sendiri bisa jadi portofolio dan materi sekaligus.

---

## 2. Produk: kurikulum "AI Agent Self-Host"

### 2.1 GRATIS — Fondasi (2 modul · 4 pelajaran, target 4–6 jam)

| Modul | Judul | Hasil yang bisa dicek siswa |
|---|---|---|
| G1 | Kenapa self-host: privasi, biaya, dan kapan tidak perlu | Siswa bisa menjelaskan kapan self-host lebih masuk akal dari API cloud |
| G2 | Ollama 101: instal, pilih model, kuantisasi, CPU vs GPU | `ollama run` jalan lokal, latensi & VRAM terukur |
| G3 | Agent pertama: tool calling & function schema | Agent bisa memanggil 1 tool nyata (baca file / cek cuaca) |
| G4 | BYOK & keamanan: API key, OS keychain, tanpa telemetri | Key tersimpan di keychain, bukan di `.env` yang ikut ter-commit |

Syarat lulus ke berbayar: siswa merasakan **"wah, ini jalan di mesin saya"**. Itu yang menciptakan keinginan untuk tahap berikutnya.

### 2.2 BERBAYAR — Orkestrasi, konteks, produksi, dan proyek akhir (4 modul · 8 pelajaran)

| Modul | Judul | Catatan |
|---|---|---|
| B1 | Anatomi agent: observer → planner → executor → verifier | Diambil langsung dari arsitektur Hermes Agent |
| B2 | Multi-agent orchestration & pembagian tugas | Termasuk pola supervisor/worker, handoff, konteks bersama |
| B3 | Memory & retrieval: pgvector/Qdrant, chunking, rerank | Studi kasus: KMS SPBE |
| B4 | Tool ecosystem & protokol MCP | Agent bisa pakai tool pihak ketiga dengan aman |
| B5 | Guardrails: permission, rate limit, audit log, human-in-the-loop | Modul terpenting untuk audiens instansi |
| B6 | Observability & evaluasi: trace, eval set, regresi | Cara membuktikan agentmu tidak memburuk setelah diubah |
| B7 | Deploy produksi: Docker, systemd, backup, monitoring, biaya | Termasuk hitung-hitungan biaya server nyata |
| P | **Proyek akhir** — kirim repo, dapat review | Menjadi syarat sertifikat |

### 2.3 Harga bertahap

| Tahap | Harga | Syarat naik |
|---|---|---|
| Early bird | **Rp 99.000** | 50 pembeli pertama atau 2 minggu sejak launch |
| Tahap 2 | **Rp 199.000** | Modul B1–B4 lengkap |
| Tahap 3 | **Rp 299.000** | Semua modul lengkap + bank soal kuis |
| Tahap 4 | **Rp 499.000** | Ditambah sesi live/review berkala |
| Jalur instansi (B2B) | Penawaran terpisah per paket | Dikeluarkan di minggu 11–12 |

**Ekonomi:** 100 pembeli × Rp 99.000 = Rp 9,9 juta; potongan QRIS 0,7% → bersih ≈ Rp 9,83 juta. Biaya operasional platform ≈ Rp 0 (free tier) sampai Rp 750.000/bulan (Vercel Pro + Supabase Pro).

---

## 3. Arsitektur teknis

```
kelas.niumination.web.id (Vercel)
├── Next.js 16 (App Router, TypeScript, Tailwind v4, shadcn/ui)
├── Konten: MDX di repo privat (entitlement menjaga akses; kontribusi/PR siswa ditunda sampai konten berbayar terpisah) + metadata kurikulum di Postgres
├── Supabase
│   ├── Postgres  → siswa, enrollment, pembelian, progres, kuis, sertifikat
│   ├── Auth      → GitHub + Google + email magic link
│   └── Storage   → aset/lampiran (opsional; PDF sertifikat saat ini dibuat saat diminta)
├── Midtrans Snap → QRIS, VA (BCA/Mandiri/BNI/BRI/Permata), GoPay, kartu
│   └── webhook → /api/webhooks/midtrans → verifikasi signature → update entitlement
├── Sertifikat: renderer PDF custom tanpa dependensi, nomor unik, halaman verifikasi publik
└── Email: Supabase Auth + SMTP kustom untuk magic link; email transaksi masih rencana
```

**Mengapa bukan LMS jadi (Moodle/Frappe):** formatmu docs-driven tanpa video, jadi 80% fitur LMS (SCORM, video progress, gradebook akademik) tidak terpakai. Yang kamu butuhkan hanya: kurikulum, progres, entitlement, kuis, sertifikat — itu ~5 tabel, lebih murah dirawat sendiri dan sesuai stackmu.

### 3.1 Skema database (ringkas)

```sql
profiles(id, auth_uid, nama, email, role, dibuat_pada)
courses(id, slug, judul, deskripsi, harga, tier: 'gratis'|'berbayar', status, urutan)
modules(id, course_id, judul, urutan, ringkasan)
lessons(id, module_id, slug, judul, mdx_path, durasi_baca, gratis: bool, urutan)
enrollments(id, user_id, course_id, sumber: 'gratis'|'pembelian', dibuat_pada)
purchases(id, user_id, course_id, order_id unik, jumlah, status, metode, dibayar_pada)
lesson_progress(id, user_id, lesson_id, selesai: bool, selesai_pada)
quizzes(id, module_id, judul, nilai_lulus)
questions(id, quiz_id, tipe, pertanyaan, opsi jsonb, kunci jsonb)
quiz_attempts(id, user_id, quiz_id, jawaban jsonb, nilai, lulus, dicoba_pada)
certificates(id, user_id, course_id, nomor unik, pdf_url, terbit_pada)
events(id, user_id, nama, properti jsonb, dibuat_pada)   -- funnel analytics
```

**Aturan akses (RLS Supabase):**
- `lessons.gratis = true` → bisa dibaca siapa pun yang sudah login.
- `lessons.gratis = false` → hanya jika ada `enrollments` aktif **atau** `purchases.status = 'settlement'`.
- `certificates` → pemilik bisa baca miliknya; halaman `/verify/[nomor]` membaca lewat RPC publik yang hanya mengembalikan nama, judul kelas, tanggal, status (bukan email).

### 3.2 Alur pembayaran Midtrans (wajib benar)

1. Siswa klik "Beli" → server buat `order_id` unik (`NIM-<course>-<userid>-<timestamp>`), simpan `purchases.status = 'pending'`.
2. Server panggil Snap API → dapat `snap_token` → frontend tampilkan popup Snap (QRIS/VA/GoPay/kartu).
3. Midtrans kirim POST ke `/api/webhooks/midtrans`.
4. Handler wajib: **verifikasi signature** `SHA512(order_id + status_code + gross_amount + server_key)`, cek idempotensi (jangan proses dua kali), baru update status `settlement` → buat `enrollments`.
5. Balas `200` cepat; semua kerja berat (email, sertifikat) dikerjakan setelahnya/anjungan.
6. Tombol "sudah bayar, refresh akses" di halaman sukses sebagai jaring pengaman kalau webhook telat.

Catatan produksi: Midtrans butuh **akun bisnis terverifikasi**. Siapkan dari minggu 5 (prosesnya bisa makan 1–2 minggu) — jangan menunggu minggu 7.

### 3.3 Sertifikat

- Nomor: `NIUM-2026-AIAGENT-<6 karakter acak>` (hindari karakter mirip: 0/O, 1/I/l).
- PDF dibuat server-side **saat diminta** (tanpa dependensi, tanpa font tersemat) dan dikirim langsung ke pemiliknya; tidak ada bucket, tidak ada signed URL, jadi tidak ada sertifikat kadaluarsa.
- Desain: minimalis — nama penerima elemen terbesar dengan wajah serif, sisanya sans; satu warna aksen; garis tipis bukan ornamen; **QR** menunjuk ke `/verify/<nomor>`. Tata letak ditulis sekali (`lib/tata-letak-sertifikat.mjs`) lalu dirender ke PDF dan ke kembaran HTML untuk tinjauan visual.
- `/verify/NIUM-2026-AIAGENT-XXXXXX` menampilkan: nama, kelas, tanggal terbit, status aktif. Ini yang membuat sertifikat punya nilai untuk jalur instansi.

---

## 4. Roadmap 12 minggu

### Fase 1 — Minggu 1–4: Fondasi + kelas gratis live
| Minggu | Fokus | Keluaran |
|---|---|---|
| 1 | Scaffold repo `niumination/kelas`, design system gelap senada situs utama, Auth 3 opsi, DNS CNAME `kelas` → Vercel | Web bisa diakses di subdomain, login jalan |
| 2 | Skema DB + RLS, renderer MDX, tulis **Modul G1–G4** | Kurikulum gratis terbaca & tercatat progresnya |
| 3 | Landing, halaman kelas, gate akun untuk kelas gratis, analytics funnel | Pendaftaran gratis bisa diukur |
| 4 | **Soft launch kelas gratis** — bagikan ke komunitas, Grup Telegram/WA Aceh, LinkedIn, GitHub README | Target: 100–300 pendaftar pertama |

### Fase 2 — Minggu 5–8: Monetisasi
| Minggu | Fokus | Keluaran |
|---|---|---|
| 5 | Integrasi Midtrans **sandbox**, webhook + signature + idempotensi, halaman pricing, **mulai verifikasi akun bisnis** | Transaksi uji jalan end-to-end |
| 6 | Tulis **Modul B1–B4**, halaman checkout, email konfirmasi | Produk berbayar punya isi nyata sebelum dijual |
| 7 | Uji transaksi nyata (Rp 10.000 sendiri), buka **early bird Rp 99.000 / 50 kuota** | Pembayar pertama yang sah |
| 8 | Perbaikan berdasarkan keluhan nyata + tulis **Modul B5–B6** | Retensi & materi keamanan (nilai jual instansi) |

### Fase 3 — Minggu 9–12: Kuis, sertifikat, jalur B2B
| Minggu | Fokus | Keluaran |
|---|---|---|
| 9 | Engine kuis: bank soal, penilaian **server-side** (jangan pernah nilai di client), batas percobaan | Kuis per modul aktif |
| 10 | Sertifikat PDF + halaman verifikasi publik + email otomatis | Lulusan punya bukti yang bisa dibagikan |
| 11 | **Modul B7 + proyek akhir**, one-pager penawaran versi instansi | Penawaran B2B siap kirim |
| 12 | Kirim penawaran ke Diskominfo/pemda, naikkan harga ke tahap 2, rilis resmi | Siklus penuh: gratis → bayar → instansi |

---

## 5. Checklist pra-rilis

- [ ] Repo baru `Niumination/kelas` (README menjelaskan bahwa ini kelas open source)
- [ ] DNS: record CNAME `kelas` → `cname.vercel-dns.com`
- [ ] Project Supabase baru (terpisah dari proyek pemda — jangan campur data instansi dengan data siswa)
- [ ] Akun Midtrans bisnis (siapkan KTP + data usaha perorangan dari minggu 5)
- [ ] Kebijakan refund & syarat layanan (penting untuk mengurangi dispute)
- [ ] Halaman `/verify` untuk sertifikat
- [ ] Konfirmasi: materi tidak memuat data/internal instansi mana pun

---

## 6. Metrik keberhasilan

| Metrik | Target bulan 3 |
|---|---|
| Pendaftar kelas gratis | 500 |
| Penyelesaian modul gratis (completion) | ≥ 30% |
| Konversi gratis → berbayar | 3–5% (target realistis industri) |
| Pembeli early bird | 50 |
| Sertifikat terbit | 20 |
| Penawaran B2B terkirim | 3 instansi (Diskominfo, Bappeda, OPD terkait) |

---

## 7. Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| Verifikasi Midtrans molor | Ajukan di minggu 5; kalau telat, buka dengan **transfer manual + konfirmasi admin** untuk 20–50 transaksi pertama |
| Kelas gratis terlalu lengkap → tak ada yang beli | Garisnya di G4: fondasi gratis, orkestrasi & produksi berbayar. Jangan pindahkan B1 ke gratis |
| Menulis 11 modul sendirian dalam 3 bulan berat | Prioritaskan G1–G4 + B1–B4 dulu; B5–B7 bisa menyusul setelah ada pembayar |
| Materi AI cepat usang | Format MDX + tanggal "terakhir diperbarui" per modul; perbarui per rilis Ollama besar |
| Konflik kepentingan dengan pekerjaan di Diskominfo | Pisahkan: kelas publik pakai contoh generik; studi kasus instansi hanya yang sudah open source |

---

## 8. Status pengerjaan

PRD ini disetujui 9 Okt 2026. Pengerjaan mengikuti roadmap 12 minggu di §4.

| Item | Status | Keterangan |
|---|---|---|
| Scaffold Next.js 16 + Tailwind v4 | ✅ Selesai | Landing, katalog, detail kelas, pembaca materi, login, dashboard, kuis, harga, `/verify`, kebijakan |
| Skema database + RLS | ✅ Selesai | 13 tabel, 15 fungsi `SECURITY DEFINER`, kebijakan per tabel — **teruji di PGlite** |
| Modul G1–G4 (gratis) | ✅ Selesai | G1 & G2 draf lengkap; G3 & G4 draf padat dengan kode yang bisa dijalankan |
| Modul B1–B8 (berbayar) | ✅ Selesai | 8 pelajaran lengkap: anatomi agent, multi-agent, memory & retrieval, tool ecosystem, guardrails, deploy, evaluasi, proyek akhir |
| Modul berbayar B1–B7 + P | 🟡 Pratinjau | Ke-8 pelajaran berbayar sudah punya struktur, garis besar, dan satu bagian yang bisa dibaca gratis. Isi lengkap menyusul di Fase 2–3. |
| Integrasi Midtrans | 🟡 Kode siap | Menunggu kredensial: `/api/checkout`, webhook + verifikasi signature, Snap popup |
| Kuis | ✅ Selesai | 23 soal, penilaian sisi server, kunci jawaban tak pernah ke browser, kuis berbayar terjaga |
| Sertifikat | ✅ Selesai | Nomor unik, syarat ketat di DB, PDF + QR tanpa dependensi, halaman `/verify` publik |
| Desain sertifikat | ✅ Didesain ulang | Minimalis, dua keluarga huruf (nama penerima terbesar), satu warna aksen, QR verifikasi — satu spesifikasi untuk PDF & HTML |
| One-pager B2B | ✅ Selesai | `docs/one-pager-instansi.md` — 3 paket, indikasi harga, hasil yang dibawa pulang |
| Alur kerja Hermes | ✅ Selesai | `docs/ALUR-KERJA-HERMES.md` + `docs/hermes/TUGAS.md` + `LAPORAN.md` |

**Tiga hal yang ditemukan saat pengerjaan, bukan saat perencanaan:**

1. **`punya_akses_kelas` pernah salah dipakai** untuk membuka materi berbayar — akibatnya seluruh modul berbayar terbuka untuk siapa pun. Ketahuan oleh `npm run db:uji`. Sekarang dipisah: `punya_akses_kelas` (boleh dilihat di katalog) vs `punya_akses_materi` (boleh dibaca isinya).
2. **Kunci jawaban kuis terekspos** oleh kebijakan RLS `using (true)` pada tabel `questions`. Diperbaiki dengan mencabut akses baca dan menggantinya dengan view `questions_publik`.
3. **Dua bug SQL** yang hanya muncul saat dijalankan: variabel record di dalam daftar `INTO` ganda, dan dolar-quote bersarang di bank soal. Keduanya ketahuan karena migrasi benar-benar dijalankan, bukan sekadar dibaca.

Repositori: `kelas/` di workspace ini. Dokumen ini hidup — setiap keputusan baru dicatat di sini, dan setiap usulan fitur harus lolos 6 aturan di §0.2 sebelum dikerjakan.

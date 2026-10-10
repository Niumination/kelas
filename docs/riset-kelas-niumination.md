# Riset: Platform Kelas Edukasi (Gratis + Berbayar) — Niumination

Tanggal: 9 Okt 2026
Pemilik: Afrizal Munthe (Niumination) — Pranata Komputer, Diskominfo Aceh Tengah
Aset existing: niumination.web.id (Next.js, dashboard OSS, halaman /services berharga), github.com/niumination (91 repo publik)

## 1. Aset & posisi saat ini (dari situs + GitHub)

- Stack dominan: TypeScript, Next.js (14/16), React 19, Tailwind, Prisma, Supabase, Tauri 2 + Rust, Python, Kotlin.
- Terbiasa deploy: Vercel, GitHub Pages.
- Sudah monetisasi lewat jasa: Konsultasi Rp 750.000/60 menit, Audit & Optimasi Rp 2.500.000/proyek, Aplikasi Web Custom mulai Rp 7.500.000.
- Sudah punya audiens "civic tech / govtech" dari PemdiAcehTengah, KMS SPBE, SAPA AI, Niu-LKH.
- Brand voice: dark, teknis, "dibangun di depan umum", anti basa-basi.

Implikasi: kelas online adalah produk ke-4 yang paling natural setelah jasa — audiens sudah ada, tinggal kemas.

## 2. Lanskap platform kelas 2026

| Platform | Harga masuk | Fee transaksi | Catatan |
|---|---|---|---|
| Teachable | Starter $29–39/bln | 7,5% (Starter), 0% (Builder $69) | Free plan dihapus 2025; auto-remittance PPN/VAT 45+ negara |
| Podia | Mover $42–49/bln | 5% (Mover), 0% (Shaker) | Free plan dihapus Okt 2024 |
| Thinkific | Basic $40/bln (annual) | — | Free plan dihapus 2025 |
| Skool | Hobby $9/bln | 10% (Hobby), 2,9% (Pro $99) | Komunitas dulu, kursus belakangan |
| Systeme.io / GroupApp / FreshLearn | $0 | 0% | Free tier nyata, fitur terbatas |
| Gumroad | $0 | 10% flat | Paling cepat untuk jualan produk digital |

Sumber: [Ruzuku](https://www.ruzuku.com/learn/articles/best-free-course-platforms), [Teachable](https://www.teachable.com/blog/how-to-choose-an-online-course-platform), [GroupApp](https://www.group.app/blog/best-online-course-platforms/)

## 3. Stack yang dipakai developer tech saat ini

Pola dominan (AlgoMaster, ekosistem SaaS 2026):
- Next.js (App Router) + TypeScript — UI sekaligus API routes
- Supabase — Postgres + Auth + Storage (RLS untuk entitlement)
- CMS headless / Payload — konten course: course → chapter → lesson → quiz
- Stripe — subscription + webhook → update entitlement
- Vercel — hosting
- Resend + React Email — email transaksional

Sumber: [AlgoMaster tech stack](https://blog.algomaster.io/p/algomaster-tech-stack), [Best SaaS stack 2026](https://startupa.ge/blog/best-tech-stack-saas-2026)

## 4. Opsi LMS open-source (kalau tidak mau bangun dari nol)

| Tool | Lisensi | Stack | Catatan buat kamu |
|---|---|---|---|
| Frappe LMS | MIT | Python/JS | Paling modern + ringan, mudah di-tema ulang |
| Moodle | GPL v3 | PHP | Paling lengkap (kuis, sertifikat, SCORM), UI jadul |
| Chamilo | GPL v3 | PHP | Paling ringan, bisa shared hosting |
| Open edX | AGPL v3 | Python/Django | Butuh DevOps, 20+ container — overkill |
| Canvas LMS | AGPL v3 | Ruby | Berat, butuh keahlian Rails |

Estimasi biaya self-host: Moodle $200–1.200/thn hosting; Chamilo/Frappe $100–600/thn.
Sumber: [Host-Stage](https://www.host-stage.net/case-study/top-self-hosted-lms/), [LMSpedia](https://lmspedia.org/best-free-open-source-lms-platforms/)

## 5. Payment gateway Indonesia (verifikasi Juli 2026)

| Metode | Midtrans | Xendit |
|---|---|---|
| QRIS | 0,7% (MDR diatur BI) | 0,7% |
| E-wallet (GoPay/OVO/Dana/ShopeePay) | ~1,5–2% | ~1,5–5,5% per wallet |
| Kartu kredit | 2,9% + Rp 2.000 | 2,9% + Rp 2.000 |
| Virtual Account | ~Rp 4.000 | Rp 4.000 (aggregator) / Rp 2.000 + biaya bank (switcher) |
| Recurring/subscription | Ada, tanpa biaya tambahan | Ada, +Rp 2.500/plan/bulan |

QRIS MDR 0,7% sama di semua gate (diatur Bank Indonesia); merchant mikro bisa 0,3%.
Sumber: [Software-Listing](https://software-listing.com/q/indonesia-payment-gateway-qris), [PanduanUsaha](https://panduanusaha.id/artikel/payment-gateway-indonesia-midtrans-xendit), [BuildWithAngga](https://buildwithangga.com/tips/pilih-midtrans-vs-xendit-untuk-pemula-freelance-web-developer)

## 6. Keputusan ronde 1 (hasil interview, 9 Okt 2026)

| Aspek | Keputusan | Implikasi teknis |
|---|---|---|
| Posisi | **Hibrida** — publik dulu, versi instansi (B2B) menyusul | Arsitektur harus punya konsep *tenant/organisasi* sejak awal, meski belum dipakai |
| Niche | **Campuran**, mulai dari yang paling dikuasai | Urutan topik ditentukan di ronde 2 |
| Pendekatan | **Hibrida** — konten & web di Next.js milik sendiri, checkout via pihak ketiga dulu | Tidak perlu bangun sistem pembayaran/entitlement di fase 1; yang dibangun dulu: konten, akses, email list |
| Monetisasi | **Freemium** — kelas gratis sebagai corong, berbayar sebagai produk utama | Butuh: gate email/akun untuk kelas gratis, upgrade path ke berbayar |

## 7. Keputusan ronde 2 (9 Okt 2026)

| Aspek | Keputusan | Implikasi teknis |
|---|---|---|
| Kelas pertama | **AI Agent self-host** — Hermes Agent, Ollama, BYOK, multi-agent | Konten sangat teknis; butuh contoh repositori yang bisa di-clone |
| Payment gateway | **Midtrans** — QRIS 0,7%, VA ~Rp 4.000, GoPay ~2%, kartu 2,9%+Rp 2.000 | Fase 1 bisa pakai mode sandbox; butuh verifikasi akun bisnis sebelum produksi |
| Format konten | **Tanpa video dulu** — teks + kode + repo + screenshot (docs-driven) | CMS/MDX di repo atau database; tidak butuh video hosting sama sekali di bulan 1–2 |
| Target rilis | **3 bulan** — multi-kelas, kuis, sertifikat | Scope penuh: butuh roadmap 12 minggu & manajemen scope ketat |
| Alamat | **kelas.niumination.web.id** (subdomain) | Repo terpisah, deploy Vercel, set CNAME ke `kelas` |

Catatan: tanpa video + target 3 bulan = waktu luangmu justru habis untuk *sistem* (auth, entitlement, kuis, sertifikat), bukan produksi materi. Ini bagus kalau sistemnya mau dipakai jangka panjang untuk kelas-kelas berikutnya.

## 8. Keputusan ronde 3 (9 Okt 2026)

| Aspek | Keputusan |
|---|---|
| Garis gratis/berbayar | Fondasi gratis (sampai agent pertama jalan) → berbayar = orkestrasi & produksi |
| Harga | Bertahap: early bird Rp 99.000 → naik bertahap |
| Login | Semua opsi: GitHub + Google + email magic link |
| Bahasa | Bahasa Indonesia |
| Kuis & sertifikat | Kuis per modul + sertifikat PDF bernomor unik, bisa diverifikasi publik |

➡️ Semua keputusan dikembangkan menjadi PRD lengkap + arsitektur + roadmap 12 minggu di **`PRD-kelas-ai-agent.md`**.

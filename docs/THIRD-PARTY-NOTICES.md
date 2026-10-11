# Pemberitahuan konten pihak ketiga

Dokumen ini mencakup salinan panduan pengembangan opsional di `.agents/skills/`. Berkas-berkas tersebut bukan dependensi runtime aplikasi. Versi sumber dan hash bundle tercatat di `skills-lock.json`.

## Skill dan bukti lisensi

| Skill lokal | Sumber | Status lisensi yang ditemukan |
|---|---|---|
| `accessibility`, `seo` | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | Metadata skill menyatakan MIT; teks lisensi sumber dicantumkan di bawah. |
| `composition-patterns`, `react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Frontmatter menyatakan MIT dan README sumber menyebut MIT, tetapi berkas `LICENSE` tidak tersedia saat audit. Pemberitahuan hak cipta persis perlu dikonfirmasi sebelum distribusi publik. |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Apache-2.0; salinan lengkap `LICENSE.txt` disertakan di `.agents/skills/frontend-design/LICENSE.txt`. |
| `next-best-practices`, `next-cache-components`, `next-upgrade` | [vercel-labs/next-skills](https://github.com/vercel-labs/next-skills) | Tidak ada deklarasi lisensi atau `LICENSE` di sumber yang terpasang. Repositori menyatakan skill telah dipindahkan ke repo Next.js; status lisensi salinan lama belum dipastikan. Jangan distribusikan publik sebelum dikonfirmasi. |
| `nodejs-backend-patterns`, `typescript-advanced-types` | [wshobson/agents](https://github.com/wshobson/agents) | MIT; teks dan atribusi sumber dicantumkan di bawah. |
| `nodejs-best-practices` | [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/nodejs-best-practices) | Repo sumber menyatakan dokumentasi asli CC BY 4.0 kecuali ada pemberitahuan upstream yang lebih spesifik. Skill ini menandai `source: community`, tetapi penulis/sumber komunitas awalnya belum teridentifikasi; atribusi perlu dikonfirmasi sebelum distribusi publik. |
| `supabase-postgres-best-practices` | [supabase/agent-skills](https://github.com/supabase/agent-skills) | MIT; teks dan atribusi sumber dicantumkan di bawah. |
| `tailwind-css-patterns` | [giuseppe-trisciuoglio/developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit) | MIT; teks dan atribusi sumber dicantumkan di bawah. |

AutoSkills CLI sendiri menyatakan lisensi CC BY-NC 4.0. Kode CLI tidak disalin ke repo ini; yang tersimpan adalah skill terpilih dan manifest hash. Lisensi CLI tidak menggantikan lisensi masing-masing sumber skill.

## Pemberitahuan MIT

Pemberitahuan berikut berlaku untuk skill MIT yang sumber dan teks lisensinya dapat diverifikasi di atas:

- `accessibility` dan `seo`: Copyright (c) 2026 Addy Osmani.
- `nodejs-backend-patterns` dan `typescript-advanced-types`: Copyright (c) 2024 Seth Hobson.
- `supabase-postgres-best-practices`: Copyright (c) 2026 Supabase.
- `tailwind-css-patterns`: Copyright (c) 2025 Giuseppe Trisciuoglio.

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Pemberitahuan CC BY 4.0

Untuk dokumentasi `nodejs-best-practices`, repo agregator menyatakan bahwa konten tertulis aslinya dilisensikan dengan [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/) kecuali ada pemberitahuan upstream yang lebih spesifik. Atribusi sementara: `sickn33/antigravity-awesome-skills`, berkas `skills/nodejs-best-practices/SKILL.md`. Sumber komunitas awal belum diverifikasi; status distribusi publik tetap tertunda sampai atribusi tersebut diperjelas.

## Catatan override dependensi

`package.json` mematok `argparse` ke `2.0.1` khusus di bawah `gray-matter → js-yaml 3` untuk memutus rantai `argparse 1 → sprintf-js` yang ditandai advisory moderat. Aplikasi memakai API parser `js-yaml` melalui `gray-matter`, bukan CLI `js-yaml` yang menggunakan `argparse`. Setelah override ini, `npm audit` melaporkan **0 kerentanan**. Ulangi audit saat memperbarui `gray-matter`/`js-yaml` dan hapus override jika tidak lagi diperlukan.

## Batas distribusi

- Skill mengikuti lisensi masing-masing dan bukan otomatis dilisensikan oleh `LICENSE` MIT aplikasi ini.
- Sebelum repo atau salinan skill dipublikasikan, selesaikan status lisensi tiga skill Next.js, konfirmasi pemberitahuan lisensi dua skill Vercel, dan verifikasi atribusi `nodejs-best-practices`.
- Jika konfirmasi tidak dapat diperoleh, hapus skill yang bermasalah dari distribusi publik atau ganti dengan skill/dokumentasi resmi yang lisensinya jelas. Jangan mengubah isi skill vendored tanpa memperbarui `skills-lock.json` dan pemberitahuan lisensinya.

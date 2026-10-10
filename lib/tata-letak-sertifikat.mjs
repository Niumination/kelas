/**
 * Spesifikasi tata letak sertifikat — satu sumber kebenaran.
 *
 * Berkas ini tidak tahu apa-apa soal PDF atau HTML. Ia hanya menyusun daftar
 * elemen (teks, garis, kotak, QR) dalam koordinat kanvas A4 landscape
 * 842 × 595 pt dengan titik nol di kiri-bawah — sama seperti ruang koordinat PDF.
 *
 * Dua perender memakainya:
 *   - lib/sertifikat-pdf.mjs  → berkas PDF yang bisa diunduh
 *   - scripts/buat-contoh.mjs → tiruan HTML untuk ditinjau mata
 *
 * Dengan satu spesifikasi, keduanya tidak mungkin bergeser sendiri-sendiri.
 */

export const LEBAR = 842
export const TINGGI = 595

/** Palet cetak. Satu warna aksen, sisanya netral — sesuai temuan riset desain. */
export const WARNA = {
  teks: '#15181d', // teks utama, hampir hitam
  sekunder: '#6b7280', // kalimat penjelas
  redup: '#9aa1ab', // label kecil & footer
  aksen: '#16a34a', // hijau Niumination, cukup gelap untuk kertas putih
  garis: '#dfe3e8', // garis tipis
  garisHalus: '#eef0f3', // garis paling tipis (bingkai dalam)
  isian: '#c9ced6', // garis di atas blok tanda tangan
}

/** Nama penerima boleh panjang; kecilkan fontnya kalau perlu, jangan meluber. */
function sesuaikan(teks, ukuranMaks, lebarMaks) {
  const lebar = String(teks).length * ukuranMaks * 0.5
  return lebar <= lebarMaks ? ukuranMaks : Math.max(8, (lebarMaks / (String(teks).length * 0.5)))
}

/**
 * Nama untuk blok tanda tangan. Kolom `instruktur` di kelas.json boleh berupa
 * satu kalimat bio ("Nama — jabatan"), sedangkan sertifikat hanya butuh namanya.
 *
 * @param {string|null|undefined} instruktur
 * @param {string|null|undefined} [singkat] nama pendek dari kelas.json (lebih diutamakan)
 */
export function namaTandaTangan(instruktur, singkat) {
  const pendek = (singkat ?? String(instruktur ?? '').split('—')[0]).trim()
  return pendek || 'Niumination'
}

/**
 * Terakhir-takhirnya: kalau nama sudah diperkecil tapi masih meluber,
 * potong dengan elipsis daripada menabrak elemen lain.
 */
function potong(teks, ukuran, lebarMaks) {
  const lebar = teks.length * ukuran * 0.5
  if (lebar <= lebarMaks) return teks
  const muat = Math.max(4, Math.floor(lebarMaks / (ukuran * 0.5)) - 1)
  return teks.slice(0, muat).trimEnd() + '…'
}

function urlVerifikasi(nomor) {
  return `https://kelas.niumination.web.id/verify/${nomor}`
}

/**
 * Susun seluruh elemen sertifikat.
 *
 * @param {Object} d
 * @param {string} d.nomor        nomor sertifikat, mis. NIUM-2026-AIAGENT-K7Q3MT
 * @param {string} d.nama         nama penerima
 * @param {string} d.judulKelas   judul kelas
 * @param {string} d.tanggal      tanggal terbit, sudah terformat (id-ID)
 * @param {string} d.instruktur   nama instruktur
 * @param {number|null} [d.estimasiJam]
 * @param {string} [d.meta]       baris keterangan tambahan (opsional)
 * @returns {{lebar:number, tinggi:number, elemen:Array<Object>}}
 */
export function susunTataLetak(d) {
  const tengah = LEBAR / 2
  const KIRI = 64
  const KANAN = LEBAR - 64 // 778

  const meta =
    d.meta ??
    [
      d.estimasiJam ? `estimasi ${d.estimasiJam} jam pembelajaran` : null,
      'docs-driven, tanpa video',
      'berbahasa Indonesia',
    ]
      .filter(Boolean)
      .join(' · ')

  const ukuranNama = sesuaikan(d.nama, 34, 640)
  const ukuranKelas = sesuaikan(d.judulKelas, 16.5, 600)
  const ukuranInstruktur = sesuaikan(d.instruktur, 15, 190)
  const namaInstruktur = potong(d.instruktur, Math.max(ukuranInstruktur, 10), 226)

  return {
    lebar: LEBAR,
    tinggi: TINGGI,
    elemen: [
      // ── Bingkai ganda: dua garis tipis, bukan ornamen ──────────────────
      { jenis: 'kotak', x: 24, y: 24, lebar: LEBAR - 48, tinggi: TINGGI - 48, tebal: 0.75, warna: WARNA.garis },
      { jenis: 'kotak', x: 31, y: 31, lebar: LEBAR - 62, tinggi: TINGGI - 62, tebal: 0.5, warna: WARNA.garisHalus },

      // ── Penanda merek, kiri atas ───────────────────────────────────────
      { jenis: 'blok', x: KIRI, y: 512, lebar: 3.2, tinggi: 32, warna: WARNA.aksen },
      {
        jenis: 'teks',
        isi: 'NIUMINATION',
        rata: 'kiri',
        x: KIRI + 14,
        y: 534,
        ukuran: 11.5,
        wajah: 'sans-tebal',
        spasi: 3.2,
        warna: WARNA.teks,
      },
      {
        jenis: 'teks',
        isi: 'kelas.niumination.web.id',
        rata: 'kiri',
        x: KIRI + 14,
        y: 519,
        ukuran: 8,
        wajah: 'sans',
        spasi: 0.6,
        warna: WARNA.redup,
      },

      // ── Nomor sertifikat, kanan atas ───────────────────────────────────
      {
        jenis: 'teks',
        isi: 'NOMOR SERTIFIKAT',
        rata: 'kanan',
        x: KANAN,
        y: 534,
        ukuran: 7,
        wajah: 'sans',
        spasi: 1.4,
        warna: WARNA.redup,
      },
      {
        jenis: 'teks',
        isi: d.nomor,
        rata: 'kanan',
        x: KANAN,
        y: 519,
        ukuran: 10.5,
        wajah: 'sans-tebal',
        spasi: 0.3,
        warna: WARNA.teks,
      },

      // ── Blok utama, sedikit di atas titik tengah optis ─────────────────
      {
        jenis: 'teks',
        isi: 'SERTIFIKAT PENYELESAIAN',
        rata: 'tengah',
        x: tengah,
        y: 468,
        ukuran: 26,
        wajah: 'sans-tebal',
        spasi: 1.6,
        warna: WARNA.teks,
      },
      { jenis: 'garis', x: tengah - 32, y: 449, panjang: 64, tebal: 2.6, warna: WARNA.aksen },
      {
        jenis: 'teks',
        isi: 'DIBERIKAN KEPADA',
        rata: 'tengah',
        x: tengah,
        y: 414,
        ukuran: 8.5,
        wajah: 'sans',
        spasi: 2.6,
        warna: WARNA.redup,
      },
      {
        jenis: 'teks',
        isi: d.nama,
        rata: 'tengah',
        x: tengah,
        y: 366,
        ukuran: ukuranNama,
        wajah: 'serif-tebal',
        warna: WARNA.teks,
      },
      { jenis: 'garis', x: tengah - 150, y: 344, panjang: 300, tebal: 0.6, warna: WARNA.garis },
      {
        jenis: 'teks',
        isi: 'atas penyelesaian seluruh modul, kuis, dan proyek akhir pada kelas',
        rata: 'tengah',
        x: tengah,
        y: 312,
        ukuran: 10.5,
        wajah: 'sans',
        warna: WARNA.sekunder,
      },
      {
        jenis: 'teks',
        isi: d.judulKelas,
        rata: 'tengah',
        x: tengah,
        y: 280,
        ukuran: ukuranKelas,
        wajah: 'sans-tebal',
        warna: WARNA.teks,
      },
      {
        jenis: 'teks',
        isi: meta,
        rata: 'tengah',
        x: tengah,
        y: 257,
        ukuran: 8.5,
        wajah: 'sans',
        spasi: 0.4,
        warna: WARNA.redup,
      },

      // ── Blok tanda tangan ──────────────────────────────────────────────
      { jenis: 'garis', x: KIRI, y: 150, panjang: 190, tebal: 0.6, warna: WARNA.isian },
      {
        jenis: 'teks',
        isi: namaInstruktur,
        rata: 'kiri',
        x: KIRI,
        y: 128,
        ukuran: ukuranInstruktur,
        wajah: 'serif-miring',
        warna: WARNA.teks,
      },
      {
        jenis: 'teks',
        isi: 'INSTRUKTUR',
        rata: 'kiri',
        x: KIRI,
        y: 112,
        ukuran: 7.5,
        wajah: 'sans',
        spasi: 1.6,
        warna: WARNA.redup,
      },
      { jenis: 'garis', x: 300, y: 150, panjang: 190, tebal: 0.6, warna: WARNA.isian },
      {
        jenis: 'teks',
        isi: d.tanggal,
        rata: 'kiri',
        x: 300,
        y: 128,
        ukuran: 12,
        wajah: 'sans',
        warna: WARNA.teks,
      },
      {
        jenis: 'teks',
        isi: 'TANGGAL TERBIT',
        rata: 'kiri',
        x: 300,
        y: 112,
        ukuran: 7.5,
        wajah: 'sans',
        spasi: 1.6,
        warna: WARNA.redup,
      },

      // ── Blok verifikasi ────────────────────────────────────────────────
      { jenis: 'qr', x: 692, y: 94, sisi: 86, url: urlVerifikasi(d.nomor) },
      {
        jenis: 'teks',
        isi: 'PINDAI UNTUK VERIFIKASI',
        rata: 'tengah',
        x: 735,
        y: 80,
        ukuran: 7.5,
        wajah: 'sans',
        spasi: 0.8,
        warna: WARNA.redup,
      },
      {
        jenis: 'teks',
        isi: `Keaslian sertifikat ini dapat diperiksa di kelas.niumination.web.id/verify/${d.nomor}`,
        rata: 'tengah',
        x: tengah,
        y: 50,
        ukuran: 7.5,
        wajah: 'sans',
        spasi: 0.3,
        warna: WARNA.redup,
      },
    ],
  }
}

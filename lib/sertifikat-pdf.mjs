/**
 * Perender PDF sertifikat — tanpa dependensi, tanpa font tersemat.
 *
 * Sengaja ditulis sendiri: tidak ada @react-pdf/renderer atau puppeteer,
 * jadi rute unduh tetap ringan. Memakai empat font inti PDF
 * (Helvetica untuk teks, Times untuk nama penerima) dengan WinAnsiEncoding.
 *
 * Tata letaknya tidak ditulis di sini — ia datang dari
 * lib/tata-letak-sertifikat.mjs, supaya identik dengan tiruan HTML-nya.
 *
 * Berkas ini .mjs agar bisa diuji langsung dengan `node --test`.
 */

import { susunTataLetak, LEBAR, TINGGI } from './tata-letak-sertifikat.mjs'
import { buatQr } from './qr.mjs'

export { LEBAR, TINGGI }

/** Pemetaan wajah huruf ke objek font inti. */
const FONT = {
  sans: '/F1',
  'sans-tebal': '/F2',
  'serif-tebal': '/F3',
  'serif-miring': '/F4',
}

const DESKRIPSI_FONT = {
  '/F1': 'Helvetica',
  '/F2': 'Helvetica-Bold',
  '/F3': 'Times-Bold',
  '/F4': 'Times-Italic',
}

/** Helvetica/Times: lebar rata-rata per karakter ≈ 0,5 × ukuran font. */
function lebarTeks(teks, ukuran, spasi = 0) {
  const n = String(teks).length
  return n * ukuran * 0.5 + spasi * Math.max(0, n - 1)
}

const TRANSLITERASI = {
  '—': '-', '–': '-', '’': "'", '‘': "'", '“': '"', '”': '"',
  '·': '.', '…': '...', '→': '->', '←': '<-', '✓': 'v', '•': '-',
  'é': 'e', 'è': 'e', 'ê': 'e', 'á': 'a', 'à': 'a', 'ö': 'o', 'ü': 'u', 'ñ': 'n',
}

/**
 * Font inti PDF hanya memahami Latin-1. Semua karakter lain
 * dilucuti aksennya (NFD) lalu ditransliterasi — dan kurung siku
 * PDF (yang mengakhiri string) di-escape.
 */
function aman(teks) {
  return String(teks)
    // NFD memisahkan tanda baca (î → i + ˆ), lalu tanda diakritik dibuang.
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, (c) => TRANSLITERASI[c] ?? '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

/** '#16a34a' → '0.09 0.64 0.29' (nilai RGB 0–1 untuk operator PDF). */
function keRgb(heks) {
  const h = heks.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return [r, g, b].map((v) => Math.round(v * 1000) / 1000).join(' ')
}

/** Angka dibulatkan ke 2 desimal supaya aliran konten tidak menggemuk. */
const n = (v) => Number(v.toFixed(2))

/**
 * Ubah modul QR menjadi sedikit persegi panjang: setiap hamparan gelap
 * dalam satu baris digabung jadi satu `re f`, jadi alirannya tetap kecil.
 */
function gambarQr(modul, ukuran, x, y, sisi) {
  const m = sisi / (ukuran + 8) // 4 modul zona tenang di setiap sisi
  const x0 = x + 4 * m
  const y0 = y + 4 * m
  let out = '0 0 0 rg\n'
  for (let baris = 0; baris < ukuran; baris++) {
    let kolom = 0
    while (kolom < ukuran) {
      if (modul[baris * ukuran + kolom] !== 1) {
        kolom++
        continue
      }
      const awal = kolom
      while (kolom < ukuran && modul[baris * ukuran + kolom] === 1) kolom++
      // baris 0 QR ada di atas, sedangkan y PDF naik ke atas
      const yr = y0 + (ukuran - 1 - baris) * m
      out += `${n(x0 + awal * m)} ${n(yr)} ${n((kolom - awal) * m)} ${n(m)} re f\n`
    }
  }
  return out
}

/**
 * @param {Object} d data sertifikat (lihat susunTataLetak)
 * @returns {Uint8Array} berkas PDF
 */
export function buatPdfSertifikat(d) {
  const { elemen } = susunTataLetak(d)
  let aliran = ''

  for (const e of elemen) {
    if (e.jenis === 'kotak') {
      aliran +=
        `${keRgb(e.warna)} RG\n${n(e.tebal)} w\n` +
        `${n(e.x)} ${n(e.y)} ${n(e.lebar)} ${n(e.tinggi)} re S\n`
      continue
    }
    if (e.jenis === 'blok') {
      aliran += `${keRgb(e.warna)} rg\n${n(e.x)} ${n(e.y)} ${n(e.lebar)} ${n(e.tinggi)} re f\n`
      continue
    }
    if (e.jenis === 'garis') {
      aliran +=
        `${keRgb(e.warna)} RG\n${n(e.tebal)} w\n` +
        `${n(e.x)} ${n(e.y)} m ${n(e.x + e.panjang)} ${n(e.y)} l S\n`
      continue
    }
    if (e.jenis === 'qr') {
      const qr = buatQr(e.url)
      aliran += gambarQr(qr.modul, qr.ukuran, e.x, e.y, e.sisi)
      continue
    }
    if (e.jenis === 'teks') {
      const isi = aman(e.isi)
      const spasi = e.spasi ?? 0
      const lebar = lebarTeks(isi, e.ukuran, spasi)
      const x =
        e.rata === 'tengah'
          ? e.x - lebar / 2
          : e.rata === 'kanan'
            ? e.x - lebar
            : e.x
      aliran +=
        // Catatan penting: Tc (spasi antar huruf) adalah bagian dari *text state*
        // dan TIDAK direset oleh BT — ia bertahan ke objek teks berikutnya.
        // Jadi Tc harus selalu ditulis ulang, termasuk dengan nilai 0,
        // kalau tidak teks tanpa spasi mewarisi spasi elemen sebelumnya.
        `BT\n${FONT[e.wajah]} ${n(e.ukuran)} Tf\n` +
        `${n(spasi)} Tc\n` +
        `${keRgb(e.warna)} rg\n` +
        `${n(x)} ${n(e.y)} Td\n(${isi}) Tj\nET\n`
      continue
    }
  }

  const daftarFont = Object.keys(DESKRIPSI_FONT)
    .map((k) => `${k} ${4 + Number(k.slice(2))} 0 R`)
    .join(' ')

  const objek = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${LEBAR} ${TINGGI}] ` +
      `/Resources << /Font << ${daftarFont} >> >> /Contents 4 0 R >>`,
    `<< /Length ${aliran.length} >>\nstream\n${aliran}endstream`,
    ...Object.values(DESKRIPSI_FONT).map(
      (f) => `<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`,
    ),
  ]

  let pdf = '%PDF-1.4\n'
  const offset = []
  for (let i = 0; i < objek.length; i++) {
    offset.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${objek[i]}\nendobj\n`
  }

  const xref = pdf.length
  pdf += `xref\n0 ${objek.length + 1}\n0000000000 65535 f \n`
  for (const o of offset) pdf += `${String(o).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objek.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`

  const bytes = new Uint8Array(pdf.length)
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff
  return bytes
}

/**
 * Bangkitkan contoh sertifikat: PDF (keluaran asli) + tiruan HTML (untuk
 * ditinjau mata). Keduanya disusun dari spesifikasi yang sama
 * (lib/tata-letak-sertifikat.mjs), jadi tidak mungkin bergeser sendiri-sendiri.
 *
 *   node scripts/buat-contoh.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { buatPdfSertifikat } from '../lib/sertifikat-pdf.mjs'
import { susunTataLetak, LEBAR, TINGGI } from '../lib/tata-letak-sertifikat.mjs'
import { buatQr } from '../lib/qr.mjs'
import { namaTandaTangan } from '../lib/tata-letak-sertifikat.mjs'

const DOK = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs')
const KELAS = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'ai-agent-self-host', 'kelas.json'), 'utf8'),
)

// Contoh memakai data kelas yang sesungguhnya, supaya yang ditinjau bukan data karangan.
const CONTOH = {
  nomor: 'NIUM-2026-AIAGENT-K7Q3MT',
  nama: 'Siti Rahmah Wijaya',
  judulKelas: KELAS.judul,
  tanggal: '9 Oktober 2026',
  instruktur: namaTandaTangan(KELAS.instruktur, KELAS.instrukturSingkat),
  estimasiJam: KELAS.estimasiJam,
}

// ── 1. PDF ────────────────────────────────────────────────────────────────
const pdf = buatPdfSertifikat(CONTOH)
writeFileSync(join(DOK, 'contoh-sertifikat.pdf'), pdf)

// ── 2. Tiruan HTML ────────────────────────────────────────────────────────
const lepas = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** y diukur dari bawah (ruang PDF) → top diukur dari atas (ruang CSS). */
const keAtas = (y) => TINGGI - y

function renderHtml(d) {
  const { elemen } = susunTataLetak(d)
  const bagian = []

  for (const e of elemen) {
    if (e.jenis === 'kotak') {
      bagian.push(
        `<div style="position:absolute;left:${e.x}px;top:${keAtas(e.y + e.tinggi)}px;` +
          `width:${e.lebar}px;height:${e.tinggi}px;box-sizing:border-box;` +
          `border:${e.tebal}px solid ${e.warna}"></div>`,
      )
      continue
    }
    if (e.jenis === 'blok') {
      bagian.push(
        `<div style="position:absolute;left:${e.x}px;top:${keAtas(e.y + e.tinggi)}px;` +
          `width:${e.lebar}px;height:${e.tinggi}px;background:${e.warna}"></div>`,
      )
      continue
    }
    if (e.jenis === 'garis') {
      bagian.push(
        `<div style="position:absolute;left:${e.x}px;top:${keAtas(e.y) - e.tebal / 2}px;` +
          `width:${e.panjang}px;height:${e.tebal}px;background:${e.warna}"></div>`,
      )
      continue
    }
    if (e.jenis === 'qr') {
      const qr = buatQr(e.url)
      const m = e.sisi / (qr.ukuran + 8)
      const pad = 4 * m
      const kotak = []
      for (let baris = 0; baris < qr.ukuran; baris++) {
        let kolom = 0
        while (kolom < qr.ukuran) {
          if (qr.modul[baris * qr.ukuran + kolom] !== 1) {
            kolom++
            continue
          }
          const awal = kolom
          while (kolom < qr.ukuran && qr.modul[baris * qr.ukuran + kolom] === 1) kolom++
          kotak.push(
            `<rect x="${pad + awal * m}" y="${pad + baris * m}" ` +
              `width="${(kolom - awal) * m}" height="${m}"/>`,
          )
        }
      }
      bagian.push(
        `<svg width="${e.sisi}" height="${e.sisi}" viewBox="0 0 ${e.sisi} ${e.sisi}" ` +
          `style="position:absolute;left:${e.x}px;top:${keAtas(e.y + e.sisi)}px;display:block">` +
          `<rect width="${e.sisi}" height="${e.sisi}" fill="#fff"/>` +
          `<g fill="#000">${kotak.join('')}</g></svg>`,
      )
      continue
    }
    if (e.jenis === 'teks') {
      const serif = e.wajah.startsWith('serif')
      // Petik tunggal: atribut style memakai petik ganda, jadi nama font
      // tidak boleh memakai petik ganda juga (atributnya akan putus).
      const keluarga = serif
        ? `Georgia, 'Times New Roman', serif`
        : `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
      const bobot = e.wajah.endsWith('-tebal') ? 700 : 400
      const miring = e.wajah === 'serif-miring' ? 'italic' : 'normal'
      const spasi = `${e.spasi ?? 0}pt`
      const posisi =
        e.rata === 'tengah'
          ? 'left:0;right:0;text-align:center'
          : e.rata === 'kanan'
            ? `right:${LEBAR - e.x}px;text-align:right`
            : `left:${e.x}px;text-align:left`
      bagian.push(
        `<div style="position:absolute;${posisi};top:${keAtas(e.y)}px;` +
          `transform:translateY(-50%);font-family:${keluarga};font-size:${e.ukuran}pt;` +
          `font-weight:${bobot};font-style:${miring};letter-spacing:${spasi};` +
          `color:${e.warna};white-space:nowrap;line-height:1.1">${lepas(e.isi)}</div>`,
      )
    }
  }

  const rapi = (s) => s.replace(/</g, '&lt;')
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Contoh Sertifikat — Kelas Niumination</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 32px 16px 48px;
    background: #0b0d11; color: #e7eaee;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    display: flex; flex-direction: column; align-items: center; gap: 18px;
  }
  .catatan { max-width: 842px; color: #98a1ac; font-size: 13px; line-height: 1.65; text-align: center; }
  .catatan code { font-family: ui-monospace, monospace; color: #e7eaee; }
  .kertas {
    position: relative; width: ${LEBAR}px; height: ${TINGGI}px;
    background: #fff; overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,.55);
    flex: none;
  }
  @media (max-width: 900px) {
    .kertas { transform: scale(.8); transform-origin: top center; margin-bottom: -119px; }
  }
</style>
</head>
<body>
  <div class="catatan">
    <strong>Tiruan HTML</strong> dari <code>docs/contoh-sertifikat.pdf</code> — disusun dari
    spesifikasi yang sama (<code>lib/tata-letak-sertifikat.mjs</code>). PDF memakai font inti
    Helvetica &amp; Times; HTML memakai font sistem, jadi ada beda beberapa piksel pada
    lebar huruf. Yang sah adalah PDF-nya.
  </div>

  <div class="kertas">
${bagian.map((b) => '    ' + b).join('\n')}
  </div>

  <div class="catatan">
    Nomor contoh: <code>${lepas(d.nomor)}</code> · penerima <code>${lepas(d.nama)}</code> ·
    QR menunjuk ke <code>${rapi('https://kelas.niumination.web.id/verify/' + d.nomor)}</code>.
    Bangkitkan ulang dengan <code>npm run contoh</code>.
  </div>
</body>
</html>
`
}

writeFileSync(join(DOK, 'contoh-sertifikat.html'), renderHtml(CONTOH), 'utf8')

console.log(`✅ contoh-sertifikat.pdf  : ${pdf.length} bita`)
console.log('✅ contoh-sertifikat.html : diperbarui')
console.log(`   nomor ${CONTOH.nomor} · ${CONTOH.nama}`)

import test from 'node:test'
import assert from 'node:assert/strict'
import jsQR from 'jsqr'
import { buatQr, versiUntuk } from '../lib/qr.mjs'

/** Rasterisasi matriks QR menjadi data RGBA, supaya bisa didekode jsQR. */
function raster(qr, skala = 8, tenang = 4) {
  const sisi = (qr.ukuran + tenang * 2) * skala
  const data = new Uint8ClampedArray(sisi * sisi * 4).fill(255)
  for (let y = 0; y < qr.ukuran; y++) {
    for (let x = 0; x < qr.ukuran; x++) {
      if (qr.modul[y * qr.ukuran + x] !== 1) continue
      for (let dy = 0; dy < skala; dy++) {
        for (let dx = 0; dx < skala; dx++) {
          const px = (x + tenang) * skala + dx
          const py = (y + tenang) * skala + dy
          const i = (py * sisi + px) * 4
          data[i] = data[i + 1] = data[i + 2] = 0
        }
      }
    }
  }
  return { data, lebar: sisi, tinggi: sisi }
}

const CONTOH = [
  'https://kelas.niumination.web.id/v/NIUM-2026-AIAGENT-K7Q3MT',
  'https://kelas.niumination.web.id/v/NIUM-2026-KELAS-9W2X4Y',
  'https://niumination.web.id',
  'A',
]

for (const teks of CONTOH) {
  test(`QR dapat didekode: ${teks.slice(0, 42)}${teks.length > 42 ? '…' : ''}`, () => {
    const qr = buatQr(teks)
    const { data, lebar, tinggi } = raster(qr)
    const hasil = jsQR(data, lebar, tinggi)
    assert.ok(hasil, 'jsQR berhasil menemukan kode')
    assert.equal(hasil.data, teks, 'isi yang didekode sama dengan aslinya')
  })
}

test('versi naik mengikuti panjang teks', () => {
  assert.equal(versiUntuk('A'), 1)
  assert.equal(versiUntuk('https://kelas.niumination.web.id/v/NIUM-2026-AIAGENT-K7Q3MT'), 4)
})

test('ukuran matriks mengikuti rumus 17 + 4 × versi', () => {
  for (const teks of CONTOH) {
    const qr = buatQr(teks)
    assert.equal(qr.modul.length, qr.ukuran * qr.ukuran)
    assert.equal((qr.ukuran - 17) % 4, 0)
  }
})

test('pola pencari ada di tiga sudut', () => {
  const qr = buatQr(CONTOH[0])
  const pada = (x, y) => qr.modul[y * qr.ukuran + x] === 1
  const cek = (ox, oy) => {
    for (let i = 0; i < 7; i++) {
      assert.ok(pada(ox + i, oy), `baris atas pencari (${ox},${oy})`)
      assert.ok(pada(ox, oy + i), `kolom kiri pencari (${ox},${oy})`)
    }
    assert.ok(pada(ox + 3, oy + 3), 'pusat pencari gelap')
    assert.ok(!pada(ox + 1, oy + 1), 'bagian dalam pencari terang')
  }
  cek(0, 0)
  cek(qr.ukuran - 7, 0)
  cek(0, qr.ukuran - 7)
})

test('modul gelap wajib ada di (8, ukuran-8)', () => {
  const qr = buatQr(CONTOH[0])
  assert.equal(qr.modul[(qr.ukuran - 8) * qr.ukuran + 8], 1)
})

test('teks terlalu panjang ditolak dengan pesan yang jelas', () => {
  assert.throws(() => buatQr('x'.repeat(400)), /Terlalu panjang/)
})

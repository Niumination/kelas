/**
 * Uji spesifikasi tata letak sertifikat — sebelum sampai ke PDF.
 * Yang dijaga di sini: hierarki tipografi, batas kanvas, dan elemen verifikasi.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { susunTataLetak, namaTandaTangan, LEBAR, TINGGI } from '../lib/tata-letak-sertifikat.mjs'

const DASAR = {
  nomor: 'NIUM-2026-AIAGENT-K7Q3MT',
  nama: 'Siti Rahmah',
  judulKelas: 'AI Agent Self-Host',
  tanggal: '9 Oktober 2026',
  instruktur: 'Niumination',
  estimasiJam: 16,
}

const teks = (t) => t.elemen.filter((e) => e.jenis === 'teks')
const cari = (t, isi) => teks(t).find((e) => e.isi === isi)

test('nama penerima adalah teks terbesar di halaman', () => {
  const t = susunTataLetak(DASAR)
  const nama = cari(t, DASAR.nama)
  const lain = teks(t).filter((e) => e !== nama)
  const terbesarLain = Math.max(...lain.map((e) => e.ukuran))

  assert.ok(nama, 'nama penerima ada')
  assert.equal(nama.wajah, 'serif-tebal', 'nama memakai wajah serif')
  assert.ok(
    nama.ukuran > terbesarLain,
    `nama (${nama.ukuran}pt) harus lebih besar dari teks lain (${terbesarLain}pt)`,
  )
})

test('hanya dua keluarga huruf yang dipakai', () => {
  const t = susunTataLetak(DASAR)
  const keluarga = new Set(teks(t).map((e) => (e.wajah.startsWith('serif') ? 'serif' : 'sans')))
  assert.deepEqual([...keluarga].sort(), ['sans', 'serif'])
})

test('nama panjang diperkecil agar tidak meluber', () => {
  const panjang = 'Muhammad Hafizh Abdurrahman Wijayakusuma bin Sutrisno'
  const t = susunTataLetak({ ...DASAR, nama: panjang })
  const nama = cari(t, panjang)
  const lebarPerkiraan = panjang.length * nama.ukuran * 0.5

  assert.ok(nama.ukuran < 34, `ukuran diperkecil dari 34pt menjadi ${nama.ukuran}pt`)
  assert.ok(lebarPerkiraan <= 640, `lebar ${lebarPerkiraan}pt masih di dalam batas 640pt`)
})

test('QR verifikasi menuju halaman /verify/<nomor>', () => {
  const t = susunTataLetak(DASAR)
  const qr = t.elemen.filter((e) => e.jenis === 'qr')
  assert.equal(qr.length, 1, 'tepat satu QR')
  assert.equal(qr[0].url, `https://kelas.niumination.web.id/verify/${DASAR.nomor}`)
  assert.ok(qr[0].sisi >= 70, 'cukup besar untuk dipindai setelah dicetak')
})

test('seluruh elemen berada di dalam kanvas A4 landscape', () => {
  const t = susunTataLetak(DASAR)
  for (const e of t.elemen) {
    if (e.jenis === 'teks') {
      const spasi = e.spasi ?? 0
      const lebar = e.isi.length * e.ukuran * 0.5 + spasi * Math.max(0, e.isi.length - 1)
      const kiri = e.rata === 'tengah' ? e.x - lebar / 2 : e.rata === 'kanan' ? e.x - lebar : e.x
      assert.ok(kiri >= 24, `"${e.isi}" tidak keluar dari kiri (${kiri.toFixed(0)}pt)`)
      assert.ok(kiri + lebar <= LEBAR - 24, `"${e.isi}" tidak keluar dari kanan`)
      assert.ok(e.y >= 24 && e.y <= TINGGI - 24, `"${e.isi}" masih di dalam kertas`)
    } else {
      const kanan = e.x + (e.lebar ?? e.panjang ?? e.sisi)
      const atas = e.y + (e.tinggi ?? e.sisi ?? 0)
      assert.ok(e.x >= 24 && kanan <= LEBAR - 24, `${e.jenis} di x=${e.x} masih di dalam kertas`)
      assert.ok(e.y >= 24 && atas <= TINGGI - 24, `${e.jenis} di y=${e.y} masih di dalam kertas`)
    }
  }
})

test('elemen wajib sertifikat seluruhnya ada', () => {
  const t = susunTataLetak(DASAR)
  const semua = teks(t).map((e) => e.isi).join(' | ')
  assert.ok(semua.includes('NIUMINATION'), 'ada penanda merek')
  assert.ok(semua.includes('SERTIFIKAT PENYELESAIAN'), 'ada judul')
  assert.ok(semua.includes('DIBERIKAN KEPADA'), 'ada label penerima')
  assert.ok(semua.includes(DASAR.judulKelas), 'ada judul kelas')
  assert.ok(semua.includes(DASAR.nomor), 'ada nomor sertifikat')
  assert.ok(semua.includes(DASAR.tanggal), 'ada tanggal terbit')
  assert.ok(semua.includes(DASAR.instruktur), 'ada nama instruktur')
  assert.ok(semua.includes('16 jam'), 'ada estimasi waktu')
})

test('baris meta bisa diganti untuk kelas lain', () => {
  const t = susunTataLetak({ ...DASAR, meta: '6 modul · 12 pelajaran · 5 kuis' })
  assert.ok(teks(t).some((e) => e.isi === '6 modul · 12 pelajaran · 5 kuis'))
})

test('nama tanda tangan diambil dari nama pendek atau sebelum tanda hubung', () => {
  const bio = 'Afrizal Munthe (Niumination) — Pranata Komputer @ Diskominfo Aceh Tengah'
  assert.equal(namaTandaTangan(bio), 'Afrizal Munthe (Niumination)')
  assert.equal(namaTandaTangan(bio, 'Afrizal Munthe'), 'Afrizal Munthe')
  assert.equal(namaTandaTangan(null, null), 'Niumination')
  assert.equal(namaTandaTangan(undefined), 'Niumination')
})

test('nama instruktur sepanjang apa pun tidak menabrak blok tanggal', () => {
  const panjang = 'Dr. Muhammad Hafizh Abdurrahman Wijayakusuma S.Kom., M.T.'
  const t = susunTataLetak({ ...DASAR, instruktur: panjang })
  const nama = teks(t).find((e) => e.rata === 'kiri' && e.x === 64 && e.wajah === 'serif-miring')
  const lebar = nama.isi.length * nama.ukuran * 0.5

  assert.ok(nama.ukuran <= 15, 'ukuran tidak melebihi 15pt')
  assert.ok(64 + lebar <= 300, `ujung kanan ${Math.round(64 + lebar)}pt masih sebelum blok tanggal (300pt)`)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { buatPdfSertifikat } from '../lib/sertifikat-pdf.mjs'
import { susunTataLetak } from '../lib/tata-letak-sertifikat.mjs'
import { buatQr } from '../lib/qr.mjs'

const CONTOH = {
  nomor: 'NIUM-2026-AIAGENT-7KQ3MT',
  nama: 'Siti Rahmah',
  judulKelas: 'AI Agent Self-Host',
  tanggal: '9 Oktober 2026',
  instruktur: 'Niumination',
  estimasiJam: 16,
}

test('PDF memiliki struktur yang sah', () => {
  const bytes = buatPdfSertifikat(CONTOH)
  const pdf = Buffer.from(bytes).toString('latin1')

  assert.ok(pdf.startsWith('%PDF-1.4'), 'berawalan %PDF-1.4')
  assert.ok(pdf.trimEnd().endsWith('%%EOF'), 'diakhiri %%EOF')
  assert.ok(pdf.includes('/Type /Catalog'), 'ada objek Catalog')
  assert.ok(pdf.includes('/Type /Pages'), 'ada objek Pages')
  assert.ok(pdf.includes('/BaseFont /Helvetica'), 'font sans terdaftar')
  assert.ok(pdf.includes('/BaseFont /Times-Bold'), 'font serif untuk nama terdaftar')
  assert.ok(pdf.includes('/BaseFont /Times-Italic'), 'font miring untuk tanda tangan terdaftar')
  assert.equal((pdf.match(/\/BaseFont \//g) ?? []).length, 4, 'empat font inti')
})

test('QR verifikasi ikut tergambar di halaman', () => {
  const pdf = Buffer.from(buatPdfSertifikat(CONTOH)).toString('latin1')
  const isi = pdf.match(/stream\n([\s\S]*?)endstream/)?.[1] ?? ''
  // QR digambar sebagai kumpulan persegi panjang terisi (`re f`), digabung per hamparan.
  const kotak = (isi.match(/ re f\n/g) ?? []).length
  assert.ok(kotak > 40, `QR terdiri dari banyak kotak terisi (didapat ${kotak})`)
  assert.ok(isi.includes('0 0 0 rg'), 'QR digambar hitam')
})

test('setiap offset di xref menunjuk ke objek yang benar', () => {
  const pdf = Buffer.from(buatPdfSertifikat(CONTOH)).toString('latin1')
  // Catatan: "startxref" juga mengandung kata "xref" dan muncul SETELAH tabelnya,
  // jadi jangan pakai lastIndexOf.
  const xrefPos = pdf.indexOf('\nxref\n') + 1
  const bagian = pdf.slice(xrefPos)
  const baris = bagian.split('\n').filter((b) => /^\d{10} 00000 n $/.test(b))

  assert.equal(baris.length, 8, 'delapan objek terdaftar')

  baris.forEach((b, i) => {
    const offset = Number(b.slice(0, 10))
    const barisObjek = pdf.slice(offset).split('\n')[0]
    assert.equal(barisObjek, `${i + 1} 0 obj`, `objek ${i + 1} ada di offset ${offset}`)
  })
})

test('Length di stream sesuai dengan isi stream', () => {
  const pdf = Buffer.from(buatPdfSertifikat(CONTOH)).toString('latin1')
  const m = pdf.match(/<< \/Length (\d+) >>\nstream\n([\s\S]*?)endstream/)
  assert.ok(m, 'stream ditemukan')
  assert.equal(Number(m[1]), m[2].length, 'panjang stream cocok')
})

test('nomor sertifikat tercetak di dokumen', () => {
  const pdf = Buffer.from(buatPdfSertifikat(CONTOH)).toString('latin1')
  assert.ok(pdf.includes(CONTOH.nomor), 'nomor tercetak')
  assert.ok(pdf.includes('SERTIFIKAT PENYELESAIAN'), 'judul tercetak')
  assert.ok(pdf.includes('Siti Rahmah'), 'nama penerima tercetak')
})

test('karakter non-Latin ditransliterasi, tidak merusak struktur', () => {
  const bytes = buatPdfSertifikat({ ...CONTOH, nama: 'Muhammad Nurdîn — Wijåyå' })
  const pdf = Buffer.from(bytes).toString('latin1')
  assert.ok(!/[^\x00-\x7F]/.test(pdf), 'seluruh berkas ASCII')
  assert.ok(pdf.includes('Nurdin'), 'karakter beraksen ditransliterasi')
})

test('tanda kurung pada nama tidak merusak string PDF', () => {
  const bytes = buatPdfSertifikat({ ...CONTOH, nama: 'Andi (Anak Baik) \\ Budi' })
  const pdf = Buffer.from(bytes).toString('latin1')
  assert.ok(pdf.includes('\\(Anak Baik\\)'), 'tanda kurung di-escape')
})

test('QR di dalam PDF cocok persis dengan matriks buatQr', () => {
  const tata = susunTataLetak(CONTOH)
  const e = tata.elemen.find((x) => x.jenis === 'qr')
  const qr = buatQr(e.url)
  const m = e.sisi / (qr.ukuran + 8)
  const x0 = e.x + 4 * m
  const y0 = e.y + 4 * m
  const n = (v) => Number(v.toFixed(2))

  // Harapan dihitung ulang di sisi uji — menangkap kalau baris QR terbalik
  // (baris 0 harus paling atas, padahal y PDF naik ke atas).
  const harapan = []
  for (let baris = 0; baris < qr.ukuran; baris++) {
    let kolom = 0
    while (kolom < qr.ukuran) {
      if (qr.modul[baris * qr.ukuran + kolom] !== 1) {
        kolom++
        continue
      }
      const awal = kolom
      while (kolom < qr.ukuran && qr.modul[baris * qr.ukuran + kolom] === 1) kolom++
      harapan.push(
        `${n(x0 + awal * m)} ${n(y0 + (qr.ukuran - 1 - baris) * m)} ` +
          `${n((kolom - awal) * m)} ${n(m)} re f`,
      )
    }
  }

  const pdf = Buffer.from(buatPdfSertifikat(CONTOH)).toString('latin1')
  const isi = pdf.match(/stream\n([\s\S]*?)endstream/)?.[1] ?? ''
  // Ambil kotak-kotak persegi yang digambar tepat setelah operator warna hitam
  // (QR) — bukan kotak aksen lain yang juga berbentuk `re f`.
  const baris = isi.split('\n')
  const didapat = []
  for (let i = baris.indexOf('0 0 0 rg') + 1; i < baris.length; i++) {
    if (!/^[\d.]+ [\d.]+ [\d.]+ [\d.]+ re f$/.test(baris[i])) break
    didapat.push(baris[i])
  }

  assert.deepEqual(didapat, harapan, 'setiap kotak QR ada di posisi yang tepat')
  assert.ok(harapan.length > 40, 'QR tidak kosong')
})

test('setiap objek teks menuliskan ulang spasi huruf (Tc)', () => {
  const pdf = Buffer.from(buatPdfSertifikat(CONTOH)).toString('latin1')
  const isi = pdf.match(/stream\n([\s\S]*?)endstream/)?.[1] ?? ''
  const objekTeks = (isi.match(/\bBT\n/g) ?? []).length
  const pengaturTc = (isi.match(/ Tc\n/g) ?? []).length

  // Tc adalah bagian dari text state dan TIDAK direset oleh BT. Kalau ada objek
  // teks yang tidak menulis ulang Tc, ia mewarisi spasi huruf objek sebelumnya.
  assert.ok(objekTeks > 0, 'ada objek teks')
  assert.equal(pengaturTc, objekTeks, 'setiap objek teks menyetel Tc')
})

test('PDF dapat dibaca parse PDF sungguhan (pdf.js)', async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const berkas = Buffer.from(buatPdfSertifikat(CONTOH))
  const doc = await pdfjs.getDocument({ data: new Uint8Array(berkas), verbosity: 0 }).promise

  assert.equal(doc.numPages, 1, 'satu halaman')

  const halaman = await doc.getPage(1)
  const kotak = halaman.getViewport({ scale: 1 })
  assert.equal(kotak.width, 842, 'lebar A4 landscape')
  assert.equal(kotak.height, 595, 'tinggi A4 landscape')

  const teks = (await halaman.getTextContent()).items
    .map((i) => i.str)
    .join(' ')
    .replace(/\s+/g, ' ')

  assert.ok(teks.includes('Siti Rahmah'), 'nama penerima terbaca utuh')
  assert.ok(teks.includes('AI Agent Self-Host'), 'judul kelas terbaca utuh')
  assert.ok(teks.includes(CONTOH.nomor), 'nomor sertifikat terbaca')
  assert.ok(teks.includes('9 Oktober 2026'), 'tanggal terbit terbaca utuh')
})

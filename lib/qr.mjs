/**
 * Encoder QR — ditulis sendiri, tanpa dependensi.
 *
 * Cakupan yang cukup untuk kebutuhan sertifikat:
 *   • mode byte (8-bit), versi 1–6, tingkat koreksi M
 *   • pemilihan topeng otomatis dengan aturan penalti baku
 *
 * Kenapa ditulis sendiri: sertifikat hanya perlu menyandikan satu URL pendek.
 * Mengimpor pustaka QR untuk satu berkas PDF terasa berlebihan, dan berkas
 * ini diuji dengan decoder sungguhan (jsQR) di tests/qr.test.mjs.
 */

// ── Aritmetika GF(256) ───────────────────────────────────────
const EKSP = new Uint8Array(512)
const LOG = new Uint8Array(256)
;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    EKSP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d // polinomial primitif x^8+x^4+x^3+x^2+1
  }
  for (let i = 255; i < 512; i++) EKSP[i] = EKSP[i - 255]
})()

function kali(a, b) {
  if (a === 0 || b === 0) return 0
  return EKSP[LOG[a] + LOG[b]]
}

function kalikanPolinomial(a, b) {
  const hasil = new Array(a.length + b.length - 1).fill(0)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) hasil[i + j] ^= kali(a[i], b[j])
  }
  return hasil
}

function polinomialGenerator(derajat) {
  let g = [1]
  for (let i = 0; i < derajat; i++) g = kalikanPolinomial(g, [1, EKSP[i]])
  return g
}

function sisaReedSolomon(data, jumlahEc) {
  const g = polinomialGenerator(jumlahEc)
  const sisa = new Array(data.length + jumlahEc).fill(0)
  for (let i = 0; i < data.length; i++) sisa[i] = data[i]
  for (let i = 0; i < data.length; i++) {
    const faktor = sisa[i]
    if (faktor === 0) continue
    for (let j = 0; j < g.length; j++) sisa[i + j] ^= kali(g[j], faktor)
  }
  return sisa.slice(data.length)
}

// ── Tabel versi (tingkat koreksi M) ──────────────────────────
const TABEL = {
  1: { ec: 10, blok: 1, total: 26 },
  2: { ec: 16, blok: 1, total: 44 },
  3: { ec: 26, blok: 1, total: 70 },
  4: { ec: 18, blok: 2, total: 100 },
  5: { ec: 24, blok: 2, total: 134 },
  6: { ec: 16, blok: 4, total: 172 },
}

const POSISI_ALIGNMENT = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
}

const BIT_TINGKAT = { L: 1, M: 0, Q: 3, H: 2 }

function kapasitasByte(versi) {
  const t = TABEL[versi]
  return t.total - t.ec * t.blok - 2 // 4 bit mode + 8 bit panjang
}

function pilihVersi(panjang) {
  for (let v = 1; v <= 6; v++) if (panjang <= kapasitasByte(v)) return v
  throw new Error(`Terlalu panjang untuk QR versi 1–6: ${panjang} byte`)
}

// ── Penyandian data ──────────────────────────────────────────
function kodeKataData(teks, versi) {
  const bit = []
  const dorong = (nilai, lebar) => {
    for (let i = lebar - 1; i >= 0; i--) bit.push((nilai >>> i) & 1)
  }

  dorong(0b0100, 4) // mode byte
  const bait = Array.from(new TextEncoder().encode(teks))
  dorong(bait.length, 8)
  for (const b of bait) dorong(b, 8)

  const t = TABEL[versi]
  const kapasitasBit = (t.total - t.ec * t.blok) * 8
  // terminator maksimal 4 bit, lalu penanda ke kelipatan 8
  for (let i = 0; i < 4 && bit.length < kapasitasBit; i++) bit.push(0)
  while (bit.length % 8 !== 0) bit.push(0)

  const hasil = []
  for (let i = 0; i < bit.length; i += 8) {
    let b = 0
    for (let j = 0; j < 8; j++) b = (b << 1) | bit[i + j]
    hasil.push(b)
  }

  const pola = [0xec, 0x11]
  let p = 0
  while (hasil.length < t.total - t.ec * t.blok) hasil.push(pola[p++ % 2])

  return hasil
}

function blokEc(data, versi) {
  const t = TABEL[versi]
  const jumlahData = data.length
  const perBlok = Math.floor(jumlahData / t.blok)
  const sisa = jumlahData % t.blok

  const blok = []
  let pos = 0
  for (let i = 0; i < t.blok; i++) {
    const panjang = perBlok + (i >= t.blok - sisa ? 1 : 0)
    const potong = data.slice(pos, pos + panjang)
    pos += panjang
    blok.push({ data: potong, ec: sisaReedSolomon(potong, t.ec) })
  }

  // Gabung (interleave) data lalu EC
  const hasil = []
  const maksData = Math.max(...blok.map((b) => b.data.length))
  for (let i = 0; i < maksData; i++) {
    for (const b of blok) if (i < b.data.length) hasil.push(b.data[i])
  }
  for (let i = 0; i < t.ec; i++) {
    for (const b of blok) hasil.push(b.ec[i])
  }
  return hasil
}

// ── Matriks ──────────────────────────────────────────────────
function bitDari(angka, indeks) {
  return ((angka >>> indeks) & 1) !== 0
}

const TOPIL = [
  (i, j) => (i + j) % 2 === 0,
  (i) => i % 2 === 0,
  (i, j) => j % 3 === 0,
  (i, j) => (i + j) % 3 === 0,
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
  (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
  (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
  (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
]

function infoFormat(tingkat, topeng) {
  let data = (BIT_TINGKAT[tingkat] << 3) | topeng
  let sisa = data << 10
  for (let i = 14; i >= 10; i--) if (sisa & (1 << i)) sisa ^= 0x537 << (i - 10)
  return (((data << 10) | sisa) ^ 0x5412) >>> 0
}

function bangunMatriks(versi, kodeKata, topeng) {
  const ukuran = 17 + 4 * versi
  const m = new Int8Array(ukuran * ukuran).fill(-1) // -1 = belum diisi
  const atur = (x, y, gelap) => {
    if (x < 0 || y < 0 || x >= ukuran || y >= ukuran) return
    m[y * ukuran + x] = gelap ? 1 : 0
  }
  const isi = (x, y) => m[y * ukuran + x] !== -1

  // Pencari + pemisah di tiga sudut
  const taruhPencari = (px, py) => {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const x = px + dx
        const y = py + dy
        if (x < 0 || y < 0 || x >= ukuran || y >= ukuran) continue
        const dalam =
          dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 &&
          (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4))
        atur(x, y, dalam)
      }
    }
  }
  taruhPencari(0, 0)
  taruhPencari(ukuran - 7, 0)
  taruhPencari(0, ukuran - 7)

  // Pola waktu
  for (let i = 8; i < ukuran - 8; i++) {
    atur(i, 6, i % 2 === 0)
    atur(6, i, i % 2 === 0)
  }

  // Pola alignment
  const pos = POSISI_ALIGNMENT[versi]
  for (const r of pos) {
    for (const c of pos) {
      const berdekatanPencari =
        (r === 6 && c === 6) ||
        (r === 6 && c === ukuran - 7) ||
        (r === ukuran - 7 && c === 6)
      if (berdekatanPencari) continue
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const gelap = Math.max(Math.abs(dx), Math.abs(dy)) !== 1
          atur(c + dx, r + dy, gelap)
        }
      }
    }
  }

  // Cadangan area info format + modul gelap
  for (let i = 0; i <= 8; i++) {
    if (!isi(i, 8)) atur(i, 8, false)
    if (!isi(8, i)) atur(8, i, false)
  }
  for (let i = 0; i < 8; i++) {
    if (!isi(ukuran - 1 - i, 8)) atur(ukuran - 1 - i, 8, false)
    if (!isi(8, ukuran - 1 - i)) atur(8, ukuran - 1 - i, false)
  }

  // Tempat data (zigzag dari kanan bawah)
  let indeksBit = 0
  const totalBit = kodeKata.length * 8
  let keAtas = true
  for (let kolom = ukuran - 1; kolom > 0; kolom -= 2) {
    if (kolom === 6) kolom = 5
    for (let baris = 0; baris < ukuran; baris++) {
      for (let k = 0; k < 2; k++) {
        const x = kolom - k
        const y = keAtas ? ukuran - 1 - baris : baris
        if (isi(x, y)) continue
        let nilai = 0
        if (indeksBit < totalBit) {
          // bitDari() mengembalikan boolean — wajib dinormalisasi ke 0/1
          // sebelum di-XOR dengan topeng, kalau tidak `true ^ 1` jadi 0
          // dan `true === 1` jadi false.
          nilai = bitDari(kodeKata[indeksBit >>> 3], 7 - (indeksBit & 7)) ? 1 : 0
          indeksBit++
        }
        if (TOPIL[topeng](y, x)) nilai ^= 1
        atur(x, y, nilai === 1)
      }
    }
    keAtas = !keAtas
  }

  // Info format (dua salinan) + modul gelap
  const fmt = infoFormat('M', topeng)
  for (let i = 0; i <= 5; i++) atur(8, i, bitDari(fmt, i))
  atur(8, 7, bitDari(fmt, 6))
  atur(8, 8, bitDari(fmt, 7))
  atur(7, 8, bitDari(fmt, 8))
  for (let i = 9; i < 15; i++) atur(14 - i, 8, bitDari(fmt, i))

  for (let i = 0; i < 8; i++) atur(ukuran - 1 - i, 8, bitDari(fmt, i))
  for (let i = 8; i < 15; i++) atur(8, ukuran - 15 + i, bitDari(fmt, i))
  atur(8, ukuran - 8, true)

  return { ukuran, modul: m }
}

// ── Penalti (aturan baku) ────────────────────────────────────
function hitungPenalti({ ukuran, modul }) {
  const pada = (x, y) => modul[y * ukuran + x] === 1
  let penalti = 0

  // Aturan 1: lima modul sewarna berurutan
  const jajar = (ambil) => {
    let p = 0
    for (let a = 0; a < ukuran; a++) {
      let run = 1
      for (let b = 1; b < ukuran; b++) {
        if (ambil(a, b) === ambil(a, b - 1)) run++
        else {
          if (run >= 5) p += 3 + (run - 5)
          run = 1
        }
      }
      if (run >= 5) p += 3 + (run - 5)
    }
    return p
  }
  penalti += jajar((y, x) => pada(x, y))
  penalti += jajar((x, y) => pada(x, y))

  // Aturan 2: blok 2×2 sewarna
  let blok = 0
  for (let y = 0; y < ukuran - 1; y++) {
    for (let x = 0; x < ukuran - 1; x++) {
      const v = pada(x, y)
      if (v === pada(x + 1, y) && v === pada(x, y + 1) && v === pada(x + 1, y + 1)) blok++
    }
  }
  penalti += blok * 3

  // Aturan 3: pola menyerupai pencari 1:1:3:1:1
  const POLA = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0]
  const cocok = (ambil, a, mulai) => POLA.every((v, i) => ambil(a, mulai + i) === (v === 1))
  for (let a = 0; a < ukuran; a++) {
    for (let b = 0; b + 11 <= ukuran; b++) {
      if (cocok((y, x) => pada(x, y), a, b)) penalti += 40
      if (cocok((x, y) => pada(x, y), a, b)) penalti += 40
    }
  }

  // Aturan 4: proporsi modul gelap
  let gelap = 0
  for (let i = 0; i < modul.length; i++) if (modul[i] === 1) gelap++
  const persen = (gelap * 100) / (ukuran * ukuran)
  penalti += Math.floor(Math.abs(persen - 50) / 5) * 10

  return penalti
}

/**
 * @param {string} teks
 * @returns {{ukuran:number, modul:Int8Array}} modul: 1 = gelap, berurutan per baris
 */
export function buatQr(teks, topengTetap) {
  const versi = pilihVersi(new TextEncoder().encode(teks).length)
  const kodeKata = blokEc(kodeKataData(teks, versi), versi)

  if (topengTetap !== undefined) return bangunMatriks(versi, kodeKata, topengTetap)

  let terbaik = null
  let penaltiTerbaik = Infinity
  for (let topeng = 0; topeng < 8; topeng++) {
    const m = bangunMatriks(versi, kodeKata, topeng)
    const p = hitungPenalti(m)
    if (p < penaltiTerbaik) {
      penaltiTerbaik = p
      terbaik = m
    }
  }
  return terbaik
}

/** Untuk pengujian & debug: aliran kode kata sebelum ditempatkan di matriks. */
export function kodeKataUntuk(teks) {
  const versi = pilihVersi(new TextEncoder().encode(teks).length)
  return { versi, kodeKata: blokEc(kodeKataData(teks, versi), versi) }
}

/** Untuk pengujian: versi yang dipilih untuk sebuah teks. */
export function versiUntuk(teks) {
  return pilihVersi(new TextEncoder().encode(teks).length)
}

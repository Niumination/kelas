/**
 * Uji integritas materi.
 *
 * Dua bug nyata yang pernah lolos dan ditangkap di sini:
 *   1. kurung kurawal telanjang di luar blok kode → MDX gagal disusun (acorn)
 *   2. petik ganda di dalam nilai atribut JSX berpetik ganda → atribut putus,
 *      lalu parser membaca `sop.pdf` sebagai nama atribut (karakter `.` ditolak)
 *
 * Keduanya hanya muncul saat halaman dibuka. Uji ini mendeteksinya dari berkasnya,
 * jadi kejadiannya cukup sekali.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync, writeFileSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const KONTEN = join(dirname(fileURLToPath(import.meta.url)), '..', 'content')
const KELAS = 'ai-agent-self-host'

/** Kumpulkan seluruh pelajaran, sudah terurut sesuai urutan modul lalu pelajaran. */
function kumpulkan() {
  const daftar = []
  for (const direktori of readdirSync(join(KONTEN, KELAS))) {
    const berkasModul = join(KONTEN, KELAS, direktori, '_modul.json')
    if (!existsSync(berkasModul)) continue
    const modul = JSON.parse(readFileSync(berkasModul, 'utf8'))
    for (const nama of readdirSync(join(KONTEN, KELAS, direktori))) {
      if (!nama.endsWith('.mdx')) continue
      const jalur = join(KONTEN, KELAS, direktori, nama)
      daftar.push({ modul, jalur, nama, direktori })
    }
  }
  daftar.sort((a, b) =>
    a.modul.urutan - b.modul.urutan ||
    a.nama.localeCompare(b.nama, 'id'))
  return daftar
}

const PELAJARAN = kumpulkan()

function depan(isi) {
  // frontmatter dibatasi oleh baris "---" di awal dan akhir
  const baris = isi.split('\n')
  if (baris[0].trim() !== '---') return null
  const hasil = {}
  for (let i = 1; i < baris.length; i++) {
    if (baris[i].trim() === '---') return hasil
    const m = baris[i].match(/^([A-Za-z]+):\s*(.*)$/)
    if (m) hasil[m[1]] = m[2]
  }
  return null
}

/** Baris-baris di luar blok kode dan di luar tag JSX yang membentang beberapa baris. */
function barisProsa(isi) {
  const keluar = []
  let diFence = false
  let diTag = false
  isi.split('\n').forEach((l, i) => {
    const mulaiTag = /^\s*<\/?[A-Z][A-Za-z]*[\s>]/.test(l)
    if (diTag) {
      // tag bisa membentang beberapa baris; baru selesai kalau ketemu ">"
      if (l.includes('>')) diTag = false
      return
    }
    if (l.trim().startsWith('```')) {
      diFence = !diFence
      return
    }
    if (diFence) return
    if (mulaiTag) {
      // atribut bisa mengandung ">" atau berlanjut ke baris berikutnya
      if (!l.trimEnd().endsWith('>')) diTag = true
      return
    }
    keluar.push({ nomor: i + 1, isi: l })
  })
  return keluar
}

test('setiap pelajaran punya frontmatter lengkap', () => {
  for (const p of PELAJARAN) {
    const isi = readFileSync(p.jalur, 'utf8')
    const fm = depan(isi)
    assert.ok(fm, `${p.nama}: frontmatter tidak ditemukan`)
    for (const kunci of ['judul', 'ringkasan', 'menit', 'urutan', 'tags']) {
      assert.ok(fm[kunci], `${p.nama}: frontmatter tanpa \`${kunci}\``)
    }
    assert.match(fm.menit, /^\d+$/, `${p.nama}: menit harus angka`)
  }
})

test('nilai frontmatter yang mengandung titik dua harus berpetik', () => {
  // YAML: `judul: Strategi A: yang benar` akan gagal diparse.
  for (const p of PELAJARAN) {
    const isi = readFileSync(p.jalur, 'utf8').split('\n')
    for (let i = 1; i < isi.length; i++) {
      if (isi[i].trim() === '---') break
      const m = isi[i].match(/^([a-z]+):\s*(.*)$/)
      if (!m) continue
      const nilai = m[2]
      if (!nilai.includes(':')) continue
      const berpetik = (nilai.startsWith('"') && nilai.endsWith('"')) ||
                       (nilai.startsWith("'") && nilai.endsWith("'"))
      assert.ok(berpetik, `${p.nama} baris ${i + 1}: nilai mengandung titik dua tanpa petik`)
    }
  }
})

test('tidak ada kurung kurawal telanjang di luar blok kode', () => {
  for (const p of PELAJARAN) {
    for (const b of barisProsa(readFileSync(p.jalur, 'utf8'))) {
      // boleh kalau di dalam backtick (kode sebaris)
      const bersih = b.isi.replace(/`[^`]*`/g, '')
      // Anak elemen JSX ikut diparse sebagai MDX, jadi `{...}` di sana adalah
      // ekspresi JavaScript: tersusun, lalu crash saat dirender. Pakai &lbrace;
      // kalau memang perlu menampilkan kurung kurawal.
      assert.ok(!bersih.includes('{') && !bersih.includes('}'),
        `${p.nama} baris ${b.nomor}: kurung kurawal di luar blok kode ` +
        `-> MDX gagal disusun atau crash saat dirender (pakai &lbrace; / &rbrace;)`)
    }
  }
})

/**
 * Kumpulkan tag JSX dengan pemindai yang sadar petik.
 * Regex sederhana `<[A-Z]...[^>]*>` tidak cukup: perintah shell di dalam atribut
 * bisa mengandung `>` (mis. `> ruang-kerja/catatan.txt`), sehingga tag terpotong
 * dan jumlah petiknya tampak ganjil.
 */
function tagJsx(isi) {
  const hasil = []
  let i = 0
  while (i < isi.length) {
    if (isi[i] !== '<' || !/[A-Z]/.test(isi[i + 1] ?? '')) {
      i++
      continue
    }
    let j = i + 1
    let petik = null
    let dalam = true
    while (j < isi.length && dalam) {
      const c = isi[j]
      if (petik) {
        if (c === petik) petik = null
      } else if (c === '"' || c === "'") {
        petik = c
      } else if (c === '>') {
        dalam = false
      }
      j++
    }
    if (!dalam) hasil.push({ teks: isi.slice(i, j), nomor: isi.slice(0, i).split('\n').length })
    i = j
  }
  return hasil
}

/**
 * Hapus blok kode dan kode sebaris, tapi **pertahankan jumlah barisnya** supaya
 * nomor baris pada pesan galat tetap menunjuk ke berkas aslinya.
 */
function tanpaKode(isi) {
  let diFence = false
  return isi
    .split('\n')
    .map((l) => {
      if (l.trim().startsWith('```')) {
        diFence = !diFence
        return ''
      }
      return diFence ? '' : l.replace(/`[^`]*`/g, '')
    })
    .join('\n')
}

test('atribut JSX tidak memakai petik yang menghentikan nilainya', () => {
  for (const p of PELAJARAN) {
    // Tag di dalam blok kode bukan JSX — contoh `<<<KUTIPAN sumber='x'>>>`
    // di dalam python tidak boleh ikut diperiksa.
    const isi = tanpaKode(readFileSync(p.jalur, 'utf8'))
    for (const { teks, nomor: nomorTag } of tagJsx(isi)) {
      const tag = teks
      // Pola ketat: nama atribut diikuti nilai berpetik ganda yang tidak mengandung
      // petik ganda lagi. Nilai yang putus — misalnya karena ada petik ganda di
      // dalamnya — tidak akan cocok, dan itulah yang ingin ditangkap.
      // Perhatikan: backslash di dalam nilai sah-sah saja (perintah shell printf
      // memang perlu menampilkan karakter backslash-n).
      const sah = /^<[A-Z][A-Za-z]*(\s+[a-zA-Z]+="[^"]*")*\s*\/?>$/.test(tag)
      assert.ok(sah,
        `${p.nama} baris ${nomorTag}: atribut tidak berbentuk sah -> \`${tag.slice(0, 80)}\``)
    }
  }
})

test('tidak ada karakter CJK atau rusak di materi', () => {
  const diizinkan = new Set([...'—·…→←✓’‘“”–│┌┐└┘─▼▶'])
  for (const p of PELAJARAN) {
    const isi = readFileSync(p.jalur, 'utf8')
    isi.split('\n').forEach((l, i) => {
      for (const ch of l) {
        const kode = ch.codePointAt(0)
        if (kode < 0x2e00) continue
        assert.ok(diizinkan.has(ch),
          `${p.nama} baris ${i + 1}: karakter mencurigakan ${JSON.stringify(ch)} (U+${kode.toString(16)})`)
      }
    })
  }
})

test('modul berbayar tidak lagi berisi penanda pratinjau', () => {
  const berbayar = PELAJARAN.filter((p) => p.modul.akses === 'berbayar')
  assert.ok(berbayar.length >= 8, `ada ${berbayar.length} pelajaran berbayar`)
  for (const p of berbayar) {
    const isi = readFileSync(p.jalur, 'utf8')
    assert.ok(!isi.includes('Modul berbayar'), `${p.nama}: masih berlabel pratinjau`)
    assert.ok(!isi.includes('Yang dibahas di bagian berbayar'),
      `${p.nama}: masih memakai daftar "yang dibahas di bagian berbayar"`)
    assert.ok(isi.length > 6000,
      `${p.nama}: isi baru ${isi.length} karakter — seharusnya sudah lengkap`)
  }
})

test('nomor Tugas mengikuti nomor pelajaran global', () => {
  PELAJARAN.forEach((p, indeks) => {
    const isi = readFileSync(p.jalur, 'utf8')
    const cocok = [...isi.matchAll(/<Tugas ke="(\d+)">/g)]
    assert.equal(cocok.length, 1, `${p.nama}: harusnya tepat satu Tugas`)
    assert.equal(Number(cocok[0][1]), indeks + 1,
      `${p.nama}: Tugas ke=${cocok[0][1]}, seharusnya ${indeks + 1}`)
  })
})

test('halaman tidak mengirim isi MDX berbayar sebelum entitlement', () => {
  const halaman = readFileSync(
    join(KONTEN, '..', 'app', 'belajar', '[kursus]', '[...pelajaran]', 'page.tsx'),
    'utf8',
  )
  // Isi penuh harus berada di cabang akses-penuh; cabang terkunci hanya boleh
  // merender ringkasan metadata, bukan `materi.isi`.
  assert.match(
    halaman,
    /\{terkunci\s*\?\s*\([\s\S]*?\{materi\.ringkasan\}[\s\S]*?\)\s*:\s*\(\s*<MdxIsi sumber=\{materi\.isi\}\s*\/>\s*\)\s*\}/,
  )
  assert.match(halaman, /aktif=\{Boolean\(pengguna\) && !terkunci\}/)
})

test('struktur kelas sesuai yang dijanjikan README', () => {
  const modul = [...new Set(PELAJARAN.map((p) => p.modul.slug))]
  assert.equal(modul.length, 6, 'enam modul')
  assert.equal(PELAJARAN.length, 12, 'dua belas pelajaran')
  const gratis = PELAJARAN.filter((p) => p.modul.akses === 'gratis')
  assert.equal(gratis.length, 4, 'empat pelajaran gratis')
})

test('jumlah menit materi tidak melenceng jauh dari estimasiJam', () => {
  const kelas = JSON.parse(readFileSync(join(KONTEN, KELAS, 'kelas.json'), 'utf8'))
  const totalMenit = PELAJARAN.reduce(
    (n, p) => n + Number(depan(readFileSync(p.jalur, 'utf8')).menit), 0)

  const menit = kelas.estimasiJam * 60
  const selisih = Math.abs(totalMenit - menit) / menit
  assert.ok(selisih <= 0.15,
    `total ${totalMenit} menit vs estimasiJam ${kelas.estimasiJam} jam (${menit} menit) ` +
    `— selisih ${(selisih * 100).toFixed(0)}%, melewati batas 15%`)
})

/** Kumpulkan blok kode berdasarkan bahasanya, lengkap dengan nomor barisnya. */
function blokKode(isi, bahasa) {
  const hasil = []
  const baris = isi.split('\n')
  let di = false
  let bahasaSekarang = ''
  let mulai = 0
  baris.forEach((l, i) => {
    const buka = l.trim().match(/^```(\w+)?\s*$/)
    if (buka) {
      if (!di) {
        di = true
        bahasaSekarang = buka[1] ?? ''
        mulai = i + 2
      } else {
        if (bahasaSekarang === bahasa) hasil.push({ nomor: mulai, kode: baris.slice(mulai - 1, i).join('\n') })
        di = false
      }
    }
  })
  return hasil
}

test('contoh python di materi bebas kesalahan sintaks', () => {
  // Contoh kode yang tidak bisa dikompilasi langsung merusak kepercayaan
  // pada seluruh kelas. Tidak bisa menjalankannya (butuh Ollama), tapi
  // sintaksnya bisa — dan harus — diperiksa.
  let python = null
  try {
    execFileSync('python3', ['--version'], { stdio: 'ignore' })
    python = 'python3'
  } catch {
    return // python3 tidak ada di mesin ini; lewati
  }

  const sementara = join(dirname(fileURLToPath(import.meta.url)), '..', '.tmp-cek.py')
  let buruk = 0
  for (const p of PELAJARAN) {
    for (const b of blokKode(readFileSync(p.jalur, 'utf8'), 'python')) {
      writeFileSync(sementara, b.kode, 'utf8')
      try {
        execFileSync(python, ['-m', 'py_compile', sementara], { stdio: 'ignore' })
      } catch (e) {
        buruk++
        console.log(`  ${p.nama}:${b.nomor} -> ${String(e.stderr ?? '').slice(0, 200)}`)
      }
    }
  }
  if (existsSync(sementara)) unlinkSync(sementara)
  assert.equal(buruk, 0, `${buruk} blok python tidak bisa dikompilasi`)
})

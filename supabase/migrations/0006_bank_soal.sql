-- ══════════════════════════════════════════════════════════════
-- Bank soal
--
-- Format:
--   opsi  = [{"id":"a","teks":"..."}, ...]
--   kunci = {"jawaban":"a"}
--
-- Soal untuk modul berbayar disertakan sejak awal supaya Fase 3
-- tinggal mengaktifkan UI-nya, tidak perlu menulis ulang skema.
-- ══════════════════════════════════════════════════════════════

do $banksoal$
declare
  v_course uuid;
  v_modul  uuid;
  v_kuis   uuid;
begin
  select id into v_course from courses where slug = 'ai-agent-self-host';
  if v_course is null then
    raise exception 'Jalankan 0003_seed.sql lebih dulu';
  end if;

  -- ────────────────────────────────────────────────────────────
  -- Modul 1: Fondasi (gratis)
  -- ────────────────────────────────────────────────────────────
  select id into v_modul from modules where course_id = v_course and slug = 'fondasi';

  insert into quizzes (module_id, judul, nilai_lulus)
  values (v_modul, 'Kuis Modul 1 — Fondasi', 70)
  on conflict do nothing
  returning id into v_kuis;

  if v_kuis is null then
    select id into v_kuis from quizzes where module_id = v_modul limit 1;
  end if;

  delete from questions where quiz_id = v_kuis;

  insert into questions (quiz_id, tipe, pertanyaan, opsi, kunci, urutan) values
  (v_kuis, 'pilihan_ganda',
   'Dokumen draf peraturan yang belum tayang harus diringkas dengan AI. Timmu hanya punya akses API cloud berbayar dan satu mesin lokal dengan GPU sederhana. Apa pertimbangan utamanya?',
   $$[{"id":"a","teks":"Kualitas model cloud selalu lebih baik, jadi kirim saja"},{"id":"b","teks":"Data belum tayang tidak boleh keluar ke pihak ketiga — proses secara lokal"},{"id":"c","teks":"Biaya API selalu lebih mahal dari server GPU"},{"id":"d","teks":"Model lokal selalu lebih pintar untuk bahasa Indonesia"}]$$,
   $${"jawaban":"b"}$$, 1),

  (v_kuis, 'pilihan_ganda',
   'Berapa kira-kira memori yang dibutuhkan model 8B dengan kuantisasi Q4_K_M?',
   $$[{"id":"a","teks":"Sekitar 1–2 GB"},{"id":"b","teks":"Sekitar 4–5 GB"},{"id":"c","teks":"Sekitar 16 GB"},{"id":"d","teks":"Sekitar 32 GB"}]$$,
   $${"jawaban":"b"}$$, 2),

  (v_kuis, 'pilihan_ganda',
   'Kamu punya GPU 8 GB, tapi `ollama ps` menunjukkan model berjalan 100% di CPU. Apa kemungkinan besar penyebabnya?',
   $$[{"id":"a","teks":"Modelnya terlalu besar untuk GPU mana pun"},{"id":"b","teks":"Driver CUDA/ROCm belum terpasang, jadi Ollama tidak memakai GPU"},{"id":"c","teks":"Ollama tidak mendukung GPU sama sekali"},{"id":"d","teks":"Port 11434 sedang dipakai proses lain"}]$$,
   $${"jawaban":"b"}$$, 3),

  (v_kuis, 'pilihan_ganda',
   'Metrik mana yang paling menentukan apakah sebuah model lokal terasa nyaman dipakai pengguna?',
   $$[{"id":"a","teks":"total duration saja"},{"id":"b","teks":"eval rate (token per detik)"},{"id":"c","teks":"jumlah parameter model"},{"id":"d","teks":"ukuran berkas model"}]$$,
   $${"jawaban":"b"}$$, 4),

  (v_kuis, 'pilihan_ganda',
   'Kapan self-host BUKAN pilihan yang tepat?',
   $$[{"id":"a","teks":"Kualitas jawaban adalah segalanya dan pemakaian jarang"},{"id":"b","teks":"Datanya sensitif"},{"id":"c","teks":"Volume pemrosesan sangat tinggi tiap hari"},{"id":"d","teks":"Kamu ingin paham cara kerja model"}]$$,
   $${"jawaban":"a"}$$, 5);

  -- ────────────────────────────────────────────────────────────
  -- Modul 2: Agent pertama (gratis)
  -- ────────────────────────────────────────────────────────────
  select id into v_modul from modules where course_id = v_course and slug = 'agent-pertama';

  insert into quizzes (module_id, judul, nilai_lulus)
  values (v_modul, 'Kuis Modul 2 — Agent Pertama', 70)
  on conflict do nothing
  returning id into v_kuis;

  if v_kuis is null then
    select id into v_kuis from quizzes where module_id = v_modul limit 1;
  end if;

  delete from questions where quiz_id = v_kuis;

  insert into questions (quiz_id, tipe, pertanyaan, opsi, kunci, urutan) values
  (v_kuis, 'pilihan_ganda',
   'Dalam tool calling, siapa yang sebenarnya menjalankan tool?',
   $$[{"id":"a","teks":"Modelnya, di dalam proses inference"},{"id":"b","teks":"Kode kita, setelah model mengajukan permintaan pemanggilan"},{"id":"c","teks":"Server Ollama secara otomatis"},{"id":"d","teks":"Sistem operasi lewat system call"}]$$,
   $${"jawaban":"b"}$$, 1),

  (v_kuis, 'pilihan_ganda',
   'Mengapa `eval()` berbahaya kalau dipakai untuk mengeksekusi ekspresi yang dihasilkan model?',
   $$[{"id":"a","teks":"Karena hasilnya sering salah hitung"},{"id":"b","teks":"Karena memberi model kemampuan menjalankan kode apa pun di prosesmu (RCE)"},{"id":"c","teks":"Karena eval() lambat"},{"id":"d","teks":"Karena eval() tidak mendukung operasi matematika"}]$$,
   $${"jawaban":"b"}$$, 2),

  (v_kuis, 'pilihan_ganda',
   'Agent-mu memanggil tool yang sama berulang kali tanpa henti. Apa kesalahan yang paling mungkin?',
   $$[{"id":"a","teks":"Kamu tidak menambahkan hasil tool ke daftar messages"},{"id":"b","teks":"Temperature-nya terlalu rendah"},{"id":"c","teks":"Modelnya terlalu besar"},{"id":"d","teks":"Kamu memakai endpoint /api/generate"}]$$,
   $${"jawaban":"a"}$$, 3),

  (v_kuis, 'pilihan_ganda',
   'Di mana sebaiknya kunci API disimpan saat mengembangkan agent di laptop?',
   $$[{"id":"a","teks":"Di berkas .env yang ikut ter-commit"},{"id":"b","teks":"Di keychain sistem operasi (macOS Keychain / Secret Service / Credential Manager)"},{"id":"c","teks":"Di variabel berawalan NEXT_PUBLIC_"},{"id":"d","teks":"Di dalam image Docker dengan ENV"}]$$,
   $${"jawaban":"b"}$$, 4);

  -- ────────────────────────────────────────────────────────────
  -- Modul 3: Orkestrasi (berbayar)
  -- ────────────────────────────────────────────────────────────
  select id into v_modul from modules where course_id = v_course and slug = 'orkestrasi';

  insert into quizzes (module_id, judul, nilai_lulus)
  values (v_modul, 'Kuis Modul 3 — Orkestrasi', 70)
  on conflict do nothing
  returning id into v_kuis;

  if v_kuis is null then
    select id into v_kuis from quizzes where module_id = v_modul limit 1;
  end if;

  delete from questions where quiz_id = v_kuis;

  insert into questions (quiz_id, tipe, pertanyaan, opsi, kunci, urutan) values
  (v_kuis, 'pilihan_ganda',
   'Mengapa field `alasan` pada setiap langkah rencana agent sebaiknya diwajibkan?',
   $$[{"id":"a","teks":"Supaya jawabannya lebih panjang"},{"id":"b","teks":"Menurunkan pilihan tool asal-asalan dan memberi jejak saat menelusuri kegagalan"},{"id":"c","teks":"Karena wajib secara teknis di Ollama"},{"id":"d","teks":"Supaya model memakai lebih sedikit token"}]$$,
   $${"jawaban":"b"}$$, 1),

  (v_kuis, 'pilihan_ganda',
   'Alasan yang TEPAT untuk menambah agent kedua adalah…',
   $$[{"id":"a","teks":"Supaya arsitekturnya terlihat canggih"},{"id":"b","teks":"Ada tahap dengan keahlian dan tool berbeda, atau pekerjaan yang bisa paralel"},{"id":"c","teks":"Untuk memperbaiki agent pertama yang tidak akurat"},{"id":"d","teks":"Karena modelnya terlalu kecil"}]$$,
   $${"jawaban":"b"}$$, 2),

  (v_kuis, 'pilihan_ganda',
   'Apa yang paling sering membuat tagihan multi-agent membengkak tanpa terasa?',
   $$[{"id":"a","teks":"Harga token naik tiap bulan"},{"id":"b","teks":"Setiap serah tugas mengirim ulang konteks, sehingga percakapan antar-agent menghabiskan banyak token"},{"id":"c","teks":"Model lokal lebih mahal dari cloud"},{"id":"d","teks":"Database menyimpan terlalu banyak baris"}]$$,
   $${"jawaban":"b"}$$, 3),

  (v_kuis, 'pilihan_ganda',
   'Kenapa anggaran giliran dan deteksi pengulangan harus ditegakkan di kode, bukan di prompt?',
   $$[{"id":"a","teks":"Supaya prompt lebih pendek"},{"id":"b","teks":"Karena model tidak bisa membujuk kode untuk menambah giliran, sedangkan instruksi di prompt bisa diabaikan"},{"id":"c","teks":"Karena Ollama mewajibkannya"},{"id":"d","teks":"Supaya log lebih rapi"}]$$,
   $${"jawaban":"b"}$$, 4),

  (v_kuis, 'pilihan_ganda',
   'Dalam sistem multi-agent, mengapa keadaan bersama sebaiknya bersifat append-only dan hanya boleh ditulis Supervisor?',
   $$[{"id":"a","teks":"Supaya berkas log lebih kecil"},{"id":"b","teks":"Mencegah pekerjaan satu worker hilang ditimpa worker lain, dan riwayatnya ikut tersimpan"},{"id":"c","teks":"Karena Postgres tidak mendukung UPDATE"},{"id":"d","teks":"Supaya worker bisa membaca lebih cepat"}]$$,
   $${"jawaban":"b"}$$, 5);


  -- ────────────────────────────────────────────────────────────
  -- Modul 5: Produksi (berbayar)
  -- ────────────────────────────────────────────────────────────
  select id into v_modul from modules where course_id = v_course and slug = 'produksi';

  insert into quizzes (module_id, judul, nilai_lulus)
  values (v_modul, 'Kuis Modul 5 — Produksi', 70)
  on conflict do nothing
  returning id into v_kuis;

  if v_kuis is null then
    select id into v_kuis from quizzes where module_id = v_modul limit 1;
  end if;

  delete from questions where quiz_id = v_kuis;

  insert into questions (quiz_id, tipe, pertanyaan, opsi, kunci, urutan) values
  (v_kuis, 'pilihan_ganda',
   'Kenapa instruksi "jangan lakukan X" di dalam prompt bukanlah guardrail yang sesungguhnya?',
   $$[{"id":"a","teks":"Karena prompt terlalu panjang"},{"id":"b","teks":"Karena itu hanya harapan; pagar yang sesungguhnya ditegakkan di kode, di luar model"},{"id":"c","teks":"Karena model tidak bisa membaca prompt panjang"},{"id":"d","teks":"Karena instruksi sistem selalu diabaikan"}]$$,
   $${"jawaban":"b"}$$, 1),

  (v_kuis, 'pilihan_ganda',
   'Urutan yang benar saat kunci API telanjur bocor ke repositori publik adalah…',
   $$[{"id":"a","teks":"Bersihkan repositori dulu, baru cabut kuncinya"},{"id":"b","teks":"Cabut kuncinya dulu di dasbor penyedia, baru bersihkan repositori"},{"id":"c","teks":"Laporkan ke GitHub lalu tunggu"},{"id":"d","teks":"Ganti kunci besok saja"}]$$,
   $${"jawaban":"b"}$$, 2),

  (v_kuis, 'pilihan_ganda',
   'Dalam memilih server untuk model self-host, urutan keputusan yang benar adalah…',
   $$[{"id":"a","teks":"Pilih server paling mahal, model menyesuaikan"},{"id":"b","teks":"Pilih model dulu, lalu pilih mesin yang sanggup menjalankannya"},{"id":"c","teks":"Pilih GPU dulu, model belakangan"},{"id":"d","teks":"Ikuti rekomendasi penyedia cloud saja"}]$$,
   $${"jawaban":"b"}$$, 3),

  (v_kuis, 'pilihan_ganda',
   'Apa perbedaan health check yang jujur dengan yang palsu?',
   $$[{"id":"a","teks":"Yang jujur mengembalikan 200, yang palsu mengembalikan 500"},{"id":"b","teks":"Yang jujur memeriksa model, database, dan disk benar-benar siap melayani; yang palsu hanya mengecek proses hidup"},{"id":"c","teks":"Tidak ada beda, keduanya sama"},{"id":"d","teks":"Yang jujur lebih cepat"}]$$,
   $${"jawaban":"b"}$$, 4),

  (v_kuis, 'pilihan_ganda',
   'Mengapa eval set yang baik wajib memuat kasus yang harus ditolak?',
   $$[{"id":"a","teks":"Supaya jumlahnya genap"},{"id":"b","teks":"Karena kalau tidak, angka evaluasi tampak bagus sementara agent tetap mau diajak melakukan hal berbahaya"},{"id":"c","teks":"Karena penilai model menolak kasus seperti itu"},{"id":"d","teks":"Supaya latency terukur"}]$$,
   $${"jawaban":"b"}$$, 5);


  -- ────────────────────────────────────────────────────────────
  -- Modul 4: Konteks & kemampuan (berbayar)
  -- ────────────────────────────────────────────────────────────
  select id into v_modul from modules where course_id = v_course and slug = 'konteks';

  insert into quizzes (module_id, judul, nilai_lulus)
  values (v_modul, 'Kuis Modul 4 — Konteks & Kemampuan', 70)
  on conflict do nothing
  returning id into v_kuis;

  if v_kuis is null then
    select id into v_kuis from quizzes where module_id = v_modul limit 1;
  end if;

  delete from questions where quiz_id = v_kuis;

  insert into questions (quiz_id, tipe, pertanyaan, opsi, kunci, urutan) values
  (v_kuis, 'pilihan_ganda',
   'Untuk dokumen formal berbahasa Indonesia yang terstruktur, strategi pemotongan mana yang biasanya paling baik?',
   $$[{"id":"a","teks":"Potong per 500 karakter tanpa mempedulikan struktur"},{"id":"b","teks":"Potong mengikuti struktur pasal atau ayat"},{"id":"c","teks":"Potong per kalimat saja"},{"id":"d","teks":"Jangan dipotong, kirim utuh"}]$$,
   $${"jawaban":"b"}$$, 1),

  (v_kuis, 'pilihan_ganda',
   'Skor kemiripan tertinggi 0,82 dari pencarian vektor. Apa artinya yang benar?',
   $$[{"id":"a","teks":"Model 82% yakin jawabannya benar"},{"id":"b","teks":"Dua vektor itu berdekatan di ruang vektor; bukan ukuran keyakinan"},{"id":"c","teks":"82% dokumen relevan"},{"id":"d","teks":"Jawabannya pasti ada di potongan itu"}]$$,
   $${"jawaban":"b"}$$, 2),

  (v_kuis, 'pilihan_ganda',
   'Kapan menulis fungsi tool sendiri lebih masuk akal daripada memakai server MCP?',
   $$[{"id":"a","teks":"Selalu, MCP tidak ada gunanya"},{"id":"b","teks":"Kalau jumlah tool sedikit dan tidak perlu dibagikan ke klien lain"},{"id":"c","teks":"Kalau modelnya kecil"},{"id":"d","teks":"Kalau memakai Ollama"}]$$,
   $${"jawaban":"b"}$$, 3),

  (v_kuis, 'pilihan_ganda',
   'Kapan indeks HNSW pada kolom vektor sebaiknya dipasang?',
   $$[{"id":"a","teks":"Sejak awal, selalu"},{"id":"b","teks":"Setelah tabelnya lebih dari sekitar sepuluh ribu baris dan pencarian mulai terasa lambat"},{"id":"c","teks":"Hanya kalau memakai Qdrant"},{"id":"d","teks":"Tidak pernah, indeks selalu memperlambat"}]$$,
   $${"jawaban":"b"}$$, 4);


  raise notice 'Bank soal siap: 5 kuis, 24 soal';
end $banksoal$;

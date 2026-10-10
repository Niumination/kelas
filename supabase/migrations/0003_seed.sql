-- ══════════════════════════════════════════════════════════════
-- Seed: menyamakan database dengan direktori content/
--
-- Penting: isi materi hidup di content/ (berkas .mdx).
-- Yang disimpan di sini hanyalah metadata kurikulum — supaya
-- progres, kuis, dan sertifikat bisa merujuk pelajaran yang sama.
--
-- Jalankan setelah 0001_init.sql dan 0002_rls.sql.
-- ══════════════════════════════════════════════════════════════

do $$
declare
  v_course  uuid;
  v_modul   uuid;
begin
  -- ── Kelas ───────────────────────────────────────────────────
  insert into courses (slug, judul, tagline, deskripsi, status, harga, estimasi_jam)
  values (
    'ai-agent-self-host',
    'AI Agent Self-Host',
    'Bangun asisten AI yang jalan di mesinmu sendiri — dari `ollama run` sampai siap produksi.',
    'Kelas berbahasa Indonesia tentang membangun sistem AI agent yang berjalan di mesin sendiri: Ollama, tool calling, multi-agent, memory, guardrails, dan deploy produksi.',
    'pra-rilis',
    99000,
    15
  )
  on conflict (slug) do update
    set judul = excluded.judul,
        tagline = excluded.tagline,
        deskripsi = excluded.deskripsi,
        status = excluded.status,
        harga = excluded.harga,
        estimasi_jam = excluded.estimasi_jam
  returning id into v_course;

  -- ── Modul 1: Fondasi (gratis) ──────────────────────────────
  insert into modules (course_id, slug, judul, urutan, ringkasan, akses)
  values (v_course, 'fondasi', 'Fondasi: model lokal di mesinmu', 1,
          'Kapan self-host masuk akal, dan cara mengukur kemampuan mesinmu sendiri.', 'gratis')
  on conflict (course_id, slug) do update set judul = excluded.judul, urutan = excluded.urutan
  returning id into v_modul;

  insert into lessons (module_id, slug, judul, jalur, menit, urutan, akses) values
    (v_modul, 'kenapa-self-host', 'Kenapa harus self-host?', 'fondasi/kenapa-self-host', 18, 1, 'gratis'),
    (v_modul, 'ollama-101', 'Ollama 101 — pasang, pilih model, ukur', 'fondasi/ollama-101', 32, 2, 'gratis')
  on conflict (module_id, slug) do update
    set judul = excluded.judul, jalur = excluded.jalur, menit = excluded.menit, urutan = excluded.urutan;

  -- ── Modul 2: Agent pertama (gratis) ────────────────────────
  insert into modules (course_id, slug, judul, urutan, ringkasan, akses)
  values (v_course, 'agent-pertama', 'Agent pertama: dari menjawab jadi bertindak', 2,
          'Tool calling, loop agent, dan keamanan kunci API.', 'gratis')
  on conflict (course_id, slug) do update set judul = excluded.judul, urutan = excluded.urutan
  returning id into v_modul;

  insert into lessons (module_id, slug, judul, jalur, menit, urutan, akses) values
    (v_modul, 'tool-calling', 'Agent pertama — tool calling', 'agent-pertama/tool-calling', 35, 1, 'gratis'),
    (v_modul, 'byok-keamanan', 'BYOK & keamanan kunci', 'agent-pertama/byok-keamanan', 22, 2, 'gratis')
  on conflict (module_id, slug) do update
    set judul = excluded.judul, jalur = excluded.jalur, menit = excluded.menit, urutan = excluded.urutan;

  -- ── Modul 3: Orkestrasi (berbayar) ─────────────────────────
  insert into modules (course_id, slug, judul, urutan, ringkasan, akses)
  values (v_course, 'orkestrasi', 'Orkestrasi multi-agent', 3,
          'Anatomi agent dan pola supervisor/worker.', 'berbayar')
  on conflict (course_id, slug) do update set judul = excluded.judul, urutan = excluded.urutan
  returning id into v_modul;

  insert into lessons (module_id, slug, judul, jalur, menit, urutan, akses) values
    (v_modul, 'anatomi-agent', 'Anatomi agent — observer, planner, executor, verifier', 'orkestrasi/anatomi-agent', 28, 1, 'berbayar'),
    (v_modul, 'multi-agent', 'Multi-agent orchestration & serah tugas', 'orkestrasi/multi-agent', 30, 2, 'berbayar')
  on conflict (module_id, slug) do update
    set judul = excluded.judul, jalur = excluded.jalur, menit = excluded.menit, urutan = excluded.urutan;

  -- ── Modul 4: Konteks & kemampuan (berbayar) ────────────────
  insert into modules (course_id, slug, judul, urutan, ringkasan, akses)
  values (v_course, 'konteks', 'Konteks & kemampuan: ingatan dan peralatan', 4,
          'Memory & retrieval, serta cara merancang lapisan tool yang bisa ditambah.', 'berbayar')
  on conflict (course_id, slug) do update set judul = excluded.judul, urutan = excluded.urutan
  returning id into v_modul;

  insert into lessons (module_id, slug, judul, jalur, menit, urutan, akses) values
    (v_modul, 'memory-retrieval', 'Memory & retrieval — pgvector, Qdrant, dan cara memotong dokumen', 'konteks/memory-retrieval', 30, 1, 'berbayar'),
    (v_modul, 'tool-ecosystem', 'Tool ecosystem & MCP — menambah kemampuan tanpa menulis ulang', 'konteks/tool-ecosystem', 26, 2, 'berbayar')
  on conflict (module_id, slug) do update
    set judul = excluded.judul, jalur = excluded.jalur, menit = excluded.menit, urutan = excluded.urutan;

  -- ── Modul 5: Produksi (berbayar) ───────────────────────────
  insert into modules (course_id, slug, judul, urutan, ringkasan, akses)
  values (v_course, 'produksi', 'Produksi: aman, terpantau, dan tidak boros', 5,
          'Guardrails, evaluasi, observability, dan deploy dengan hitungan biaya nyata.', 'berbayar')
  on conflict (course_id, slug) do update set judul = excluded.judul, urutan = excluded.urutan
  returning id into v_modul;

  insert into lessons (module_id, slug, judul, jalur, menit, urutan, akses) values
    (v_modul, 'guardrails', 'Guardrails — izin, batas, dan jejak audit', 'produksi/guardrails', 32, 1, 'berbayar'),
    (v_modul, 'deploy-produksi', 'Deploy produksi — hidup, terpantau, dan tidak boros', 'produksi/deploy-produksi', 30, 2, 'berbayar'),
    (v_modul, 'observability-evaluasi', 'Observability & evaluasi — membuktikan agent tidak memburuk', 'produksi/observability-evaluasi', 32, 3, 'berbayar')
  on conflict (module_id, slug) do update
    set judul = excluded.judul, jalur = excluded.jalur, menit = excluded.menit, urutan = excluded.urutan;

  -- ── Modul 6: Proyek akhir (berbayar) ───────────────────────
  insert into modules (course_id, slug, judul, urutan, ringkasan, akses)
  values (v_course, 'proyek-akhir', 'Proyek akhir', 6,
          'Satu sistem utuh yang berjalan, punya batas, dan ada jejaknya.', 'berbayar')
  on conflict (course_id, slug) do update set judul = excluded.judul, urutan = excluded.urutan
  returning id into v_modul;

  insert into lessons (module_id, slug, judul, jalur, menit, urutan, akses) values
    (v_modul, 'proyek-akhir', 'Proyek akhir — satu sistem utuh', 'proyek-akhir/proyek-akhir', 600, 1, 'berbayar')
  on conflict (module_id, slug) do update
    set judul = excluded.judul, jalur = excluded.jalur, menit = excluded.menit, urutan = excluded.urutan;

  raise notice 'Seed selesai untuk kelas ai-agent-self-host';
end $$;

-- ══════════════════════════════════════════════════════════════
-- Kuis: bank soal + penilaian SISI SERVER
--
-- Aturan yang tidak bisa ditawar:
--   • kunci jawaban TIDAK PERNAH dikirim ke browser
--   • penilaian dilakukan di database, bukan di JavaScript klien
--   • kuis berbayar hanya bisa diikuti kalau punya enrollment aktif
-- ══════════════════════════════════════════════════════════════

-- Tabel `questions` berisi kolom `kunci`. Cabut akses baca langsung
-- dari anon/authenticated, lalu ganti dengan view yang membuang kolom itu.
do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname='public' and tablename='questions' loop
    execute format('drop policy if exists %I on public.questions', r.policyname);
  end loop;
end $$;

-- Peran `anon` dan `authenticated` ada di Supabase. Kalau migrasi dijalankan
-- di Postgres biasa, bagian ini dilewati — view tetap dibuat, jadi aplikasi
-- tidak rusak; hanya lapis pembatas perannya yang perlu dipasang manual.
do $$ begin
  revoke select on public.questions from anon, authenticated;
exception when undefined_object then null;
end $$;

create or replace view public.questions_publik as
  select id, quiz_id, tipe, pertanyaan, opsi, urutan
  from public.questions;

do $$ begin
  grant select on public.questions_publik to anon, authenticated;
exception when undefined_object then null;
end $$;

-- ── Mengambil soal untuk sebuah modul ─────────────────────────
create or replace function public.kuis_modul(p_slug text, p_modul text)
returns table (
  quiz_id     uuid,
  judul       text,
  nilai_lulus integer,
  id          uuid,
  tipe        text,
  pertanyaan  text,
  opsi        jsonb,
  urutan      integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_aktif boolean;
begin
  if auth.uid() is null then
    raise exception 'Masuk dulu untuk mengikuti kuis';
  end if;

  -- Modul berbayar butuh enrollment; modul gratis tidak.
  select case
           when m.akses = 'berbayar' then public.punya_akses_materi(p_slug)
           else true
         end
    into v_aktif
  from modules m
  join courses c on c.id = m.course_id
  where c.slug = p_slug and m.slug = p_modul;

  if not found then
    raise exception 'Modul tidak ditemukan: %', p_modul;
  end if;

  if not v_aktif then
    raise exception 'Kamu belum memiliki akses ke modul ini';
  end if;

  return query
    select q.id, q.judul, q.nilai_lulus,
           s.id, s.tipe, s.pertanyaan, s.opsi, s.urutan
    from quizzes q
    join modules m on m.id = q.module_id
    join courses c on c.id = m.course_id
    join questions s on s.quiz_id = q.id
    where c.slug = p_slug and m.slug = p_modul
    order by s.urutan;
end;
$$;

-- ── Menilai jawaban (server-side) ────────────────────────────
/**
 * p_jawaban: {"<question_id>": "<opsi_id>", ...}
 * Mengembalikan nilai, status lulus, jumlah benar, total soal,
 * dan nomor percobaan ke berapa.
 */
create or replace function public.nilai_kuis(p_quiz_id uuid, p_jawaban jsonb)
returns table (nilai integer, lulus boolean, benar integer, total integer, percobaan integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total   integer;
  v_benar   integer;
  v_nilai   integer;
  lulus_min integer;
  v_modul   modules;
  v_kursus  courses;
  v_aktif   boolean;
  v_percobaan integer;
  v_semua   boolean;
begin
  if auth.uid() is null then
    raise exception 'Masuk dulu untuk mengikuti kuis';
  end if;

  -- Dua query terpisah: PL/pgSQL tidak mengizinkan variabel record
  -- di dalam daftar INTO yang lebih dari satu item.
  select m.* into v_modul
  from quizzes q
  join modules m on m.id = q.module_id
  where q.id = p_quiz_id;

  if v_modul.id is null then
    raise exception 'Kuis tidak ditemukan';
  end if;

  select c.* into v_kursus
  from courses c
  where c.id = v_modul.course_id;

  v_aktif := case
    when v_modul.akses = 'berbayar' then public.punya_akses_materi(v_kursus.slug)
    else true
  end;
  if not v_aktif then
    raise exception 'Kamu belum memiliki akses ke kuis ini';
  end if;

  -- Jawaban peserta tidak pernah dibandingkan dengan `kunci` di klien:
  -- seluruh perbandingan terjadi di sini, di dalam database.
  select count(*)::int,
         count(*) filter (
           where s.kunci->>'jawaban' = p_jawaban->>s.id::text
         )::int
    into v_total, v_benar
  from questions s
  where s.quiz_id = p_quiz_id;

  if v_total = 0 then
    raise exception 'Kuis ini belum punya soal';
  end if;

  v_nilai := round((v_benar::numeric / v_total) * 100)::int;

  select q.nilai_lulus into lulus_min from quizzes q where q.id = p_quiz_id;

  insert into quiz_attempts (user_id, quiz_id, jawaban, nilai, lulus)
  values (auth.uid(), p_quiz_id, p_jawaban, v_nilai, v_nilai >= lulus_min);

  select count(*)::int into v_percobaan
  from quiz_attempts
  where user_id = auth.uid() and quiz_id = p_quiz_id;

  -- Tandai modul ini tuntas kalau semua pelajarannya sudah selesai
  -- dan kuisnya lulus — dipakai sebagai syarat sertifikat.
  select (count(*) = count(*) filter (where lp.id is not null)) into v_semua
  from lessons l
  left join lesson_progress lp
    on lp.lesson_id = l.id and lp.user_id = auth.uid() and lp.selesai = true
  where l.module_id = v_modul.id;

  if v_semua and v_nilai >= lulus_min then
    insert into events (user_id, nama, properti)
    values (auth.uid(), 'modul_tuntas',
            jsonb_build_object('slug', v_kursus.slug, 'modul', v_modul.slug));
  end if;

  return query
    select v_nilai, v_nilai >= lulus_min, v_benar, v_total, v_percobaan;
end;
$$;

-- ── Rekap nilai per kelas ────────────────────────────────────
create or replace function public.rekap_kuis(p_slug text)
returns table (
  modul      text,
  judul_kuis text,
  nilai_terbaik integer,
  lulus      boolean,
  percobaan  integer
)
language sql
stable
security definer
set search_path = public
as $$
  select m.slug,
         q.judul,
         max(a.nilai)::int,
         bool_or(a.lulus),
         count(a.id)::int
  from courses c
  join modules m on m.course_id = c.id
  join quizzes q on q.module_id = m.id
  left join quiz_attempts a on a.quiz_id = q.id and a.user_id = auth.uid()
  where c.slug = p_slug
  group by m.slug, m.urutan, q.judul, q.id
  order by m.urutan;
$$;

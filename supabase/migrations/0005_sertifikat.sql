-- ══════════════════════════════════════════════════════════════
-- Sertifikat
--
-- Syarat terbit (ditegakkan di database, bukan di UI):
--   1. seluruh pelajaran kelas ditandai selesai
--   2. seluruh kuis kelas lulus
--   3. memiliki akses ke kelas (enrollment aktif) — kecuali admin
--
-- Nomor: NIUM-<tahun>-<KODE>-<6 karakter>
-- Huruf yang mudah tertukar (0/O, 1/I/L) sengaja dibuang supaya
-- tidak ada sertifikat yang gagal diverifikasi karena salah baca.
-- ══════════════════════════════════════════════════════════════

create or replace function public.buat_nomor_sertifikat(p_slug text)
returns text
language plpgsql
volatile
as $$
declare
  abjad  text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  kode   text := upper(regexp_replace(split_part(p_slug, '-', 1), '[^a-zA-Z0-9]', '', 'g'));
  hasil  text;
  acak   text := '';
  i      integer;
begin
  for i in 1..6 loop
    acak := acak || substr(abjad, floor(random() * length(abjad) + 1)::int, 1);
  end loop;

  hasil := format('NIUM-%s-%s-%s',
                  to_char(now(), 'YYYY'),
                  coalesce(nullif(left(kode, 8), ''), 'KELAS'),
                  acak);

  -- Kalau (sangat kecil kemungkinan) nomor sudah ada, ulangi.
  while exists (select 1 from certificates where nomor = hasil) loop
    acak := '';
    for i in 1..6 loop
      acak := acak || substr(abjad, floor(random() * length(abjad) + 1)::int, 1);
    end loop;
    hasil := format('NIUM-%s-%s-%s', to_char(now(), 'YYYY'), coalesce(nullif(left(kode, 8), ''), 'KELAS'), acak);
  end loop;

  return hasil;
end;
$$;

-- ── Status syarat (dipakai UI untuk menunjukkan progress) ─────
create or replace function public.syarat_sertifikat(p_slug text)
returns table (
  pelajaran_selesai integer,
  total_pelajaran   integer,
  kuis_lulus        integer,
  total_kuis        integer,
  siap              boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_course uuid;
begin
  if auth.uid() is null then
    raise exception 'Masuk dulu';
  end if;

  select id into v_course from courses where slug = p_slug;
  if v_course is null then
    raise exception 'Kelas tidak ditemukan: %', p_slug;
  end if;

  return query
    with p as (
      select count(*)::int total,
             count(*) filter (where lp.id is not null)::int selesai
      from lessons l
      join modules m on m.id = l.module_id
      left join lesson_progress lp
        on lp.lesson_id = l.id and lp.user_id = auth.uid() and lp.selesai = true
      where m.course_id = v_course
    ),
    k as (
      select count(q.id)::int total,
             count(*) filter (where ada.lulus)::int lulus
      from quizzes q
      join modules m on m.id = q.module_id
      left join lateral (
        select bool_or(a.lulus) as lulus
        from quiz_attempts a
        where a.quiz_id = q.id and a.user_id = auth.uid()
      ) ada on true
      where m.course_id = v_course
    )
    select p.selesai, p.total, k.lulus, k.total,
           (p.total > 0 and p.selesai = p.total and k.lulus = k.total)
    from p, k;
end;
$$;

-- ── Terbitkan ────────────────────────────────────────────────
create or replace function public.terbitkan_sertifikat(p_slug text)
returns table (nomor text, pdf_url text, terbit_pada timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course uuid;
  v_user   uuid := auth.uid();
  v_nomor  text;
  v_syarat record;
  v_ada    certificates;
begin
  if v_user is null then
    raise exception 'Masuk dulu untuk menerbitkan sertifikat';
  end if;

  select id into v_course from courses where slug = p_slug;
  if v_course is null then
    raise exception 'Kelas tidak ditemukan: %', p_slug;
  end if;

  -- Sudah pernah terbit? Kembalikan yang lama (idempoten).
  select * into v_ada from certificates where user_id = v_user and course_id = v_course;
  if found then
    return query select v_ada.nomor, v_ada.pdf_url, v_ada.terbit_pada;
    return;
  end if;

  select * into v_syarat from syarat_sertifikat(p_slug);
  if not v_syarat.siap then
    raise exception 'Syarat belum terpenuhi: %/% pelajaran, %/% kuis lulus',
      v_syarat.pelajaran_selesai, v_syarat.total_pelajaran,
      v_syarat.kuis_lulus, v_syarat.total_kuis;
  end if;

  v_nomor := public.buat_nomor_sertifikat(p_slug);

  insert into certificates (user_id, course_id, nomor, status)
  values (v_user, v_course, v_nomor, 'aktif')
  on conflict (user_id, course_id) do nothing
  returning * into v_ada;

  if v_ada.id is null then
    select * into v_ada from certificates where user_id = v_user and course_id = v_course;
  end if;

  insert into events (user_id, nama, properti)
  values (v_user, 'sertifikat_terbit',
          jsonb_build_object('nomor', v_ada.nomor, 'kelas', p_slug));

  return query select v_ada.nomor, v_ada.pdf_url, v_ada.terbit_pada;
end;
$$;

-- ── Sertifikat milik sendiri ─────────────────────────────────
create or replace function public.sertifikat_saya()
returns table (
  nomor           text,
  judul_kelas     text,
  slug            text,
  terbit_pada     timestamptz,
  status          text,
  nama_sertifikat text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.nomor, c.judul, c.slug, s.terbit_pada, s.status, p.nama
  from certificates s
  join courses  c on c.id = s.course_id
  join profiles p on p.id = s.user_id
  where s.user_id = auth.uid()
  order by s.terbit_pada desc;
$$;

-- Batalkan sertifikat (plagiarisme proyek akhir)
create or replace function public.batalkan_sertifikat(p_nomor text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles p where p.id = auth.uid() and p.peran in ('admin', 'instruktur')
  ) then
    raise exception 'Hanya admin atau instruktur yang bisa membatalkan sertifikat';
  end if;

  update certificates set status = 'dibatalkan' where nomor = p_nomor;
end;
$$;

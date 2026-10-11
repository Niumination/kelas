-- 0007_progres_modul.sql
-- Catat modul tuntas tanpa bergantung pada urutan menyelesaikan kuis/pelajaran.
-- Migrasi baru karena 0002/0004 sudah pernah diterapkan di Supabase produksi.

-- Hapus event modul_tuntas lama yang terduplikasi sebelum menegakkan keunikan.
with duplikat as (
  select id,
         row_number() over (
           partition by user_id, properti->>'slug', properti->>'modul'
           order by dibuat_pada, id
         ) as nomor
  from public.events
  where nama = 'modul_tuntas' and user_id is not null
)
delete from public.events e
using duplikat d
where e.id = d.id and d.nomor > 1;

-- Satu event per pengguna, kelas, dan modul.
create unique index if not exists uq_events_modul_tuntas
  on public.events (user_id, (properti->>'slug'), (properti->>'modul'))
  where nama = 'modul_tuntas' and user_id is not null;

-- Satu-satunya tempat yang menentukan syarat modul tuntas.
-- Fungsi internal ini hanya dipanggil oleh RPC SECURITY DEFINER di bawah.
create or replace function public.catat_modul_tuntas(p_module_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_slug_kelas text;
  v_slug_modul text;
  v_semua_pelajaran boolean;
begin
  if v_user is null then
    return;
  end if;

  select c.slug, m.slug
    into v_slug_kelas, v_slug_modul
  from modules m
  join courses c on c.id = m.course_id
  where m.id = p_module_id;

  if v_slug_kelas is null or v_slug_modul is null then
    return;
  end if;

  select count(l.id) > 0 and count(l.id) = count(lp.id)
    into v_semua_pelajaran
  from lessons l
  left join lesson_progress lp
    on lp.lesson_id = l.id
   and lp.user_id = v_user
   and lp.selesai = true
  where l.module_id = p_module_id;

  if not coalesce(v_semua_pelajaran, false) then
    return;
  end if;

  if not exists (
    select 1
    from quizzes q
    join quiz_attempts qa on qa.quiz_id = q.id
    where q.module_id = p_module_id
      and qa.user_id = v_user
      and qa.lulus = true
  ) then
    return;
  end if;

  insert into events (user_id, nama, properti)
  values (
    v_user,
    'modul_tuntas',
    jsonb_build_object('slug', v_slug_kelas, 'modul', v_slug_modul)
  )
  on conflict do nothing;
end;
$$;

revoke all on function public.catat_modul_tuntas(uuid) from public;
revoke all on function public.catat_modul_tuntas(uuid) from anon, authenticated;

-- Migrasikan kondisi yang sudah lengkap sebelum fungsi baru dipasang.
insert into public.events (user_id, nama, properti)
select distinct
       qa.user_id,
       'modul_tuntas',
       jsonb_build_object('slug', c.slug, 'modul', m.slug)
from public.quiz_attempts qa
join public.quizzes q on q.id = qa.quiz_id
join public.modules m on m.id = q.module_id
join public.courses c on c.id = m.course_id
where qa.lulus = true
  and exists (select 1 from public.lessons l where l.module_id = m.id)
  and not exists (
    select 1
    from public.lessons l
    where l.module_id = m.id
      and not exists (
        select 1
        from public.lesson_progress lp
        where lp.lesson_id = l.id
          and lp.user_id = qa.user_id
          and lp.selesai = true
      )
  )
on conflict do nothing;

-- Menandai pelajaran terakhir juga menyelesaikan modul jika kuisnya
-- sebelumnya sudah pernah lulus.
create or replace function public.tandai_selesai(p_slug text, p_jalur text, p_selesai boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson uuid;
  v_module uuid;
  v_boleh boolean;
begin
  if auth.uid() is null then
    raise exception 'Belum masuk';
  end if;

  select l.id,
         m.id,
         (l.akses = 'gratis' or public.punya_akses_materi(p_slug))
    into v_lesson, v_module, v_boleh
  from lessons l
  join modules m on m.id = l.module_id
  join courses c on c.id = m.course_id
  where c.slug = p_slug and l.jalur = p_jalur;

  if v_lesson is null then
    raise exception 'Pelajaran tidak ditemukan: %', p_jalur;
  end if;

  -- Materi berbayar yang belum dimiliki tidak bisa ditandai selesai.
  if not v_boleh then
    raise exception 'Tidak punya akses ke materi ini';
  end if;

  if p_selesai then
    insert into lesson_progress (user_id, lesson_id, selesai, selesai_pada)
    values (auth.uid(), v_lesson, true, now())
    on conflict (user_id, lesson_id)
      do update set selesai = true, selesai_pada = now();

    perform public.catat_modul_tuntas(v_module);
  else
    delete from lesson_progress
    where user_id = auth.uid() and lesson_id = v_lesson;
  end if;
end;
$$;

-- Lulus kuis menyelesaikan modul jika seluruh pelajaran sudah ditandai,
-- termasuk ketika peserta menyelesaikan materi terlebih dahulu.
create or replace function public.nilai_kuis(p_quiz_id uuid, p_jawaban jsonb)
returns table (nilai integer, lulus boolean, benar integer, total integer, percobaan integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_benar integer;
  v_nilai integer;
  lulus_min integer;
  v_modul modules;
  v_kursus courses;
  v_aktif boolean;
  v_percobaan integer;
begin
  if auth.uid() is null then
    raise exception 'Masuk dulu untuk mengikuti kuis';
  end if;

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

  -- Jawaban peserta tidak pernah dibandingkan dengan kunci di klien.
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

  perform public.catat_modul_tuntas(v_modul.id);

  return query
    select v_nilai, v_nilai >= lulus_min, v_benar, v_total, v_percobaan;
end;
$$;

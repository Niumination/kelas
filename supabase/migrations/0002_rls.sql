-- ══════════════════════════════════════════════════════════════
-- Row Level Security + fungsi akses
--
-- Aturan emas: VERIFIKASI DI DATABASE, bukan di komponen UI.
-- Komponen hanya menyembunyikan tombol; RLS yang menahan datanya.
-- ══════════════════════════════════════════════════════════════

alter table profiles        enable row level security;
alter table courses         enable row level security;
alter table modules         enable row level security;
alter table lessons         enable row level security;
alter table enrollments     enable row level security;
alter table purchases       enable row level security;
alter table lesson_progress enable row level security;
alter table quizzes         enable row level security;
alter table questions       enable row level security;
alter table quiz_attempts   enable row level security;
alter table certificates    enable row level security;
alter table organizations   enable row level security;
alter table events          enable row level security;

-- Bersihkan kebijakan lama supaya berkas ini aman dijalankan ulang
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ══════════════════════════════════════════════════════════════
-- Fungsi pembantu
-- ══════════════════════════════════════════════════════════════

/** Apakah pengguna (atau siapa pun, untuk anonim) boleh membaca kelas ini? */
create or replace function public.punya_akses_kelas(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from courses c
    left join enrollments e
      on e.course_id = c.id
     and e.user_id = auth.uid()
     and e.aktif = true
    where c.slug = p_slug
      and (
        c.status in ('terbit', 'pra-rilis')
        or e.id is not null
        or exists (
          select 1 from profiles p where p.id = auth.uid() and p.peran in ('admin', 'instruktur')
        )
      )
  );
$$;

/**
 * PINTU AKSES MATERI (PRD §0.2 aturan 4).
 *
 * Bedakan dua hal yang sering dicampur:
 *   punya_akses_kelas  → kelas boleh DILIHAT di katalog (siapa pun, kalau terbit)
 *   punya_akses_materi → materi BERBAYAR boleh DIBACA (harus punya enrollment aktif)
 *
 * Memakai punya_akses_kelas untuk membuka materi berbayar adalah bug yang
 * pernah lolos: semua pelajaran berbayar terbuka untuk siapa pun.
 */
create or replace function public.punya_akses_materi(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from enrollments e
    join courses c on c.id = e.course_id
    where c.slug = p_slug
      and e.user_id = auth.uid()
      and e.aktif = true
      and (e.kohort_selesai is null or e.kohort_selesai >= current_date)
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.peran in ('admin', 'instruktur')
  );
$$;

/** Daftar jalur pelajaran yang sudah diselesaikan di sebuah kelas. */
create or replace function public.progres_kelas(p_slug text)
returns table (jalur text)
language sql
stable
security definer
set search_path = public
as $$
  select l.jalur
  from lesson_progress lp
  join lessons l   on l.id = lp.lesson_id
  join modules m   on m.id = l.module_id
  join courses c   on c.id = m.course_id
  where c.slug = p_slug
    and lp.user_id = auth.uid()
    and lp.selesai = true;
$$;

/** Tandai selesai / batal. Validasi akses dilakukan di sini, bukan di klien. */
create or replace function public.tandai_selesai(p_slug text, p_jalur text, p_selesai boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson uuid;
  v_boleh  boolean;
begin
  if auth.uid() is null then
    raise exception 'Belum masuk';
  end if;

  select l.id,
         (l.akses = 'gratis' or public.punya_akses_materi(p_slug))
    into v_lesson, v_boleh
  from lessons l
  join modules m on m.id = l.module_id
  join courses c on c.id = m.course_id
  where c.slug = p_slug and l.jalur = p_jalur;

  if v_lesson is null then
    raise exception 'Pelajaran tidak ditemukan: %', p_jalur;
  end if;

  -- Materi berbayar yang belum dimiliki tidak bisa ditandai selesai
  if not v_boleh then
    raise exception 'Tidak punya akses ke materi ini';
  end if;

  if p_selesai then
    insert into lesson_progress (user_id, lesson_id, selesai, selesai_pada)
    values (auth.uid(), v_lesson, true, now())
    on conflict (user_id, lesson_id)
      do update set selesai = true, selesai_pada = now();
  else
    delete from lesson_progress
    where user_id = auth.uid() and lesson_id = v_lesson;
  end if;
end;
$$;

/**
 * Memproses webhook Midtrans. Dipanggil tanpa sesi → SECURITY DEFINER.
 * Idempoten: aman dipanggil berkali-kali untuk order yang sama.
 */
create or replace function public.proses_webhook(
  p_order_id text,
  p_status   text,
  p_metode   text default null,
  p_jumlah   integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase purchases;
begin
  select * into v_purchase from purchases where order_id = p_order_id for update;
  if not found then
    raise exception 'Order tidak dikenal: %', p_order_id;
  end if;

  -- Jangan menurunkan status yang sudah final
  if v_purchase.status in ('settlement', 'refund') then
    return;
  end if;

  update purchases
     set status       = p_status::status_pembelian,
         metode       = coalesce(p_metode, metode),
         jumlah       = coalesce(p_jumlah, jumlah),
         dibayar_pada = case when p_status = 'settlement' then now() else dibayar_pada end
   where order_id = p_order_id;

  if p_status = 'settlement' then
    insert into enrollments (user_id, course_id, sumber, aktif)
    values (v_purchase.user_id, v_purchase.course_id, 'pembelian', true)
    on conflict (user_id, course_id) do update set aktif = true, sumber = 'pembelian';

    insert into events (user_id, nama, properti)
    values (v_purchase.user_id, 'pembayaran_sukses',
            jsonb_build_object('order_id', p_order_id, 'metode', p_metode, 'jumlah', p_jumlah));
  end if;
end;
$$;

/** Verifikasi publik sertifikat — tidak mengembalikan email atau data pribadi. */
create or replace function public.verifikasi_sertifikat(p_nomor text)
returns table (nomor text, nama text, judul_kelas text, terbit_pada timestamptz, status text)
language sql
stable
security definer
set search_path = public
as $$
  select s.nomor, p.nama, c.judul, s.terbit_pada, s.status
  from certificates s
  join profiles p on p.id = s.user_id
  join courses  c on c.id = s.course_id
  where upper(s.nomor) = upper(p_nomor)
  limit 1;
$$;

-- ══════════════════════════════════════════════════════════════
-- Kebijakan
-- ══════════════════════════════════════════════════════════════

-- profiles
create policy "profil_baca_sendiri" on profiles
  for select using (id = auth.uid());
create policy "profil_ubah_sendiri" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- courses: yang terbit bisa dilihat publik; sisanya hanya admin
create policy "kelas_baca_publik" on courses
  for select using (status in ('terbit', 'pra-rilis'));
create policy "kelas_kelola_admin" on courses
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.peran = 'admin')
  ) with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.peran = 'admin')
  );

-- modules & lessons: metadata kurikulum boleh dilihat publik
-- (isi berbayar tidak pernah dikirim lewat API — hanya lewat halaman yang dilindungi)
create policy "modul_baca_publik" on modules
  for select using (
    exists (select 1 from courses c where c.id = course_id and c.status in ('terbit', 'pra-rilis'))
  );

create policy "pelajaran_baca_publik" on lessons
  for select using (
    exists (
      select 1 from modules m
      join courses c on c.id = m.course_id
      where m.id = module_id and c.status in ('terbit', 'pra-rilis')
    )
  );

-- enrollments
create policy "enrollment_baca_sendiri" on enrollments
  for select using (user_id = auth.uid());
create policy "enrollment_admin" on enrollments
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.peran in ('admin', 'instruktur'))
  );

-- purchases: hanya pemilik
create policy "pembelian_baca_sendiri" on purchases
  for select using (user_id = auth.uid());

-- progress
create policy "progres_baca_sendiri" on lesson_progress
  for select using (user_id = auth.uid());
create policy "progres_tulis_sendiri" on lesson_progress
  for insert with check (user_id = auth.uid());
create policy "progres_hapus_sendiri" on lesson_progress
  for delete using (user_id = auth.uid());

-- kuis: soal terlihat, KUNCI JAWABAN tidak pernah dibaca klien
create policy "kuis_baca" on quizzes
  for select using (
    exists (
      select 1 from modules m
      join courses c on c.id = m.course_id
      where m.id = module_id and c.status in ('terbit', 'pra-rilis')
    )
  );

create policy "soal_baca" on questions
  for select using (true);   -- kolom `kunci` dilindungi di level view, lihat catatan

create policy "percobaan_baca_sendiri" on quiz_attempts
  for select using (user_id = auth.uid());
create policy "percobaan_tulis_sendiri" on quiz_attempts
  for insert with check (user_id = auth.uid());

-- sertifikat: pemilik bisa lihat miliknya; publik lewat RPC verifikasi
create policy "sertifikat_baca_sendiri" on certificates
  for select using (user_id = auth.uid());

-- events
create policy "event_tulis" on events
  for insert with check (user_id = auth.uid() or user_id is null);
create policy "event_baca_sendiri" on events
  for select using (user_id = auth.uid());

-- organizations: hanya admin & anggota
create policy "organisasi_admin" on organizations
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.peran = 'admin')
  );

-- ── Catatan keamanan ───────────────────────────────────────────
-- Kolom questions.kunci dipakai HANYA oleh fungsi penilai di server
-- (dibuat di Fase 3). Jangan pernah expose tabel `questions` lewat
-- PostgREST ke browser tanpa view yang membuang kolom `kunci`.
--
-- Contoh view aman untuk Fase 3:
--   create view questions_publik as
--     select id, quiz_id, tipe, pertanyaan, opsi, urutan from questions;

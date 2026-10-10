-- ══════════════════════════════════════════════════════════════
-- Kelas Niumination — skema awal
-- Postgres (Supabase). Aman dijalankan berulang (idempoten).
--
-- Prinsip (PRD §0.2 aturan 4):
--   Hak akses SELALU ditentukan oleh `enrollments` + `purchases`.
--   Fitur baru (bundel, kohort, lisensi instansi) hanya menambah
--   JENIS enrollment, bukan mekanisme akses baru.
-- ══════════════════════════════════════════════════════════════

-- pgcrypto: ada di Supabase; kalau tidak tersedia, gen_random_uuid()
-- tetap tersedia karena sudah menjadi inti Postgres sejak versi 13.
do $$ begin
  create extension if not exists "pgcrypto";
exception when others then null;
end $$;

-- ── Tipe ──────────────────────────────────────────────────────
do $$ begin
  create type peran_pengguna as enum ('siswa', 'instruktur', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_kelas as enum ('draft', 'pra-rilis', 'terbit', 'arsip');
exception when duplicate_object then null; end $$;

do $$ begin
  create type akses_materi as enum ('gratis', 'berbayar');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sumber_enrollment as enum ('gratis', 'pembelian', 'bundel', 'kohort', 'instansi', 'hadiah');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_pembelian as enum ('pending', 'settlement', 'expire', 'cancel', 'deny', 'failure', 'refund');
exception when duplicate_object then null; end $$;

-- ── Profil ────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  nama        text,
  peran       peran_pengguna not null default 'siswa',
  dibuat_pada timestamptz not null default now()
);

-- ── Kelas ─────────────────────────────────────────────────────
create table if not exists courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  judul         text not null,
  tagline       text,
  deskripsi     text,
  status        status_kelas not null default 'draft',
  harga         integer not null default 0,
  estimasi_jam  integer,
  -- Ekspansi yang sudah diantisipasi (PRD §0.4):
  instruktur_id uuid references profiles (id),      -- multi-instruktur
  kohort        boolean not null default false,      -- kelas live/angkatan
  organization_id uuid,                              -- lisensi instansi (B2B)
  dibuat_pada   timestamptz not null default now()
);

create table if not exists modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references courses (id) on delete cascade,
  slug       text not null,
  judul      text not null,
  urutan     integer not null default 0,
  ringkasan  text,
  akses      akses_materi not null default 'gratis',
  unique (course_id, slug)
);

create table if not exists lessons (
  id         uuid primary key default gen_random_uuid(),
  module_id  uuid not null references modules (id) on delete cascade,
  slug       text not null,
  judul      text not null,
  -- jalur = "modul/pelajaran", sama dengan struktur direktori konten
  jalur      text not null,
  menit      integer not null default 10,
  urutan     integer not null default 0,
  akses      akses_materi not null default 'gratis',
  video_url  text,                                   -- opsional, kalau nanti perlu
  unique (module_id, slug)
);

-- ── Akses ─────────────────────────────────────────────────────
create table if not exists enrollments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  course_id  uuid not null references courses (id) on delete cascade,
  sumber     sumber_enrollment not null default 'gratis',
  -- Ekspansi: lisensi instansi & kohort
  organization_id uuid,
  kohort_mulai    date,
  kohort_selesai  date,
  aktif      boolean not null default true,
  dibuat_pada timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists purchases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  course_id   uuid not null references courses (id) on delete cascade,
  order_id    text unique not null,
  jumlah      integer not null,
  status      status_pembelian not null default 'pending',
  metode      text,
  dibayar_pada timestamptz,
  dibuat_pada  timestamptz not null default now()
);

-- ── Progres ───────────────────────────────────────────────────
create table if not exists lesson_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  lesson_id   uuid not null references lessons (id) on delete cascade,
  selesai     boolean not null default true,
  selesai_pada timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ── Kuis (Fase 3) ─────────────────────────────────────────────
create table if not exists quizzes (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references modules (id) on delete cascade,
  judul       text not null,
  nilai_lulus integer not null default 70
);

create table if not exists questions (
  id        uuid primary key default gen_random_uuid(),
  quiz_id   uuid not null references quizzes (id) on delete cascade,
  tipe      text not null default 'pilihan_ganda',
  pertanyaan text not null,
  opsi      jsonb not null default '[]'::jsonb,
  kunci     jsonb not null default '{}'::jsonb,   -- jangan pernah kirim ke browser
  urutan    integer not null default 0
);

create table if not exists quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  quiz_id    uuid not null references quizzes (id) on delete cascade,
  jawaban    jsonb not null default '{}'::jsonb,
  nilai      integer not null,
  lulus      boolean not null default false,
  dicoba_pada timestamptz not null default now()
);

-- ── Sertifikat ────────────────────────────────────────────────
create table if not exists certificates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  course_id   uuid not null references courses (id) on delete cascade,
  nomor       text unique not null,
  pdf_url     text,
  status      text not null default 'aktif',
  terbit_pada timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ── Organisasi (jalur instansi, diaktifkan di minggu 11–12) ───
create table if not exists organizations (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  jenis      text not null default 'instansi',
  kontak     text,
  dibuat_pada timestamptz not null default now()
);

alter table courses
  drop constraint if exists courses_organization_id_fkey;
alter table courses
  add constraint courses_organization_id_fkey
  foreign key (organization_id) references organizations (id);

alter table enrollments
  drop constraint if exists enrollments_organization_id_fkey;
alter table enrollments
  add constraint enrollments_organization_id_fkey
  foreign key (organization_id) references organizations (id);

-- ── Analytics funnel ──────────────────────────────────────────
create table if not exists events (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references profiles (id) on delete set null,
  nama     text not null,
  properti jsonb not null default '{}'::jsonb,
  dibuat_pada timestamptz not null default now()
);

create index if not exists idx_lessons_course on lessons (module_id);
create index if not exists idx_progress_user on lesson_progress (user_id);
create index if not exists idx_purchases_order on purchases (order_id);
create index if not exists idx_events_nama on events (nama, dibuat_pada desc);

-- ── Profil otomatis saat pengguna mendaftar ───────────────────
create or replace function public.buat_profil_baru()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nama)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_profil_baru on auth.users;
create trigger trg_profil_baru
  after insert on auth.users
  for each row execute function public.buat_profil_baru();

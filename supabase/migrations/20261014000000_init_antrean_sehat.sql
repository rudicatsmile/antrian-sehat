-- ============================================================
-- ANTREAN SEHAT - RSUD SEJAHTERA SEHAT
-- MIGRATION: 20261014000000_init_antrean_sehat.sql
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
create type user_role as enum ('pasien', 'petugas', 'admin');
create type unit_kind as enum ('pendaftaran', 'poliklinik', 'triase', 'laboratorium', 'radiologi', 'farmasi', 'kasir', 'rawat_inap');
create type triage_level as enum ('merah', 'kuning', 'hijau');
create type priority_category as enum ('normal', 'lansia', 'disabilitas', 'ibu_hamil', 'emergency');
create type ticket_status as enum ('menunggu', 'dipanggil', 'dilayani', 'selesai', 'dilewati', 'batal');
create type session_slot as enum ('pagi', 'siang', 'sore');
create type payment_status as enum ('belum_bayar', 'pending', 'settlement', 'expire', 'cancel', 'deny', 'failure', 'refund');
create type inpatient_status as enum ('menunggu_kamar', 'dirawat', 'pre_op', 'dibatalkan', 'selesai');
create type display_mode as enum ('antrean', 'info', 'bergantian');

-- ============================================================
-- 1. LOKASI, GEDUNG, DAN UNIT
-- ============================================================
create table buildings (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kode text not null unique,
  alamat text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete restrict,
  kind unit_kind not null,
  kode text not null unique,
  nama text not null,
  slug text not null unique,
  lantai text,
  default_service_minutes int not null default 10 check (default_service_minutes between 1 and 240),
  queue_mode text not null default 'urut' check (queue_mode in ('urut', 'acak', 'berdasarkan_durasi')),
  jam_buka time,
  jam_tutup time,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table counters (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  nama text not null,
  is_open boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. PENGGUNA & PASIEN
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'pasien',
  nik char(16) unique check (nik ~ '^[0-9]{16}$'),
  nama_lengkap text not null,
  no_whatsapp varchar(15) unique check (no_whatsapp ~ '^62[0-9]{8,13}$'),
  tanggal_lahir date,
  jenis_kelamin text check (jenis_kelamin in ('L', 'P')),
  alamat text,
  no_rm text unique,
  emr_patient_id text,
  kategori_prioritas priority_category not null default 'normal',
  dokumen_prioritas_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table staff_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  unique (profile_id, unit_id)
);

create table patient_change_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  changed_by uuid references profiles(id) on delete set null,
  field_name text not null,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. DOKTER & KUOTA SESI
-- ============================================================
create table doctors (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete restrict,
  nama text not null,
  spesialisasi text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table doctor_sessions (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  tanggal date not null,
  sesi session_slot not null,
  jam_mulai time not null,
  jam_selesai time not null,
  kuota int not null default 30 check (kuota between 1 and 200),
  terpakai int not null default 0 check (terpakai >= 0),
  is_aktif boolean not null default true,
  unique (doctor_id, tanggal, sesi),
  check (terpakai <= kuota)
);

-- ============================================================
-- 4. TIKET ANTREAN & LOG
-- ============================================================
create table queue_tickets (
  id uuid primary key default gen_random_uuid(),
  nomor_tiket text not null,
  tanggal date not null default current_date,
  unit_id uuid not null references units(id) on delete restrict,
  patient_id uuid not null references profiles(id) on delete restrict,
  doctor_session_id uuid references doctor_sessions(id) on delete set null,
  counter_id uuid references counters(id) on delete set null,
  triage triage_level,
  prioritas priority_category not null default 'normal',
  status ticket_status not null default 'menunggu',
  urutan int not null,
  jumlah_panggilan int not null default 0 check (jumlah_panggilan between 0 and 3),
  jumlah_lewati int not null default 0,
  estimasi_menit int,
  sumber text not null default 'online' check (sumber in ('online', 'loket', 'triase')),
  dipanggil_at timestamptz,
  dilayani_at timestamptz,
  selesai_at timestamptz,
  created_at timestamptz not null default now(),
  unique (unit_id, tanggal, nomor_tiket)
);

create index idx_tickets_unit_tanggal_status on queue_tickets (unit_id, tanggal, status);
create index idx_tickets_patient on queue_tickets (patient_id);

create table queue_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references queue_tickets(id) on delete cascade,
  aksi text not null check (aksi in ('buat', 'panggil', 'panggil_ulang', 'lewati', 'layani', 'selesai', 'batal', 'pindah_triase')),
  actor_id uuid references profiles(id) on delete set null,
  catatan text,
  created_at timestamptz not null default now()
);

create table unit_stats (
  unit_id uuid not null references units(id) on delete cascade,
  tanggal date not null,
  rata_rata_layanan_detik int not null default 600,
  jumlah_tiket_aktif int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (unit_id, tanggal)
);

-- ============================================================
-- 5. PEMBAYARAN (MIDTRANS & KASIR)
-- ============================================================
create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  patient_id uuid not null references profiles(id) on delete restrict,
  ticket_id uuid references queue_tickets(id) on delete set null,
  total_amount int not null check (total_amount >= 0),
  status payment_status not null default 'belum_bayar',
  midtrans_order_id text unique,
  midtrans_transaction_id text,
  snap_token text,
  metode_bayar text check (metode_bayar in ('midtrans', 'tunai')),
  paid_at timestamptz,
  raw_notification jsonb,
  created_at timestamptz not null default now()
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  nama_item text not null,
  qty int not null default 1 check (qty > 0),
  harga_satuan int not null check (harga_satuan >= 0)
);

-- ============================================================
-- 6. RAWAT INAP
-- ============================================================
create table rooms (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  nama_kamar text not null,
  kelas text not null check (kelas in ('Kelas 1', 'Kelas 2', 'Kelas 3', 'VIP')),
  kapasitas int not null check (kapasitas > 0),
  terisi int not null default 0 check (terisi >= 0 and terisi <= kapasitas)
);

create table inpatient_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete restrict,
  kelas_diminta text not null,
  room_id uuid references rooms(id) on delete set null,
  indikasi text not null,
  is_pre_op boolean not null default false,
  jenis_tindakan text,
  estimasi_tanggal date,
  status inpatient_status not null default 'menunggu_kamar',
  prioritas priority_category not null default 'normal',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. DISPLAY, NOTIFIKASI, & INTEGRASI
-- ============================================================
create table display_screens (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  unit_id uuid references units(id) on delete set null,
  nama text not null,
  token text not null unique,
  mode display_mode not null default 'antrean',
  pengumuman text,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table notification_jobs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'push')),
  tujuan text not null,
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'antrean' check (status in ('antrean', 'terkirim', 'gagal')),
  percobaan int not null default 0,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table emr_sync_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id) on delete set null,
  arah text not null check (arah in ('keluar', 'masuk')),
  endpoint text not null,
  status_code int,
  status text not null check (status in ('sukses', 'gagal', 'antrean')),
  payload jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8. FUNGSI ATOMIK: BOOKING KUOTA DOKTER
-- ============================================================
create or replace function book_doctor_session(p_session_id uuid)
returns boolean
language plpgsql
as $$
declare
  ok boolean;
begin
  update doctor_sessions
     set terpakai = terpakai + 1
   where id = p_session_id
     and is_aktif = true
     and terpakai < kuota
  returning true into ok;
  return coalesce(ok, false);
end;
$$;

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
alter table profiles enable row level security;
alter table staff_assignments enable row level security;
alter table patient_change_logs enable row level security;
alter table queue_tickets enable row level security;
alter table queue_events enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table inpatient_requests enable row level security;
alter table display_screens enable row level security;
alter table notification_jobs enable row level security;
alter table emr_sync_logs enable row level security;

-- Public read for buildings, units, counters, doctors, doctor_sessions, unit_stats, rooms
alter table buildings enable row level security;
create policy "public_read_buildings" on buildings for select using (true);

alter table units enable row level security;
create policy "public_read_units" on units for select using (true);

alter table counters enable row level security;
create policy "public_read_counters" on counters for select using (true);

alter table doctors enable row level security;
create policy "public_read_doctors" on doctors for select using (true);

alter table doctor_sessions enable row level security;
create policy "public_read_doctor_sessions" on doctor_sessions for select using (true);

alter table unit_stats enable row level security;
create policy "public_read_unit_stats" on unit_stats for select using (true);

alter table rooms enable row level security;
create policy "public_read_rooms" on rooms for select using (true);

-- Profiles RLS
create policy "users_read_own_profile" on profiles
  for select using (auth.uid() = id or exists (select 1 from profiles where id = auth.uid() and role in ('petugas', 'admin')));

create policy "users_update_own_profile" on profiles
  for update using (auth.uid() = id or exists (select 1 from profiles where id = auth.uid() and role in ('petugas', 'admin')));

create policy "users_insert_profile" on profiles
  for insert with check (auth.uid() = id or exists (select 1 from profiles where id = auth.uid() and role in ('petugas', 'admin')));

-- Queue Tickets RLS
create policy "pasien_read_own_tickets" on queue_tickets
  for select using (
    auth.uid() = patient_id 
    or exists (
      select 1 from staff_assignments sa 
      where sa.profile_id = auth.uid() and sa.unit_id = queue_tickets.unit_id
    )
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "pasien_insert_tickets" on queue_tickets
  for insert with check (auth.uid() = patient_id or exists (select 1 from profiles where id = auth.uid() and role in ('petugas', 'admin')));

create policy "staff_update_unit_tickets" on queue_tickets
  for update using (
    exists (
      select 1 from staff_assignments sa 
      where sa.profile_id = auth.uid() and sa.unit_id = queue_tickets.unit_id
    )
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or (auth.uid() = patient_id and status = 'batal')
  );

-- Invoices RLS
create policy "pasien_read_own_invoices" on invoices
  for select using (
    auth.uid() = patient_id 
    or exists (select 1 from profiles where id = auth.uid() and role in ('petugas', 'admin'))
  );

create policy "staff_admin_manage_invoices" on invoices
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('petugas', 'admin'))
  );

-- Inpatient Requests RLS
create policy "pasien_read_own_inpatient" on inpatient_requests
  for select using (
    auth.uid() = patient_id 
    or exists (select 1 from profiles where id = auth.uid() and role in ('petugas', 'admin'))
  );

create policy "pasien_insert_inpatient" on inpatient_requests
  for insert with check (
    auth.uid() = patient_id 
    or exists (select 1 from profiles where id = auth.uid() and role in ('petugas', 'admin'))
  );

-- Display Screens RLS (Public read by token for TV displays)
create policy "public_read_display_by_token" on display_screens
  for select using (true);

-- ============================================================
-- 10. REALTIME PUBLICATION
-- ============================================================
alter publication supabase_realtime add table queue_tickets;
alter publication supabase_realtime add table display_screens;
alter publication supabase_realtime add table unit_stats;

-- ============================================================
-- ANTREAN SEHAT - RSUD SEJAHTERA SEHAT
-- MIGRATION: 20261014000001_storage_setup.sql
-- ============================================================

-- 1. Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('dokumen-pasien', 'dokumen-pasien', false, 2097152, array['image/jpeg', 'image/png', 'application/pdf']),
  ('hasil-penunjang', 'hasil-penunjang', false, 5242880, array['image/jpeg', 'image/png', 'application/pdf']),
  ('aset-publik', 'aset-publik', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Policies for dokumen-pasien
create policy "pasien_baca_dokumen_sendiri"
on storage.objects for select
using (
  bucket_id = 'dokumen-pasien'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('petugas', 'admin')
    )
  )
);

create policy "pasien_unggah_dokumen_sendiri"
on storage.objects for insert
with check (
  bucket_id = 'dokumen-pasien'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "pasien_update_dokumen_sendiri"
on storage.objects for update
using (
  bucket_id = 'dokumen-pasien'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Storage Policies for hasil-penunjang
create policy "pasien_dan_petugas_baca_hasil"
on storage.objects for select
using (
  bucket_id = 'hasil-penunjang'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('petugas', 'admin')
    )
  )
);

create policy "petugas_unggah_hasil"
on storage.objects for insert
with check (
  bucket_id = 'hasil-penunjang'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('petugas', 'admin')
  )
);

-- 4. Storage Policies for aset-publik
create policy "publik_baca_aset"
on storage.objects for select
using (bucket_id = 'aset-publik');

create policy "admin_unggah_aset"
on storage.objects for insert
with check (
  bucket_id = 'aset-publik'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

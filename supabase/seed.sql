-- ============================================================
-- SEED DATA: supabase/seed.sql
-- Antrean Sehat - RSUD Sejahtera Sehat
-- ============================================================

-- 1. Gedung
insert into buildings (id, kode, nama, alamat, is_active) values
  ('a0000000-0000-0000-0000-000000000001', 'A', 'Gedung A', 'Rawat Jalan dan Pendaftaran (Sayap Barat)', true),
  ('a0000000-0000-0000-0000-000000000002', 'B', 'Gedung B', 'IGD dan Rawat Inap (Sayap Timur)', true),
  ('a0000000-0000-0000-0000-000000000003', 'C', 'Gedung C', 'Penunjang Medis: Lab, Radiologi, Farmasi (Area Tengah)', true)
on conflict (id) do nothing;

-- 2. Units
insert into units (id, building_id, kind, kode, nama, slug, lantai, default_service_minutes, queue_mode, jam_buka, jam_tutup, is_active) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'pendaftaran', 'LOK', 'Loket Pendaftaran & Informasi', 'pendaftaran', 'Lantai 1', 5, 'urut', '07:30', '14:00', true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'poliklinik', 'POL-D', 'Poliklinik Penyakit Dalam', 'poliklinik-penyakit-dalam', 'Lantai 2 - Ruang 201', 12, 'urut', '08:00', '15:00', true),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'poliklinik', 'POL-A', 'Poliklinik Spesialis Anak', 'poliklinik-anak', 'Lantai 2 - Ruang 205', 15, 'urut', '08:30', '14:30', true),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'poliklinik', 'POL-B', 'Poliklinik Spesialis Bedah', 'poliklinik-bedah', 'Lantai 3 - Ruang 302', 15, 'urut', '09:00', '15:00', true),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'poliklinik', 'POL-K', 'Poliklinik Kebidanan & Kandungan', 'poliklinik-kandungan', 'Lantai 3 - Ruang 306', 15, 'urut', '08:00', '14:00', true),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'triase', 'TRG', 'Instalasi Gawat Darurat (Triase IGD)', 'triase-igd', 'Lantai 1 Pintu Masuk IGD', 10, 'urut', '00:00', '23:59', true),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'laboratorium', 'LAB', 'Laboratorium Patologi Klinik', 'laboratorium', 'Lantai 1', 8, 'urut', '07:00', '20:00', true),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'radiologi', 'RAD', 'Instalasi Radiologi & Diagnostik Imejing', 'radiologi', 'Lantai 2', 20, 'urut', '08:00', '18:00', true),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'farmasi', 'FAR', 'Farmasi & Apotek Rawat Jalan', 'farmasi', 'Lantai 1', 10, 'berdasarkan_durasi', '08:00', '21:00', true),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'kasir', 'KAS', 'Kasir & Loket Pembayaran Terpusat', 'kasir', 'Lantai 1', 4, 'urut', '07:30', '20:00', true),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002', 'rawat_inap', 'RWI', 'Admisi Rawat Inap & Alokasi Kamar', 'rawat-inap', 'Lantai 2', 15, 'urut', '00:00', '23:59', true)
on conflict (id) do nothing;

-- 3. Dokter
insert into doctors (id, unit_id, nama, spesialisasi, is_active) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'dr. Hendra Wijaya', 'Spesialis Penyakit Dalam', true),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'dr. Ratna Kusumawati', 'Spesialis Anak', true),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'dr. Yudi Prasetyo', 'Spesialis Bedah Umum', true),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 'dr. Sari Indah Lestari', 'Spesialis Kebidanan & Kandungan', true)
on conflict (id) do nothing;

-- 4. Kamar Rawat Inap
insert into rooms (id, unit_id, nama_kamar, kelas, kapasitas, terisi) values
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 'Melati 201', 'Kelas 1', 4, 3),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000011', 'Melati 202', 'Kelas 1', 4, 4),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000011', 'Anggrek 105', 'Kelas 2', 6, 5),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000011', 'Bougenville 101', 'Kelas 3', 8, 6),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000011', 'Dahlia 301', 'VIP', 2, 1)
on conflict (id) do nothing;

-- 5. Display Screens
insert into display_screens (id, building_id, unit_id, nama, token, mode, pengumuman, is_active) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'TV Ruang Tunggu Poliklinik Lt. 2', 'tv-poli-lt2-a8f9', 'bergantian', 'Mohon siapkan KTP dan kartu berobat Anda saat nomor dipanggil.', true),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'TV Ruang Tunggu IGD Pintu Masuk', 'tv-igd-pintu-b2c1', 'antrean', 'Prioritas penanganan didasarkan pada tingkat kegawatan medis pasien.', true),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000009', 'TV Ruang Farmasi & Apotek', 'tv-farmasi-lt1-c4d3', 'antrean', 'Obat racik memerlukan waktu ekstra 15-20 menit untuk ketelitian dosis.', true)
on conflict (id) do nothing;

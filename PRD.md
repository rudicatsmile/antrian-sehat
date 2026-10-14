# Antrean Sehat

---

## 1. Ringkasan & Tujuan Aplikasi
*Bagian ini menjelaskan gambaran umum proyek agar dipahami bersama oleh pemilik ide/klien dan tim pengembang.*
- **Nama Aplikasi**: Antrean Sehat
- **Penjelasan Singkat**: Aplikasi booking dan manajemen antrean online untuk Rumah Sakit Umum Daerah. Pasien dapat mendaftar antrean dari ponsel atau datang langsung, memantau estimasi waktu tunggu secara real-time, dan menerima notifikasi WhatsApp di setiap tahap layanan. Nilai pembedanya adalah satu sistem terpadu yang mencakup seluruh unit layanan, dari pendaftaran hingga kasir, termasuk antrean triase IGD berbasis prioritas medis.
- **Masalah yang Diselesaikan**:
  - Penumpukan pasien di ruang pendaftaran, poliklinik, laboratorium, radiologi, dan apotek.
  - Pasien tidak mengetahui kapan giliran mereka dipanggil sehingga menunggu lama tanpa kepastian.
  - Pasien lansia, disabilitas, dan ibu hamil sering harus menunggu bersama antrean umum.
  - Pasien IGD diperlakukan dengan antrean biasa, padahal kondisi medisnya membutuhkan prioritas.
  - Kuota dokter per sesi tidak terkontrol sehingga pasien datang melebihi kapasitas.
  - Petugas kesulitan memanggil ulang pasien yang tidak hadir dan mengelola pasien yang dilewati secara tertib.
  - Pembayaran di kasir menumpuk dan tidak tercatat terpusat.
- **Pengguna Aplikasi**:
  - **Pasien**: Mendaftar dengan NIK dan OTP WhatsApp, booking antrean poliklinik, laboratorium, radiologi, atau farmasi, memantau status antrean, membayar tagihan melalui Midtrans, dan mendaftar rawat inap.
  - **Petugas Pendaftaran (Loket)**: Mendaftarkan pasien baru, memperbarui data pasien lama yang belum memiliki nomor rekam medis digital, dan mencetak tiket antrean untuk pasien yang datang langsung.
  - **Petugas Unit Layanan (Perawat Triase, Dokter, Analis Lab, Radiografer, Farmasi, Kasir)**: Memanggil, memanggil ulang, melewati, dan menyelesaikan antrean pada unit masing-masing.
  - **Admin Rumah Sakit**: Mengatur lokasi, gedung, unit, dokter, jadwal sesi, kuota, perangkat display TV, pengguna, dan laporan.
  - **Pengunjung Publik**: Melihat informasi layanan, jadwal dokter, dan layar display antrean di ruang tunggu.
- **Target Keberhasilan**:
  - Waktu tunggu rata-rata pasien rawat jalan turun minimal 30% dalam enam bulan pertama.
  - Lebih dari 60% booking dilakukan melalui aplikasi sebelum kedatangan pasien.
  - Seluruh antrean prioritas IGD ditangani sesuai urutan triase tanpa kesalahan urutan.
  - Notifikasi WhatsApp terkirim kepada pasien dalam waktu kurang dari 10 detik setelah status antrean berubah.
  - Display TV di setiap ruang tunggu memperbarui nomor panggilan dalam waktu kurang dari 2 detik.

---

## 2. Batasan Pembuatan Sistem (Versi Awal MVP)
*Menegaskan fitur apa yang dikerjakan di versi awal dan apa yang sengaja ditunda agar aplikasi cepat selesai dan tidak membengkak (mencegah scope creep).*

### ✅ Yang Dikerjakan:
- Pendaftaran dan login pasien menggunakan NIK dan OTP WhatsApp.
- Pendaftaran pasien baru, pendaftaran pasien lama tanpa nomor rekam medis digital, dan pembaruan data pasien di loket.
- Booking antrean online dan tiket cetak di loket untuk unit Pendaftaran dan Poliklinik (Rawat Jalan).
- Antrean Triase IGD dengan klasifikasi merah, kuning, dan hijau, serta urutan prioritas khusus.
- Antrean Laboratorium (pengambilan sampel, pemeriksaan, dan pengambilan hasil) dan Radiologi (rontgen, USG, CT Scan, MRI, mammografi).
- Antrean Farmasi (obat rawat jalan, obat pascarawat inap, obat racik, dan konsultasi obat) serta Kasir.
- Antrean Rawat Inap (pendaftaran rawat inap, waiting list kamar, dan antrean pre-operasi).
- Pembayaran di kasir dan pembayaran online melalui Midtrans (Snap) dengan webhook verifikasi signature.
- Pengaturan kuota dokter per sesi (pagi, siang, sore) per tanggal.
- Prioritas antrean untuk lansia, disabilitas, ibu hamil, dan emergency.
- Fitur panggil, panggil ulang (maksimal tiga kali), dan lewati.
- Estimasi waktu tunggu berdasarkan rata-rata durasi layanan per unit.
- Display antrean TV per lokasi dengan pembaruan real-time melalui Supabase Realtime.
- Notifikasi WhatsApp melalui WhatsApp Gateway untuk konfirmasi booking, giliran hampir tiba, dipanggil, dan pembayaran.
- Panel petugas dan admin untuk monitoring antrean multi-gedung.
- Multi-lokasi dan multi-gedung dengan pemisahan data per gedung.

### ⛔ Yang Tidak Dikerjakan di Versi Awal:
- Aplikasi mobile native (iOS dan Android). Versi awal berupa Progressive Web App (PWA) yang responsif.
- Push notification native dan notifikasi browser (ditunda ke fase lanjutan).
- Integrasi EMR penuh dua arah. Versi awal hanya menyediakan sinkronisasi satu arah pembacaan data pasien dan pencatatan status kunjungan melalui API standar FHIR-lite.
- Telemedicine dan konsultasi video.
- Manajemen stok obat dan inventaris farmasi secara lengkap.
- Penjadwalan operasi (OT scheduling) lengkap. Versi awal hanya mencatat antrean pre-operasi.
- Pembayaran asuransi BPJS Kesehatan dan validasi klaim. Versi awal hanya mendukung pembayaran umum melalui Midtrans dan kasir.
- Pengenalan wajah dan kiosk biometrik.
- Multi-bahasa. Versi awal hanya Bahasa Indonesia.

---

## 3. Daftar Halaman & Struktur Menu (Pages & Routing)
*Daftar lengkap halaman yang harus dibuat, dikelompokkan berdasarkan area atau peran pengguna (Role).*

### A. Public Area (Tanpa Login)
- `/` (Beranda): Hero section dengan CTA "Booking Antrean Sekarang", ringkasan unit layanan, ketersediaan dokter hari ini, dan panduan langkah singkat.
- `/layanan` (Daftar Layanan): Kartu seluruh unit layanan (Pendaftaran, Poliklinik, Triase IGD, Laboratorium, Radiologi, Farmasi, Kasir, Rawat Inap) dengan filter gedung dan jam operasional.
- `/layanan/[slug]` (Detail Layanan): Penjelasan unit, persyaratan dokumen, estimasi waktu tunggu dummy, dan tombol booking.
- `/jadwal-dokter` (Jadwal Dokter): Tabel jadwal dokter per tanggal dan sesi dengan indikator sisa kuota (tersedia, hampir penuh, penuh).
- `/display/[token]` (Display Antrean TV): Halaman fullscreen tanpa login yang menampilkan nomor panggilan aktif per unit, daftar tunggu, dan jam. Data diperbarui secara real-time. Token menentukan lokasi dan unit yang ditampilkan.
- `/tentang` (Tentang Kami): Profil rumah sakit, visi misi, dan informasi gedung.
- `/faq` (Pertanyaan Umum): Accordion pertanyaan tentang cara booking, pembatalan, prioritas, dan pembayaran.
- `/kontak` (Kontak & Lokasi): Formulir kontak, alamat, peta statis, dan nomor layanan pengaduan.
- `/masuk` (Login Pasien): Form NIK, input nomor WhatsApp, dan verifikasi OTP enam digit.
- `/daftar` (Registrasi Pasien Baru): Form data diri dengan validasi NIK 16 digit, verifikasi OTP WhatsApp, dan persetujuan kebijakan privasi.

### B. Pasien Area (Setelah Login)
- `/dashboard` (Dasbor Pasien): Kartu antrean aktif, status real-time, tagihan belum dibayar, dan pintasan booking.
- `/booking` (Pilih Layanan): Pilihan unit yang dapat di-booking beserta jadwal tersedia.
- `/booking/poliklinik` (Booking Poliklinik): Pilih poli, dokter, tanggal, dan sesi. Sistem menampilkan sisa kuota.
- `/booking/laboratorium` (Booking Laboratorium): Pilih jenis pemeriksaan dan waktu kedatangan.
- `/booking/radiologi` (Booking Radiologi): Pilih modalitas (rontgen, USG, CT Scan, MRI, mammografi) dan jadwal.
- `/booking/farmasi` (Booking Farmasi): Pilih jenis pengambilan obat (rawat jalan, pascarawat inap, racik, konsultasi obat).
- `/booking/rawat-inap` (Pendaftaran Rawat Inap): Form kelas kamar, indikasi, dan pilihan pre-operasi bila diperlukan.
- `/antrean/saya` (Antrean Saya): Daftar seluruh tiket aktif dengan posisi antrean, estimasi waktu, dan tombol batalkan.
- `/antrean/[ticketId]` (Detail Tiket): Nomor tiket, QR code, status langkah demi langkah, dan riwayat panggilan.
- `/pembayaran` (Daftar Tagihan): Daftar invoice dengan status pembayaran.
- `/pembayaran/[invoiceId]` (Detail Pembayaran): Rincian item, total, tombol bayar melalui Midtrans Snap, dan instruksi pembayaran di kasir.
- `/riwayat` (Riwayat Kunjungan): Riwayat antrean dan layanan yang pernah diikuti.
- `/profil` (Profil & Data Pasien): Pembaruan data diri, alamat, kontak, kategori prioritas (dengan unggah dokumen pendukung ke Supabase Storage), dan nomor rekam medis.

### C. Petugas Area (Setelah Login, Role Petugas)
- `/petugas/dashboard` (Dasbor Petugas): Ringkasan antrean per unit yang ditugaskan, jumlah menunggu, dan rata-rata waktu layanan.
- `/petugas/pendaftaran` (Loket Pendaftaran): Tab Pasien Baru, Pasien Lama Tanpa RM Digital, dan Update Data Pasien. Termasuk pencetakan tiket.
- `/petugas/pendaftaran/pasien-baru` (Form Pasien Baru): Form lengkap dengan validasi NIK dan pembuatan nomor rekam medis.
- `/petugas/pendaftaran/pasien-lama` (Pasien Lama Tanpa RM Digital): Pencarian pasien berdasarkan NIK dan pembuatan RM digital.
- `/petugas/pendaftaran/update/[patientId]` (Update Data Pasien): Form pembaruan data dengan riwayat perubahan.
- `/petugas/triase` (Panel Triase IGD): Pembuatan tiket triase, klasifikasi merah, kuning, hijau, dan daftar tunggu berurutan.
- `/petugas/panel/[unitSlug]` (Panel Antrean Unit): Tombol Panggil Berikutnya, Panggil Ulang (maksimal tiga kali), Lewati, Layani, dan Selesai. Digunakan oleh poliklinik, laboratorium, radiologi, farmasi, dan kasir.
- `/petugas/kuota-dokter` (Pengaturan Kuota Dokter): Kalender dan tabel untuk mengatur kuota per dokter, tanggal, dan sesi.
- `/petugas/farmasi` (Antrean Farmasi): Antrean obat dengan kategori rawat jalan, pascarawat inap, racik, dan konsultasi.
- `/petugas/kasir` (Kasir): Daftar tagihan, pencatatan pembayaran tunai, cetak kuitansi, dan status Midtrans.
- `/petugas/rawat-inap` (Antrean Rawat Inap): Waiting list kamar, penempatan kamar, dan antrean pre-operasi.
- `/petugas/display` (Manajemen Display TV): Daftar layar per lokasi, mode tampilan, dan token akses display.
- `/petugas/monitoring` (Monitoring Multi-Gedung): Peta gedung dan kartu status tiap unit dengan indikator beban antrean.

### D. Admin Area (Setelah Login, Role Admin)
- `/admin/dashboard` (Dasbor Admin): Statistik kunjungan harian, pendapatan, waktu tunggu rata-rata, dan grafik per gedung.
- `/admin/lokasi` (Kelola Lokasi & Gedung): CRUD lokasi dan gedung.
- `/admin/unit` (Kelola Unit Layanan): CRUD unit, loket, dan jam operasional.
- `/admin/dokter` (Kelola Dokter): CRUD dokter dan penugasan poliklinik.
- `/admin/pengguna` (Kelola Pengguna & Peran): Daftar pengguna, peran, dan penugasan unit petugas.
- `/admin/laporan` (Laporan): Laporan kunjungan, waktu tunggu, pembayaran, dan ekspor CSV.
- `/admin/integrasi` (Integrasi): Status WhatsApp Gateway, Midtrans, EMR, dan log sinkronisasi.
- `/admin/notifikasi` (Log Notifikasi): Riwayat pesan WhatsApp beserta status pengiriman.

---

## 4. Pedoman UI/UX & Design System
*Panduan visual konkret agar AI coding assistant tidak membuat UI yang kaku atau default.*

- **Skema Warna**:
  - Primary (Teal Kesehatan): `hsl(173, 80%, 32%)` untuk tombol utama, tautan aktif, dan ikon penting.
  - Primary Foreground: `hsl(0, 0%, 100%)`.
  - Secondary (Teal Pucat): `hsl(170, 40%, 96%)` untuk latar kartu yang disorot.
  - Background: `hsl(0, 0%, 100%)` pada mode terang.
  - Surface (latar panel): `hsl(210, 20%, 98%)`.
  - Foreground (teks utama): `hsl(222, 25%, 12%)`.
  - Muted Text: `hsl(215, 14%, 45%)`.
  - Border: `hsl(214, 20%, 91%)` dengan ketebalan 1px.
  - Triase Merah: `hsl(0, 72%, 51%)`. Triase Kuning: `hsl(45, 93%, 47%)`. Triase Hijau: `hsl(142, 71%, 35%)`. Digunakan secara konsisten pada badge, chip, dan display TV.
  - Status Sukses: `hsl(142, 71%, 35%)`. Status Peringatan: `hsl(38, 92%, 50%)`. Status Error: `hsl(0, 72%, 51%)`.
- **Tipografi**:
  - Heading menggunakan font `Plus Jakarta Sans` dengan bobot 600 hingga 700 dan letter-spacing `-0.01em`.
  - Body dan UI menggunakan font `Inter` dengan bobot 400 dan 500.
  - Nomor antrean di display TV menggunakan `JetBrains Mono` atau `Inter` dengan bobot 800 agar mudah dibaca dari jarak jauh.
  - Skala ukuran: H1 `text-4xl` (desktop) dan `text-3xl` (mobile), H2 `text-2xl`, H3 `text-lg`, body `text-base` dengan line-height `1.6`.
  - Font dimuat melalui `next/font/google` agar tidak memicu layout shift.
- **Aturan Komponen**:
  - Sudut membulat sedang: `rounded-lg` untuk input dan tombol, `rounded-xl` untuk kartu.
  - Border sangat tipis `border` (1px) dengan warna border token, tanpa shadow tebal.
  - Kartu biasa hanya memakai `border` dan tanpa shadow. Shadow `shadow-sm` hanya dipakai pada kartu yang sedang dipilih atau melayang (hover).
  - Tombol utama berbentuk solid Primary, tombol sekunder berbentuk ghost dengan border tipis.
  - Badge triase memakai bentuk pill (`rounded-full`) dengan teks kapital kecil dan titik warna di kiri.
  - Input form memakai label di atas input, pesan error di bawah input berwarna error, dan fokus memakai ring Primary 2px.
  - Tabel memakai garis pemisah horizontal tipis, header berwarna Surface, dan baris hover dengan latar sangat pucat.
  - Komponen dasar yang wajib diinstal dari shadcn/ui: Button, Card, Input, Label, Select, Dialog, Sheet (untuk sidebar mobile), Table, Badge, Dropdown Menu, Tabs, Calendar, Toast (Sonner), Form, Tooltip, Skeleton, dan Separator.
  - Ikon menggunakan Lucide React dengan ukuran 16px (dalam tabel dan tombol) atau 20px (dalam navigasi).
- **Nuansa & Vibe**:
  - Minimalis dan fokus pada tipografi. Ruang kosong (whitespace) lebar, tata letak rapi dalam grid 12 kolom, dan hirarki visual yang jelas.
  - Tenang dan terpercaya sesuai konteks rumah sakit. Hindari warna mencolok selain untuk indikator status.
  - Animasi halus dan singkat (150 hingga 200ms) untuk transisi tombol, membuka panel, dan pembaruan nomor antrean. Animasi tidak boleh mengganggu.
  - Display TV memakai latar gelap (`hsl(222, 47%, 11%)`) dengan teks putih dan nomor antrean berukuran sangat besar agar terbaca dari jarak 5 meter.
  - Mode gelap untuk dashboard petugas dan admin bersifat opsional pada fase lanjutan.
  - Aksesibilitas: kontras teks minimal WCAG AA, target sentuh minimal 44px, dan dukungan navigasi keyboard.

---

## 5. Pembagian Hak Akses Pengguna
*Tabel hak akses yang menentukan siapa saja yang boleh melihat, mengedit, atau mengelola data.*

| Menu / Halaman | Publik (Tanpa Login) | Pasien (Login NIK + OTP) | Petugas Loket & Unit | Admin Rumah Sakit |
| :--- | :---: | :---: | :---: | :---: |
| Beranda, Layanan, Jadwal Dokter, FAQ, Kontak | ✅ | ✅ | ✅ | ✅ |
| Display Antrean TV (`/display/[token]`) | ✅ | ✅ | ✅ | ✅ |
| Booking Antrean & Antrean Saya | ❌ | ✅ | ❌ | ❌ |
| Pembayaran & Riwayat Pasien | ❌ | ✅ | ❌ | ❌ |
| Profil & Data Pasien Sendiri | ❌ | ✅ | ❌ | ❌ |
| Pendaftaran Pasien Baru & Update Data | ❌ | ❌ | ✅ | ✅ |
| Cetak Tiket Loket | ❌ | ❌ | ✅ | ✅ |
| Panel Panggil, Panggil Ulang, Lewati (unit ditugaskan) | ❌ | ❌ | ✅ | ✅ |
| Panel Triase IGD | ❌ | ❌ | ✅ (Perawat Triase) | ✅ |
| Pengaturan Kuota Dokter | ❌ | ❌ | ✅ (Koordinator Poli) | ✅ |
| Kasir & Pembayaran Tunai | ❌ | ❌ | ✅ (Kasir) | ✅ |
| Monitoring Multi-Gedung | ❌ | ❌ | ✅ (Supervisor) | ✅ |
| Manajemen Display TV | ❌ | ❌ | ✅ (Supervisor) | ✅ |
| Kelola Lokasi, Gedung, dan Unit | ❌ | ❌ | ❌ | ✅ |
| Kelola Dokter & Pengguna | ❌ | ❌ | ❌ | ✅ |
| Laporan & Ekspor Data | ❌ | ❌ | ❌ | ✅ |
| Integrasi & Log Notifikasi | ❌ | ❌ | ❌ | ✅ |

*Catatan aturan tambahan: Petugas hanya dapat mengakses unit yang ditugaskan kepadanya melalui tabel `staff_assignments`. Pasien hanya dapat membaca dan mengubah data miliknya sendiri, dan seluruh akses data ini dikendalikan oleh Row Level Security (RLS) di Supabase PostgreSQL.*

---

## 6. Alur Kerja dan Fitur Utama
*Menjelaskan cara kerja setiap fitur utama dalam bahasa yang mudah dipahami serta aturan logikanya.*

### A. Registrasi & Login Pasien (NIK + OTP WhatsApp)
1. **Cara Kerja**:
   1. Pasien membuka `/daftar` atau `/masuk`, lalu memasukkan NIK 16 digit dan nomor WhatsApp aktif.
   2. Sistem memeriksa format NIK dan apakah nomor WhatsApp sudah terdaftar.
   3. Supabase Auth mengirim permintaan OTP. Melalui Send SMS Hook, pesan OTP dikirim ke WhatsApp Gateway.
   4. Pasien memasukkan kode OTP enam digit dalam waktu 5 menit.
   5. Jika berhasil, pasien diarahkan ke `/dashboard`. Jika pasien baru, sistem menampilkan form data diri yang harus dilengkapi terlebih dahulu.
2. **Aturan Sistem**:
   - NIK harus tepat 16 digit angka dan tidak boleh sama dengan NIK pasien lain.
   - Nomor WhatsApp harus diawali `62` atau `08` dan dinormalisasi ke format `62xxxxxxxxxx` sebelum disimpan.
   - OTP berlaku 5 menit dan hanya dapat dicoba maksimal 5 kali. Setelah itu, permintaan OTP baru harus ditunda 60 detik (rate limit).
   - Pengiriman ulang OTP hanya boleh dilakukan maksimal 3 kali per 15 menit per nomor.
   - Login petugas menggunakan email dan kata sandi terpisah. Petugas tidak dapat masuk melalui NIK agar pemisahan hak akses tetap jelas.

### B. Pendaftaran Pasien di Loket (Baru, Lama, dan Update Data)
1. **Cara Kerja**:
   1. Petugas membuka `/petugas/pendaftaran` dan memilih salah satu tab: Pasien Baru, Pasien Lama Tanpa RM Digital, atau Update Data.
   2. Untuk pasien baru, petugas mengisi NIK, nama lengkap, tanggal lahir, jenis kelamin, alamat, nomor WhatsApp, dan kategori prioritas.
   3. Untuk pasien lama tanpa RM digital, petugas mencari berdasarkan NIK. Jika data ditemukan di data kependudukan internal (arsip manual), petugas melengkapi data dan sistem menerbitkan nomor rekam medis digital.
   4. Untuk update data, petugas mencari pasien, mengubah data yang diperlukan, dan melampirkan dokumen pendukung bila perlu.
   5. Setelah pendaftaran selesai, petugas memilih unit tujuan dan sistem mencetak tiket antrean.
2. **Aturan Sistem**:
   - Nomor rekam medis (RM) dibentuk dengan format `RM-YYYY-XXXXXX` dengan nomor urut unik.
   - Setiap perubahan data pasien dicatat di tabel `patient_change_logs` beserta nama petugas dan waktu perubahan.
   - Dokumen pendukung kategori prioritas (surat keterangan disabilitas, buku KIA untuk ibu hamil, atau bukti usia lansia) diunggah ke bucket privat `dokumen-pasien` di Supabase Storage. Ukuran maksimal 2 MB, format JPG, PNG, atau PDF.
   - Pasien yang datang langsung dan belum memiliki akun dapat didaftarkan tanpa OTP. Sistem mengirim undangan aktivasi akun melalui WhatsApp setelah data tersimpan.

### C. Booking Antrean Online (Poliklinik & Unit Lainnya)
1. **Cara Kerja**:
   1. Pasien memilih layanan pada `/booking`, lalu memilih poli atau unit tujuan.
   2. Untuk poliklinik, pasien memilih dokter, tanggal, dan sesi. Sistem menampilkan sisa kuota secara real-time.
   3. Pasien mengonfirmasi booking. Sistem membuat tiket dengan nomor urut, menghitung estimasi waktu, dan menampilkan QR code.
   4. Notifikasi konfirmasi dikirim melalui WhatsApp Gateway.
   5. Pada hari kedatangan, pasien dapat melakukan check-in melalui `/antrean/[ticketId]` atau dengan memindai QR code di loket.
2. **Aturan Sistem**:
   - Booking poliklinik hanya dapat dilakukan H-7 hingga H-0 (hari yang sama sebelum jam operasional berakhir).
   - Satu pasien hanya boleh memiliki satu tiket aktif per unit pada tanggal yang sama.
   - Kuota sesi dokter dikurangi secara atomik menggunakan transaksi database agar tidak terjadi overbooking.
   - Pasien dapat membatalkan booking paling lambat 2 jam sebelum jadwal sesi. Pembatalan di bawah batas tersebut dicatat sebagai pembatalan terlambat.
   - Pasien yang tidak check-in hingga akhir sesi otomatis berstatus `batal` dengan alasan `tidak_hadir`.
   - Format nomor tiket: `[KODE UNIT]-[NOMOR 3 DIGIT]`, contoh `POL-A-014` untuk poli A dan `LAB-007` untuk laboratorium.

### D. Antrean Triase IGD (Prioritas Medis)
1. **Cara Kerja**:
   1. Pasien IGD diterima di pintu masuk dan langsung didaftarkan oleh petugas triase melalui `/petugas/triase`.
   2. Perawat triase menilai kondisi pasien dan memilih klasifikasi: merah (kritis, segera), kuning (urgen, cepat), atau hijau (tidak gawat, dapat menunggu).
   3. Sistem menempatkan pasien pada antrean sesuai klasifikasi. Dalam kelas yang sama, urutan berdasarkan waktu masuk.
   4. Panel IGD menampilkan daftar tunggu berurutan dan tombol Panggil Berikutnya.
   5. Perawat dapat menaikkan atau menurunkan klasifikasi bila kondisi pasien berubah. Setiap perubahan dicatat.
2. **Aturan Sistem**:
   - Urutan antrean: merah selalu didahulukan dari kuning, kuning dari hijau. Tidak ada mekanisme booking untuk triase.
   - Pasien merah tidak boleh dilewati. Tombol Lewati dinonaktifkan untuk klasifikasi merah dan hanya dapat dilakukan oleh Dokter Jaga dengan alasan tertulis.
   - Pasien kuning atau hijau yang dilewati dua kali otomatis dikembalikan ke posisi paling akhir kelasnya.
   - Pasien IGD dapat langsung dikaitkan dengan kategori prioritas emergency tanpa perlu dokumen tambahan.
   - Tiket triase menggunakan prefiks `TRG-M`, `TRG-K`, atau `TRG-H` sesuai klasifikasi.

### E. Antrean Laboratorium & Radiologi
1. **Cara Kerja**:
   1. Pasien yang memiliki permintaan pemeriksaan dari dokter (atau rawat jalan) melakukan booking pada `/booking/laboratorium` atau `/booking/radiologi`.
   2. Terdapat tiga tahap antrean lab: pengambilan sampel (darah atau urine), pemeriksaan (diproses di belakang), dan pengambilan hasil.
   3. Radiologi memiliki satu tahap utama per modalitas: rontgen, USG, CT Scan, MRI, dan mammografi, masing-masing dengan kapasitas alat sendiri.
   4. Hasil pemeriksaan diunggah oleh analis atau radiografer ke Supabase Storage dan pasien mendapatkan notifikasi saat hasil siap diambil.
2. **Aturan Sistem**:
   - Pemeriksaan puasa memerlukan waktu kedatangan pagi (sebelum pukul 09.00) dan sistem menampilkan peringatan puasa.
   - Setiap modalitas radiologi memiliki kapasitas harian. Jika kapasitas penuh, sistem menolak booking baru pada tanggal tersebut.
   - Hasil lab dan radiologi hanya dapat diunduh oleh pasien pemilik data melalui URL bertanda tangan (signed URL) dengan masa berlaku 15 menit.
   - Status `dilayani` untuk tahap pemeriksaan tidak memicu pemanggilan; hanya tahap pengambilan sampel dan pengambilan hasil yang menghasilkan panggilan.

### F. Antrean Farmasi / Apotek
1. **Cara Kerja**:
   1. Pasien memilih jenis layanan farmasi: obat rawat jalan, obat pascarawat inap, obat racik, atau konsultasi obat.
   2. Sistem menentukan urutan berdasarkan jenis layanan dan waktu estimasi meracik.
   3. Untuk obat racik, sistem memberikan estimasi berdasarkan durasi meracik rata-rata yang tercatat per resep, sehingga antrean racik dapat diurutkan ulang (acak per sesi atau berdasarkan lama meracik).
   4. Petugas farmasi memanggil pasien, memverifikasi resep, dan menyerahkan obat.
2. **Aturan Sistem**:
   - Antrean obat racik menggunakan mode `berdasarkan_durasi` (paling cepat diracik didahulukan) atau `acak` sesuai konfigurasi unit.
   - Obat pascarawat inap diberi prioritas di atas obat rawat jalan biasa.
   - Konsultasi obat hanya dapat dijadwalkan oleh apoteker dengan durasi 10 menit per sesi.
   - Pembayaran obat diproses di kasir atau melalui Midtrans sebelum obat diserahkan, kecuali pasien BPJS yang diatur pada fase lanjutan.

### G. Antrean Kasir & Pembayaran (Midtrans)
1. **Cara Kerja**:
   1. Setelah layanan selesai, sistem membuat invoice berisi rincian biaya.
   2. Pasien memilih bayar online melalui Midtrans Snap atau bayar tunai di kasir.
   3. Untuk pembayaran online, sistem membuka popup Snap. Setelah pembayaran berhasil, Midtrans mengirim notifikasi ke webhook aplikasi.
   4. Sistem memverifikasi signature, memperbarui status invoice, dan mengirim kuitansi melalui WhatsApp.
   5. Untuk pembayaran tunai, kasir mencatat penerimaan dan mencetak kuitansi.
2. **Aturan Sistem**:
   - Order ID Midtrans dibentuk dengan format `ANT-[YYYYMMDD]-[INVOICE_NO]` dan bersifat unik.
   - Webhook Midtrans wajib memverifikasi `signature_key` dengan algoritma SHA512 dari `order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY`. Notifikasi yang gagal verifikasi ditolak dengan HTTP 403 dan dicatat di log.
   - Status pembayaran yang diterima: `pending`, `settlement`, `expire`, `cancel`, `deny`, `failure`, `refund`. Hanya `settlement` yang menandai invoice lunas.
   - Pembayaran yang berstatus `settlement` tidak boleh diproses ulang. Webhook yang diterima dua kali dianggap idempoten.
   - Tagihan yang kedaluwarsa (`expire`) dapat dibuatkan Snap token baru dengan order ID baru.
   - Kasir hanya dapat memproses pembayaran tunai untuk invoice berstatus `pending` atau `belum_bayar`.

### H. Antrean Rawat Inap
1. **Cara Kerja**:
   1. Pasien atau petugas mendaftarkan permintaan rawat inap dengan kelas kamar dan indikasi medis.
   2. Jika kamar tersedia, pasien langsung ditempatkan. Jika tidak, pasien masuk ke waiting list kamar.
   3. Untuk tindakan operasi, pasien masuk ke antrean pre-operasi dengan status terpisah.
   4. Petugas rawat inap memantau waiting list dan memberi tahu pasien ketika kamar tersedia.
2. **Aturan Sistem**:
   - Waiting list diurutkan berdasarkan kelas kamar, kategori prioritas, lalu waktu daftar.
   - Pasien dengan kategori emergency atau prioritas medis tinggi dapat dinaikkan urutannya oleh admin dengan alasan tercatat.
   - Kamar yang dialokasikan mengurangi kapasitas tersisa secara atomik.
   - Pre-operasi mencatat jenis tindakan dan estimasi tanggal, tanpa penjadwalan kamar operasi pada versi awal.

### I. Panggil, Panggil Ulang, dan Lewati
1. **Cara Kerja**:
   1. Petugas unit menekan tombol Panggil Berikutnya. Sistem mengambil tiket dengan urutan tertinggi berdasarkan triase, prioritas, lalu nomor urut.
   2. Status tiket berubah menjadi `dipanggil`. Nomor tampil di display TV unit dan WhatsApp dikirim ke pasien.
   3. Jika pasien tidak merespons dalam 3 menit, petugas dapat menekan Panggil Ulang. Maksimal tiga kali pemanggilan ulang.
   4. Jika pasien tetap tidak hadir, petugas menekan Lewati. Tiket berubah menjadi `dilewati` dan dapat dipanggil kembali dalam jendela 15 menit melalui menu Daftar Lewati.
   5. Jika pasien hadir, petugas menekan Layani, lalu Selesai setelah layanan rampung.
2. **Aturan Sistem**:
   - Panggil ulang maksimal tiga kali per tiket. Pemanggilan keempat ditolak dengan pesan informasi.
   - Setiap aksi (panggil, panggil ulang, lewati, layani, selesai, batal) dicatat di tabel `queue_events` dengan waktu dan nama petugas.
   - Tiket yang dilewati lebih dari dua kali dikembalikan ke urutan paling akhir pada kelas yang sama.
   - Pasien dengan kategori prioritas (lansia, disabilitas, ibu hamil) didahulukan dalam urutan normal, tetapi tidak mendahului triase merah.
   - Display TV diperbarui melalui Supabase Realtime pada kanal yang sesuai dengan unit dan gedung.

### J. Estimasi Waktu Tunggu Real-Time
1. **Cara Kerja**:
   1. Sistem menghitung rata-rata durasi layanan per unit dari 50 layanan terakhir yang selesai.
   2. Estimasi waktu tunggu = (jumlah tiket di depan) × rata-rata durasi ÷ jumlah loket atau dokter yang aktif.
   3. Estimasi ditampilkan di tiket pasien dan display TV, dan diperbarui setiap kali ada perubahan status.
2. **Aturan Sistem**:
   - Estimasi dibulatkan ke kelipatan 5 menit terdekat.
   - Jika tidak ada data historis, sistem menggunakan nilai default konfigurasi unit (misalnya 12 menit untuk poliklinik).
   - Estimasi tidak ditampilkan jika jumlah loket aktif bernilai nol. Sebagai gantinya ditampilkan pesan "Layanan belum dibuka".
   - Perhitungan dijalankan oleh fungsi terjadwal (cron) setiap 1 menit dan hasilnya disimpan di tabel `unit_stats`.

### K. Kuota Dokter per Sesi
1. **Cara Kerja**:
   1. Koordinator poli membuka `/petugas/kuota-dokter` dan memilih tanggal serta dokter.
   2. Untuk setiap sesi (pagi, siang, sore), koordinator mengatur kuota maksimal pasien.
   3. Sistem menampilkan indikator kuota di halaman booking.
   4. Jika kuota diubah ke angka lebih kecil dari jumlah terpakai, sistem menolak perubahan dan menampilkan jumlah pasien yang sudah terdaftar.
2. **Aturan Sistem**:
   - Kuota minimal 1 dan maksimal 200 per sesi.
   - Perubahan kuota pada H-0 hanya dapat dilakukan oleh admin.
   - Jika dokter berhalangan, koordinator dapat menonaktifkan sesi. Pasien yang sudah booking otomatis menerima notifikasi WhatsApp untuk menjadwalkan ulang.

### L. Display Antrean TV & Multi-Gedung
1. **Cara Kerja**:
   1. Admin mendaftarkan layar TV pada `/petugas/display` dengan memilih gedung, lantai, dan unit yang ditampilkan.
   2. Sistem menghasilkan token unik. TV membuka URL `/display/[token]` tanpa perlu login.
   3. Layar menampilkan nomor yang sedang dipanggil, daftar tunggu berikutnya, dan jam serta informasi pengumuman.
   4. Supervisor dapat memantau seluruh gedung melalui `/petugas/monitoring`.
2. **Aturan Sistem**:
   - Token display bersifat rahasia dan dapat dicabut (revoke) oleh admin. Token yang dicabut menampilkan halaman "Perangkat tidak terdaftar".
   - Mode tampilan: `antrean` (default), `info` (pengumuman), dan `bergantian` (berganti setiap 15 detik).
   - Koneksi realtime terputus lebih dari 30 detik akan menampilkan indikator offline dan mencoba menyambung ulang secara otomatis.
   - Data antrean pada display hanya menampilkan nomor tiket, bukan nama atau NIK pasien, demi kerahasiaan data medis.

### M. Notifikasi WhatsApp
1. **Cara Kerja**:
   1. Setiap peristiwa penting (booking dikonfirmasi, giliran hampir tiba, pasien dipanggil, pembayaran berhasil, hasil lab siap, sesi dibatalkan) memicu pesan.
   2. Pesan diantrikan dan dikirim melalui WhatsApp Gateway.
   3. Status pengiriman dicatat di tabel `notification_logs`.
2. **Aturan Sistem**:
   - Pesan menggunakan template resmi yang disetujui sesuai ketentuan penyedia gateway.
   - Pesan giliran hampir tiba dikirim ketika tiket berada di urutan ketiga.
   - Pesan tidak boleh berisi diagnosis, hasil pemeriksaan, atau data medis detail. Hanya informasi administratif dan tautan ke aplikasi.
   - Kegagalan pengiriman dicoba ulang maksimal tiga kali dengan jeda eksponensial.

### N. Integrasi EMR (Sinkronisasi Satu Arah pada Versi Awal)
1. **Cara Kerja**:
   1. Saat pasien didaftarkan atau diperbarui, sistem mengirim data demografi ke endpoint EMR melalui format FHIR-lite (`Patient` resource).
   2. Saat kunjungan dibuat, sistem mengirim `Encounter` ke EMR.
   3. Respons EMR (nomor RM EMR) disimpan kembali di tabel `profiles` pada kolom `emr_patient_id`.
2. **Aturan Sistem**:
   - Seluruh komunikasi menggunakan HTTPS dan API key dari variabel lingkungan.
   - Setiap sinkronisasi dicatat di tabel `emr_sync_logs` dengan status dan payload terenkripsi bila diperlukan.
   - Jika EMR tidak tersedia, sistem menempatkan permintaan di antrean dan mencoba ulang setiap 10 menit.

---

## 7. Alur Navigasi & Arsitektur Layout
*Peta navigasi alur halaman dan struktur tata letak (layout).*

### Arsitektur Layout (Persisten)
- **Public Layout**: Menggunakan Header (navbar statis di atas dengan logo Antrean Sehat, menu Layanan, Jadwal Dokter, FAQ, Kontak, dan tombol Masuk) dan Footer (alamat RS, kontak darurat, dan tautan kebijakan privasi). Halaman `/display/[token]` tidak menggunakan layout ini.
- **Patient Dashboard Layout**: Sidebar kiri (fixed di desktop, berubah menjadi Sheet di mobile) berisi menu Dasbor, Booking, Antrean Saya, Pembayaran, Riwayat, dan Profil. Header kecil di atas berisi nama pasien dan tombol keluar.
- **Staff Layout (Petugas)**: Sidebar kiri dengan menu sesuai peran yang ditugaskan, header berisi nama unit aktif dan indikator koneksi realtime.
- **Admin Layout**: Sidebar kiri dengan seluruh menu admin, header berisi lokasi aktif (dropdown untuk berpindah gedung) dan profil admin.
- **Display Layout**: Tanpa navbar, tanpa sidebar, layar penuh, dan otomatis menyesuaikan resolusi TV.

### Bagan Alur (Flowchart)
```mermaid
flowchart TD
    A[Pengunjung] --> B[Beranda]
    B --> C{Sudah Login?}
    C -- Belum --> D[Masuk NIK + OTP WhatsApp]
    D --> E{Pasien Baru?}
    E -- Ya --> F[Lengkapi Data Diri]
    E -- Tidak --> G[Dashboard Pasien]
    F --> G
    C -- Ya --> G
    G --> H{Pilih Layanan}
    H --> I[Booking Poliklinik]
    H --> J[Booking Lab / Radiologi]
    H --> K[Booking Farmasi]
    H --> L[Pendaftaran Rawat Inap]
    I --> M[Tiket & Notifikasi WhatsApp]
    J --> M
    K --> M
    L --> N{Kamar Tersedia?}
    N -- Ya --> M
    N -- Tidak --> O[Waiting List Kamar]
    O --> M
    M --> P[Check-in di Unit]
    P --> Q[Panel Petugas: Panggil]
    Q --> R{Pasien Hadir?}
    R -- Ya --> S[Layani & Selesai]
    R -- Tidak --> T{Panggil Ulang < 3 kali?}
    T -- Ya --> Q
    T -- Tidak --> U[Lewati]
    U --> V{Dipanggil Ulang dalam 15 menit?}
    V -- Ya --> Q
    V -- Tidak --> W[Status Batal / Tidak Hadir]
    S --> X[Invoice Dibuat]
    X --> Y{Metode Bayar}
    Y -- Online --> Z[Midtrans Snap]
    Y -- Tunai --> AA[Kasir Catat Pembayaran]
    Z --> AB[Webhook Verifikasi Signature]
    AB --> AC[Invoice Lunas & Kuitansi]
    AA --> AC
```

---

## 8. Kebutuhan Non-Fungsional (SEO, Keamanan, & Performa)
*Syarat wajib agar website siap rilis ke publik (production-ready).*

- **SEO**:
  - Setiap halaman publik wajib memiliki tag `<title>` dinamis (contoh: "Jadwal Dokter Poliklinik Anak | Antrean Sehat"), meta description unik, dan canonical URL.
  - Open Graph (OG) tags dan Twitter Card untuk setiap halaman publik. Gambar OG default disimpan di `/public/og/default.png`.
  - Gunakan `generateMetadata` pada App Router untuk halaman dinamis `/layanan/[slug]`.
  - Sediakan `sitemap.xml` dan `robots.txt`. Halaman privat (dashboard, petugas, admin, dan display) diberi `noindex`.
  - Struktur heading semantik (satu H1 per halaman) dan atribut `alt` pada seluruh gambar.
- **Keamanan**:
  - Proteksi CSRF untuk seluruh Server Actions dan endpoint mutasi. Gunakan token origin check bawaan Next.js dan verifikasi header `Origin`.
  - Sanitasi input untuk mencegah XSS. Seluruh input teks dibersihkan sebelum disimpan, dan output dirender menggunakan escape bawaan React tanpa `dangerouslySetInnerHTML`.
  - Validasi sisi server wajib menggunakan Zod pada setiap Server Action dan route handler.
  - Row Level Security (RLS) Supabase diaktifkan pada seluruh tabel. Pasien hanya dapat membaca data miliknya sendiri. Petugas dibatasi berdasarkan `staff_assignments`.
  - Service role key Supabase hanya digunakan di server dan tidak pernah diekspos ke browser.
  - Verifikasi signature Midtrans pada setiap webhook dan kunci server Midtrans hanya tersimpan di variabel lingkungan server.
  - Rate limiting pada endpoint OTP, login, booking, dan webhook (berbasis IP dan nomor WhatsApp).
  - Header keamanan: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY` (kecuali route display), dan `Referrer-Policy: strict-origin-when-cross-origin`.
  - Data NIK dan nomor WhatsApp disimpan dengan kolom terpisah dan diakses hanya oleh peran yang berwenang. Audit log untuk setiap akses data pasien.
  - Dokumen pendukung disimpan di bucket privat dan hanya dapat diakses melalui signed URL berumur pendek.
  - Kepatuhan terhadap kebijakan perlindungan data pribadi yang berlaku di Indonesia. Persetujuan pemrosesan data wajib dicentang saat pendaftaran.
- **Performa**:
  - Gunakan komponen `<Image>` dari Next.js untuk seluruh gambar dan atur ukuran serta format WebP atau AVIF.
  - Lazy loading untuk komponen berat seperti peta gedung, grafik dashboard, dan modal Snap menggunakan `next/dynamic`.
  - Caching untuk data publik (layanan dan jadwal dokter) dengan `revalidate` 60 detik dan invalidasi saat admin memperbarui data.
  - Display TV menggunakan koneksi realtime dan fallback polling setiap 5 detik bila koneksi terputus.
  - Target Core Web Vitals: LCP di bawah 2,5 detik, INP di bawah 200 ms, dan CLS di bawah 0,1 pada perangkat mobile kelas menengah.
  - Indeks database pada kolom `(unit_id, tanggal, status)`, `(patient_id)`, dan `(midtrans_order_id)` untuk menjaga performa query.

---

## 9. Panduan Bahasa, Copywriting, & Data Dummy
*Panduan nada bicara (Tone of Voice) dan contoh data agar prototipe terasa nyata.*

- **Gaya Bahasa**: Profesional, empatik, dan membumi. Gunakan kata "Anda" untuk pasien dan "Kami" untuk rumah sakit. Hindari istilah medis yang rumit di halaman pasien, dan gunakan bahasa sederhana yang mudah dipahami masyarakat umum. Untuk petugas, gunakan istilah teknis medis yang baku.
- **Contoh Kalimat Pesan Sistem**:
  - Konfirmasi booking: "Terima kasih, Bapak Budi. Booking Anda untuk Poliklinik Penyakit Dalam pada 14 Juni 2025 sesi pagi telah kami terima. Nomor antrean Anda POL-D-014."
  - Giliran hampir tiba: "Nomor Anda POL-D-014 tinggal 2 antrean lagi. Mohon bersiap di ruang tunggu Gedung A Lantai 2."
  - Dipanggil: "Nomor POL-D-014 dipanggil. Silakan menuju Ruang Periksa 3, Gedung A Lantai 2. Waktu tunggu Anda 3 menit."
  - Pembayaran berhasil: "Pembayaran Rp 185.000 untuk invoice INV-2025-000521 telah kami terima. Kuitansi terlampir pada aplikasi."
- **Instruksi Data Dummy**: JANGAN PERNAH MENGGUNAKAN "Lorem Ipsum". Selalu gunakan data dummy berbahasa Indonesia yang relevan dengan konteks rumah sakit. Data dummy NIK harus berformat 16 digit yang fiktif.
  - **Lokasi & Gedung**: RSUD Sejahtera Sehat (Kampus Utama) dengan Gedung A (Rawat Jalan dan Pendaftaran), Gedung B (IGD dan Rawat Inap), dan Gedung C (Penunjang: Laboratorium, Radiologi, dan Farmasi).
  - **Unit Layanan**: Pendaftaran (Loket 1 sampai 4), Poliklinik Penyakit Dalam, Poliklinik Anak, Poliklinik Bedah, Poliklinik Kandungan, Triase IGD, Laboratorium Klinik, Radiologi, Farmasi Rawat Jalan, Kasir, dan Rawat Inap.
  - **Dokter**: dr. Hendra Wijaya, Sp.PD (Penyakit Dalam). dr. Ratna Kusumawati, Sp.A (Anak). dr. Yudi Prasetyo, Sp.B (Bedah). dr. Sari Indah Lestari, Sp.OG (Kandungan).
  - **Pasien Dummy**: Budi Santoso (lansia, 68 tahun), Siti Aminah (ibu hamil), Agus Setiawan (disabilitas, pengguna kursi roda), Dewi Anggraini (pasien umum), dan Rudi Hartono (pasien IGD triase kuning).
  - **Contoh Nomor Tiket**: POL-D-014, POL-A-007, TRG-M-001, TRG-K-003, LAB-021, RAD-USG-005, FAR-RC-012, KAS-044.
  - **Contoh Invoice**: INV-2025-000521 dengan rincian konsultasi dokter Rp 75.000, pemeriksaan laboratorium Rp 110.000, dan total Rp 185.000.
  - **Contoh Kamar Rawat Inap**: Kelas 1 (Melati 201, kapasitas 4), Kelas 2 (Anggrek 105, kapasitas 6), dan VIP (Dahlia 301, kapasitas 2).

---

## 10. Fondasi Teknis (Untuk Tim Pengembang / Programmer & AI)
*Petunjuk arsitektur teknis spesifik.*

- **Bahasa & Framework**: Next.js 15 (App Router) dengan TypeScript, React Server Components, dan Server Actions. Validasi menggunakan Zod, form menggunakan React Hook Form.
- **Tampilan Antarmuka (UI)**: Tailwind CSS v4, shadcn/ui sebagai component library, Lucide React untuk ikon, Sonner untuk notifikasi toast, dan TanStack Query untuk data client-side yang membutuhkan cache.
- **Autentikasi**: Supabase Auth.
  - Pasien masuk dengan OTP melalui kanal telepon (phone provider) di Supabase Auth. Pengiriman OTP dialihkan ke WhatsApp Gateway melalui Send SMS Hook (Auth Hook) sehingga pesan OTP dikirim sebagai WhatsApp.
  - NIK disimpan di tabel `profiles` dengan constraint 16 digit dan unik. NIK tidak dijadikan kredensial login.
  - Petugas dan admin masuk dengan email dan kata sandi. Peran (`role`) dan penugasan unit disematkan sebagai custom claim melalui Custom Access Token Hook.
  - Pemanggilan `supabase.auth.getUser()` di server untuk memvalidasi sesi, bukan hanya `getSession()`.
- **Basis Data (Database)**: Supabase PostgreSQL dengan Row Level Security (RLS) aktif pada seluruh tabel. Akses dari aplikasi menggunakan `@supabase/ssr` untuk Server Components dan Server Actions. Migrasi dikelola melalui Supabase CLI (`supabase/migrations`).
- **Penyimpanan Berkas (Storage)**: Supabase Storage.
  - Bucket `dokumen-pasien` (privat): dokumen pendukung prioritas dan pembaruan data, akses melalui signed URL.
  - Bucket `hasil-penunjang` (privat): hasil laboratorium dan radiologi.
  - Bucket `aset-publik` (publik): logo, gambar layanan, dan gambar pengumuman display TV.
- **Realtime**: Supabase Realtime pada tabel `queue_tickets`, `display_screens`, dan `unit_stats`, dengan filter berdasarkan `unit_id` dan `building_id`.
- **Pembayaran**: Midtrans (Snap API untuk pembayaran online, Core API untuk pemeriksaan status, dan HTTP Notification sebagai webhook). Dokumentasi resmi: https://docs.midtrans.com
- **Notifikasi**: WhatsApp Gateway melalui REST API penyedia gateway yang dipilih. Pesan dikirim melalui route handler dengan antrean pekerjaan (job queue) berbasis tabel `notification_jobs`.
- **Penjadwalan (Scheduler)**: Supabase `pg_cron` atau Vercel Cron untuk perhitungan estimasi waktu tunggu, pembatalan otomatis tiket tidak hadir, dan pengulangan pengiriman notifikasi.

### Struktur Skema Database Nyata
*(Skema SQL untuk Supabase PostgreSQL. Jalankan melalui Supabase SQL Editor atau migrasi Supabase CLI.)*

```sql
-- ============================================================
-- EXTENSION & ENUM
-- ============================================================
create extension if not exists "pgcrypto";

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
-- LOKASI, GEDUNG, DAN UNIT
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
-- PENGGUNA & PASIEN
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
-- DOKTER & KUOTA SESI
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
-- TIKET ANTREAN & LOG
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
-- PEMBAYARAN (MIDTRANS)
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
-- RAWAT INAP
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
-- DISPLAY, NOTIFIKASI, & INTEGRASI
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
-- ROW LEVEL SECURITY (CONTOH KEBIJAKAN UTAMA)
-- ============================================================
alter table profiles enable row level security;
alter table queue_tickets enable row level security;
alter table invoices enable row level security;

-- Pasien hanya dapat membaca profil sendiri
create policy "pasien_baca_profil_sendiri" on profiles
  for select using (auth.uid() = id);

-- Pasien hanya dapat membaca tiket miliknya
create policy "pasien_baca_tiket_sendiri" on queue_tickets
  for select using (auth.uid() = patient_id);

-- Petugas hanya dapat mengubah tiket pada unit yang ditugaskan
create policy "petugas_kelola_tiket_unit" on queue_tickets
  for update using (
    exists (
      select 1 from staff_assignments sa
      where sa.profile_id = auth.uid() and sa.unit_id = queue_tickets.unit_id
    )
  );

-- Kebijakan lengkap untuk setiap tabel ditulis pada Task 2.1

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table queue_tickets;
alter publication supabase_realtime add table display_screens;
alter publication supabase_realtime add table unit_stats;

-- ============================================================
-- FUNGSI ATOMIK: BOOKING KUOTA SESI
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
```

### Variabel Lingkungan (`.env.example`)
```env
# ============================================================
# APLIKASI
# ============================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Antrean Sehat

# ============================================================
# SUPABASE (Auth, PostgreSQL, Storage, Realtime)
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_SEND_SMS_HOOK_SECRET=v1,whsec_your-hook-secret
SUPABASE_STORAGE_BUCKET_DOKUMEN=dokumen-pasien
SUPABASE_STORAGE_BUCKET_HASIL=hasil-penunjang

# ============================================================
# MIDTRANS (Pembayaran)
# Dokumentasi: https://docs.midtrans.com
# ============================================================
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_MERCHANT_ID=G123456789
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_NOTIFICATION_URL=https://antreansehat.rsud.go.id/api/webhooks/midtrans

# ============================================================
# WHATSAPP GATEWAY (Notifikasi & OTP)
# ============================================================
WA_GATEWAY_BASE_URL=https://api.provider-wa.example.com
WA_GATEWAY_API_KEY=your-wa-gateway-api-key
WA_SENDER_NUMBER=6281234567890
WA_TEMPLATE_LANG=id

# ============================================================
# INTEGRASI EMR (FHIR-lite, sinkronisasi satu arah)
# ============================================================
EMR_FHIR_BASE_URL=https://emr.rsud.example.go.id/fhir
EMR_API_KEY=your-emr-api-key
EMR_SYNC_ENABLED=false

# ============================================================
# KEAMANAN & PENJADWALAN
# ============================================================
CRON_SECRET=generate-random-string-32-char
RATE_LIMIT_OTP_PER_15_MIN=3
SESSION_IDLE_TIMEOUT_MINUTES=30
```

---

## 11. Tahapan Pengerjaan & Task Breakdown (Actionable Work Breakdown Structure)
*Daftar tugas terstruktur dan terurut (Atomic Tasks) dengan format checklist markdown `- [ ] **Task X.Y`. Dirancang khusus agar pengguna dapat menginstruksikan AI Coding Assistant (Antigravity, Cursor, Claude Code, Roo Code, dll.) untuk mengeksekusi proyek langkah demi langkah secara terukur, modular, dan bebas dari kehabisan context window.*

### Tahap 1: Fondasi Proyek, UI/UX, & Semua Halaman (Dummy Data)
*Tujuan: Membangun seluruh antarmuka visual secara 100% lengkap dan responsif menggunakan data dummy sebelum menyentuh database.*
- [ ] **Task 1.1 (Foundations & Design System)**: Inisialisasi proyek Next.js 15 dengan App Router dan TypeScript. Konfigurasi Tailwind CSS v4 dengan token warna Primary Teal, Surface, Border, dan warna triase (merah, kuning, hijau). Muat font Plus Jakarta Sans (heading) dan Inter (body) melalui `next/font/google`, serta JetBrains Mono untuk nomor antrean TV. Instal komponen shadcn/ui: Button, Card, Input, Label, Select, Dialog, Sheet, Table, Badge, Dropdown Menu, Tabs, Calendar, Form, Tooltip, Skeleton, Separator, dan Sonner. Pasang Lucide React dan buat file `lib/constants.ts` berisi nama aplikasi "Antrean Sehat".
- [ ] **Task 1.2 (Layouts & Persistent Navigation)**: Buat Root Layout, Public Layout (`app/(public)/layout.tsx`) dengan Header berisi navbar dan Footer, Patient Dashboard Layout (`app/(pasien)/layout.tsx`) dengan Sidebar fixed desktop dan Sheet mobile berisi menu Dasbor, Booking, Antrean Saya, Pembayaran, Riwayat, dan Profil, Staff Layout (`app/(petugas)/layout.tsx`), Admin Layout (`app/(admin)/layout.tsx`) dengan dropdown pemilihan gedung, serta Display Layout (`app/display/layout.tsx`) layar penuh tanpa navbar.
- [ ] **Task 1.3 (Public Pages)**: Buat halaman `/` (hero, ringkasan unit, dokter hari ini, langkah booking), `/layanan` (kartu unit dengan filter gedung), `/layanan/[slug]` (detail unit dan persyaratan dokumen), `/jadwal-dokter` (tabel jadwal dengan indikator kuota dummy), `/tentang`, `/faq` (accordion), dan `/kontak` (formulir kontak dummy). Seluruh halaman menggunakan data dari `lib/dummy/layanan.ts` dan `lib/dummy/dokter.ts`, serta menyertakan metadata SEO dinamis.
- [ ] **Task 1.4 (Auth Pages UI)**: Buat halaman `/masuk` (input NIK, nomor WhatsApp, dan OTP enam digit dengan timer hitung mundur 60 detik) dan `/daftar` (formulir data diri pasien baru, validasi NIK 16 digit menggunakan Zod, dan checkbox persetujuan privasi). Gunakan data dummy untuk simulasi OTP tanpa koneksi ke Supabase.
- [ ] **Task 1.5 (Patient Area Pages)**: Buat halaman `/dashboard`, `/booking` (pilih layanan), `/booking/poliklinik` (pilih dokter, tanggal, sesi, dan sisa kuota dummy), `/booking/laboratorium`, `/booking/radiologi` (pilih modalitas), `/booking/farmasi` (pilih jenis layanan), `/booking/rawat-inap` (formulir kelas dan indikasi), `/antrean/saya` (daftar tiket aktif dummy), `/antrean/[ticketId]` (detail tiket dengan QR code dummy dan timeline status), `/pembayaran` (daftar invoice), `/pembayaran/[invoiceId]` (rincian dan tombol Snap dummy), `/riwayat`, dan `/profil` (form edit data dan unggah dokumen prioritas dummy). Setiap halaman menggunakan data dummy dari `lib/dummy/pasien.ts`.
- [ ] **Task 1.6 (Staff Pages: Pendaftaran & Triase)**: Buat halaman `/petugas/dashboard`, `/petugas/pendaftaran` dengan tab Pasien Baru, Pasien Lama Tanpa RM Digital, dan Update Data, `/petugas/pendaftaran/pasien-baru`, `/petugas/pendaftaran/pasien-lama`, `/petugas/pendaftaran/update/[patientId]` (dengan tabel riwayat perubahan dummy), dan `/petugas/triase` (panel klasifikasi merah, kuning, hijau dengan daftar tunggu berurutan dummy).
- [ ] **Task 1.7 (Staff Pages: Panel Antrean & Operasional)**: Buat halaman `/petugas/panel/[unitSlug]` (tombol Panggil Berikutnya, Panggil Ulang dengan penghitung tiga kali, Lewati, Layani, Selesai, dan Daftar Lewati dummy), `/petugas/kuota-dokter` (kalender dan tabel kuota dengan input edit dummy), `/petugas/farmasi` (antrean obat dengan kategori rawat jalan, pascarawat inap, racik, dan konsultasi), `/petugas/kasir` (daftar tagihan, pencatatan tunai, dan cetak kuitansi dummy), `/petugas/rawat-inap` (waiting list kamar dan antrean pre-operasi dummy), `/petugas/display` (daftar layar dan token dummy), dan `/petugas/monitoring` (peta gedung dan kartu status unit dummy).
- [ ] **Task 1.8 (Admin Pages & Public Display)**: Buat halaman `/admin/dashboard` (kartu statistik dan grafik dummy dengan Recharts), `/admin/lokasi`, `/admin/unit`, `/admin/dokter`, `/admin/pengguna`, `/admin/laporan` (filter dan tabel ekspor dummy), `/admin/integrasi` (status kartu WhatsApp, Midtrans, dan EMR dummy), `/admin/notifikasi` (tabel log dummy), serta halaman publik `/display/[token]` yang menampilkan nomor aktif per unit dengan mode antrean, info, dan bergantian menggunakan data dummy.

### Tahap 2: Database, Autentikasi, & Integrasi Data Dinamis
*Tujuan: Menghidupkan aplikasi dengan database Supabase PostgreSQL, autentikasi NIK dan OTP WhatsApp, Storage, serta Server Actions.*
- [ ] **Task 2.1 (Database Schema & Migrations)**: Buat migrasi Supabase CLI di `supabase/migrations` berisi seluruh enum dan tabel pada Bab 10 (`buildings`, `units`, `counters`, `profiles`, `staff_assignments`, `patient_change_logs`, `doctors`, `doctor_sessions`, `queue_tickets`, `queue_events`, `unit_stats`, `invoices`, `invoice_items`, `rooms`, `inpatient_requests`, `display_screens`, `notification_jobs`, `emr_sync_logs`). Tulis kebijakan RLS lengkap untuk setiap tabel, fungsi `book_doctor_session`, dan publikasi realtime. Buat `supabase/seed.sql` berisi data dummy gedung, unit, dokter, sesi, kamar, dan pasien sesuai Bab 9.
- [ ] **Task 2.2 (Authentication NIK + OTP WhatsApp)**: Konfigurasi phone provider di Supabase Auth dan aktifkan Send SMS Hook yang mengarah ke route handler `app/api/auth/send-sms-hook/route.ts`. Route ini memverifikasi header signature menggunakan `SUPABASE_SEND_SMS_HOOK_SECRET` lalu meneruskan kode OTP ke WhatsApp Gateway. Hubungkan form `/masuk` dan `/daftar` dengan Server Actions `signInWithOtp` dan `verifyOtp`. Tambahkan validasi NIK 16 digit dan normalisasi nomor WhatsApp ke format `62`. Pasang rate limit OTP (maksimal 5 percobaan verifikasi, 3 permintaan per 15 menit).
- [ ] **Task 2.3 (Route Middleware & Role Guard)**: Buat `middleware.ts` yang memvalidasi sesi menggunakan `supabase.auth.getUser()`, membaca custom claim `role` dan penugasan unit, serta mengarahkan pengguna: pasien ke `/dashboard`, petugas ke `/petugas/dashboard`, dan admin ke `/admin/dashboard`. Halaman publik dan `/display/[token]` tetap dapat diakses tanpa login. Buat Custom Access Token Hook yang menyematkan `role` dan `unit_ids` ke JWT.
- [ ] **Task 2.4 (Storage Setup)**: Buat bucket `dokumen-pasien` dan `hasil-penunjang` (privat) serta `aset-publik` (publik) melalui migrasi. Tulis kebijakan Storage agar pasien hanya dapat mengunggah dan membaca berkas miliknya. Buat utilitas `lib/storage.ts` untuk unggah dengan validasi ukuran maksimal 2 MB dan format JPG, PNG, PDF, serta pembuatan signed URL berumur 15 menit.
- [ ] **Task 2.5 (API Endpoints & Server Actions: Pasien & Pendaftaran)**: Buat Server Actions untuk `createPatient` (pasien baru dan pasien lama tanpa RM digital), `updatePatient` dengan pencatatan ke `patient_change_logs`, `generateNoRm` dengan format `RM-YYYY-XXXXXX`, dan `uploadPriorityDocument`. Seluruh input divalidasi dengan Zod dan dijalankan dengan pengecekan CSRF.
- [ ] **Task 2.6 (API Endpoints & Server Actions: Booking & Antrean)**: Buat Server Actions `createBooking` (validasi H-7 hingga H-0, satu tiket aktif per unit per hari, pemanggilan fungsi `book_doctor_session` secara atomik), `cancelBooking` (batas dua jam sebelum sesi), `checkInTicket`, `generateTicketNumber` dengan prefiks unit, dan `getEstimatedWait` berdasarkan tabel `unit_stats`.
- [ ] **Task 2.7 (API Endpoints & Server Actions: Panel Petugas)**: Buat Server Actions `callNextTicket` (urutan triase, prioritas, lalu nomor urut), `recallTicket` (maksimal tiga kali), `skipTicket` (aturan triase merah tidak dapat dilewati, dua kali lewati mengembalikan ke urutan akhir), `serveTicket`, `completeTicket`, dan `moveTriageLevel`. Setiap aksi menulis baris ke `queue_events`. Buat `setDoctorQuota` dengan validasi kuota tidak boleh lebih kecil dari `terpakai`.
- [ ] **Task 2.8 (API Endpoints & Server Actions: Rawat Inap, Farmasi, Kasir, & Display)**: Buat Server Actions `createInpatientRequest`, `assignRoom` (update `terisi` secara atomik), `createInvoice`, `recordCashPayment` (hanya untuk status belum bayar atau pending), `createDisplayScreen`, `revokeDisplayToken`, dan `updateDisplayMode`. Buat seed dummy untuk seluruh tabel.
- [ ] **Task 2.9 (Frontend Data Binding & Mutations)**: Hubungkan seluruh halaman dari Tahap 1 dengan data dinamis dari Supabase. Ganti seluruh data dummy dengan query Server Components dan mutasi Server Actions. Gunakan `revalidatePath` dan `revalidateTag` untuk invalidasi cache. Pasang Supabase Realtime pada panel petugas, halaman `/antrean/saya`, dan `/display/[token]` dengan fallback polling setiap 5 detik.

### Tahap 3: Integrasi Pihak Ketiga, Keamanan, SEO, & Deployment
*Tujuan: Menyempurnakan integrasi eksternal (Midtrans, WhatsApp Gateway, EMR), optimasi performa, keamanan, dan rilis ke production.*
- [ ] **Task 3.1 (Midtrans Snap & Webhook)**: Buat `lib/midtrans.ts` untuk membuat transaksi Snap (Snap API) dengan order ID format `ANT-[YYYYMMDD]-[INVOICE_NO]`. Simpan `snap_token` dan `midtrans_order_id` ke tabel `invoices`. Buat route handler `app/api/webhooks/midtrans/route.ts` yang memverifikasi `signature_key` dengan SHA512 (`order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY`), menolak signature tidak valid dengan HTTP 403, bersifat idempoten, dan memperbarui status invoice serta `paid_at`. Integrasikan Snap.js di halaman `/pembayaran/[invoiceId]` menggunakan `next/dynamic`. Rujuk dokumentasi resmi di https://docs.midtrans.com.
- [ ] **Task 3.2 (WhatsApp Gateway & Job Queue)**: Buat `lib/wa.ts` sebagai klien WhatsApp Gateway melalui `WA_GATEWAY_BASE_URL` dan `WA_GATEWAY_API_KEY`. Buat template pesan untuk konfirmasi booking, giliran hampir tiba (urutan ketiga), dipanggil, pembayaran berhasil, hasil lab siap, dan sesi dibatalkan. Buat worker `app/api/cron/notifications/route.ts` yang dilindungi `CRON_SECRET` dan memproses tabel `notification_jobs` dengan retry tiga kali dan jeda eksponensial. Catat status ke `notification_jobs`.
- [ ] **Task 3.3 (EMR Integration, FHIR-lite)**: Buat `lib/emr.ts` untuk mengirim resource `Patient` dan `Encounter` ke `EMR_FHIR_BASE_URL` dengan header API key. Simpan `emr_patient_id` ke `profiles` dan catat setiap sinkronisasi di `emr_sync_logs`. Aktifkan hanya bila `EMR_SYNC_ENABLED=true`. Jika gagal, tulis permintaan ke antrean dan coba ulang melalui cron setiap 10 menit.
- [ ] **Task 3.4 (Penjadwalan & Estimasi Waktu Tunggu)**: Buat fungsi `app/api/cron/unit-stats/route.ts` yang dijalankan setiap satu menit untuk menghitung rata-rata durasi layanan dari 50 layanan terakhir per unit, lalu memperbarui `unit_stats` dan `estimasi_menit` pada tiket aktif. Buat cron harian untuk membatalkan tiket berstatus `menunggu` yang lewat jam sesi dengan alasan `tidak_hadir`. Konfigurasikan jadwal pada `vercel.json` atau `pg_cron`.
- [ ] **Task 3.5 (Keamanan & Non-Fungsional)**: Pasang rate limiting berbasis IP dan nomor WhatsApp untuk endpoint OTP, login, booking, dan webhook menggunakan Upstash Redis atau tabel Postgres. Terapkan header keamanan (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, Referrer-Policy) melalui `next.config.ts`, kecuali route display. Verifikasi sanitasi input XSS dan validasi Zod di setiap Server Action. Pasang audit log untuk akses data pasien.
- [ ] **Task 3.6 (SEO, Metadata & Performa)**: Pasang `generateMetadata` dinamis untuk setiap halaman publik, Open Graph dan Twitter Card, `app/sitemap.ts`, dan `app/robots.ts` (noindex untuk area privat dan display). Optimalkan seluruh gambar dengan `<Image>`, lazy load komponen berat, dan atur `revalidate` 60 detik untuk data publik. Verifikasi target Core Web Vitals.
- [ ] **Task 3.7 (End-to-End Testing & Bugfix)**: Uji seluruh alur pengguna: registrasi NIK dan OTP, booking poliklinik sampai pembayaran Midtrans Sandbox, alur triase IGD, panggil ulang dan lewati, notifikasi WhatsApp, display TV realtime, monitoring multi-gedung, dan rawat inap. Uji webhook Midtrans menggunakan simulator Sandbox. Perbaiki error, glitch responsif, dan optimasi query.
- [ ] **Task 3.8 (Production Build & Deployment)**: Konfigurasi `.env.production` dan variabel lingkungan di hosting (Vercel atau VPS dengan Docker). Set `MIDTRANS_IS_PRODUCTION=true` setelah verifikasi kredensial produksi. Jalankan migrasi produksi dengan Supabase CLI, verifikasi kelulusan `npm run build`, konfigurasikan domain dan SSL, serta daftarkan URL notifikasi Midtrans dan Send SMS Hook pada dashboard masing-masing layanan.

---

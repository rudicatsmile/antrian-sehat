import { HOSPITAL_NAME } from "./constants";

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type NotificationType =
  | "booking_konfirmasi"
  | "giliran_mendekat"
  | "dipanggil"
  | "pembayaran_berhasil"
  | "hasil_lab_siap"
  | "sesi_dibatalkan";

/**
 * Normalizes phone number into 62...
 */
export function formatWhatsAppTarget(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Standard message templates according to PRD Bab 7 & Task 3.2
 */
export const WhatsAppTemplates = {
  booking_konfirmasi: (data: {
    nama: string;
    nomorTiket: string;
    unitNama: string;
    dokterNama?: string;
    tanggal: string;
    sesi?: string;
    estimasiMenit?: number;
  }) => `*KONFIRMASI BOOKING ANTREAN ${HOSPITAL_NAME}*
Halo Bapak/Ibu *${data.nama}*,

Pendaftaran antrean Anda berhasil dikonfirmasi dengan rincian:
• *Nomor Tiket*: *${data.nomorTiket}*
• *Unit Layanan*: ${data.unitNama}
${data.dokterNama ? `• *Dokter DPJP*: ${data.dokterNama}\n` : ""}• *Tanggal Kunjungan*: ${data.tanggal}
${data.sesi ? `• *Sesi Layanan*: ${data.sesi.toUpperCase()}\n` : ""}• *Estimasi Waktu Tunggu*: ~${data.estimasiMenit || 15} Menit

Harap hadir 15 menit sebelum sesi dimulai dan tunjukkan tiket digital pada aplikasi Antrean Sehat saat tiba di loket mandiri.
Terima kasih telah mempercayakan kesehatan Anda kepada kami.`,

  giliran_mendekat: (data: {
    nama: string;
    nomorTiket: string;
    unitNama: string;
    sisaDiDepan: number;
    ruangan: string;
  }) => `*PERINGATAN GILIRAN ANTREAN SEGERA TIBA*
Halo *${data.nama}*,

Nomor antrean Anda *${data.nomorTiket}* di *${data.unitNama}* tersisa *${data.sisaDiDepan} pasien lagi* di depan Anda.

Mohon segera menuju ruang tunggu *${data.ruangan}* agar tidak terlewat saat nomor Anda dipanggil oleh petugas.`,

  dipanggil: (data: {
    nama: string;
    nomorTiket: string;
    unitNama: string;
    lokasiRuang: string;
  }) => `*PANGGILAN PEMERIKSAAN MEDIS*
Panggilan untuk *${data.nama}*!

Nomor antrean Anda: *${data.nomorTiket}*
*SEDANG DIPANGGIL* di *${data.lokasiRuang}* (${data.unitNama}).

Silakan segera masuk melalui pintu ruang periksa. Petugas kami telah siap melayani Anda.`,

  pembayaran_berhasil: (data: {
    nama: string;
    nomorInvoice: string;
    total: number;
    metode: string;
  }) => `*KUITANSI PEMBAYARAN LUNAS ${HOSPITAL_NAME}*
Halo *${data.nama}*,

Pembayaran tagihan medis Anda telah kami terima dan diverifikasi lunas:
• *No. Kuitansi/Invoice*: ${data.nomorInvoice}
• *Total Biaya*: Rp ${data.total.toLocaleString("id-ID")}
• *Metode*: ${data.metode}
• *Status*: LUNAS (SETTLED)

Kuitansi resmi digital dapat diunduh kapan saja melalui menu Pembayaran di aplikasi Antrean Sehat.`,

  hasil_lab_siap: (data: {
    nama: string;
    noRm: string;
    jenisPemeriksaan: string;
    unitNama: string;
  }) => `*HASIL PEMERIKSAAN PENUNJANG SIAP*
Halo *${data.nama}* (No. RM: ${data.noRm}),

Hasil pemeriksaan *${data.jenisPemeriksaan}* Anda dari *${data.unitNama}* telah selesai diverifikasi oleh dokter penanggung jawab laboratorium/radiologi.

Dokumen hasil dapat Anda unduh secara aman melalui aplikasi Antrean Sehat atau dikonsultasikan kembali dengan dokter pengirim.`,

  sesi_dibatalkan: (data: {
    nama: string;
    nomorTiket: string;
    dokterNama: string;
    tanggal: string;
    alasan?: string;
  }) => `*PEMBERITAHUAN PENJADWALAN ULANG DOKTER*
Yth. Bapak/Ibu *${data.nama}*,

Kami memohon maaf sebesar-besarnya, jadwal praktik *${data.dokterNama}* untuk tanggal *${data.tanggal}* (Tiket: ${data.nomorTiket}) *DIBATALKAN* karena ${data.alasan || "keadaan darurat penugasan operasional rumah sakit"}.

Tiket Anda telah kami batalkan otomatis. Silakan buka aplikasi Antrean Sehat untuk memilih jadwal sesi dokter pengganti tanpa biaya tambahan.`,
};

/**
 * Sends a text message through the configured WhatsApp Gateway
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<WhatsAppSendResult> {
  const normalizedPhone = formatWhatsAppTarget(phone);
  const baseUrl = process.env.WA_GATEWAY_BASE_URL;
  const apiKey = process.env.WA_GATEWAY_API_KEY;

  const isMock = !baseUrl || baseUrl.includes("provider-wa.example.com") || !apiKey;

  if (isMock) {
    // In Mock mode, log payload and simulate successful delivery
    return {
      success: true,
      messageId: `mock-wa-msg-${Date.now()}`,
    };
  }

  try {
    const res = await fetch(`${baseUrl}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message,
        sender: process.env.WA_SENDER_NUMBER || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message || `Gateway returned status ${res.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id || data.message_id || `wa-${Date.now()}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghubungi WhatsApp Gateway.",
    };
  }
}

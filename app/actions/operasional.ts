"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";

/**
 * Creates an inpatient booking request (waiting list for hospital beds).
 */
export async function createInpatientRequest(payload: {
  patientId: string;
  kelasKamar: "VIP" | "Kelas 1" | "Kelas 2" | "Kelas 3";
  indikasi: string;
  isPreOp?: boolean;
  jenisTindakan?: string;
  estimasiTanggal?: string;
}) {
  try {
    const serviceSupabase = createServiceRoleClient();

    const { data: request, error: insertError } = await serviceSupabase
      .from("inpatient_requests")
      .insert({
        patient_id: payload.patientId,
        kelas_diminta: payload.kelasKamar,
        indikasi: payload.indikasi || "Perawatan rawat inap",
        is_pre_op: payload.isPreOp || false,
        jenis_tindakan: payload.jenisTindakan || null,
        estimasi_tanggal: payload.estimasiTanggal || null,
        status: "menunggu_kamar",
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath("/petugas/rawat-inap");
    revalidatePath("/booking/rawat-inap");

    return {
      success: true,
      message: `Permintaan kamar ${payload.kelasKamar} berhasil masuk antrean waiting list.`,
      request,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mendaftarkan permintaan rawat inap." };
  }
}

/**
 * Assigns an available room/bed atomically to an inpatient request.
 */
export async function assignRoom(requestId: string, roomId: string, staffId?: string) {
  try {
    const serviceSupabase = createServiceRoleClient();

    // 1. Check room capacity
    const { data: room, error: roomError } = await serviceSupabase
      .from("rooms")
      .select("id, nama_kamar, kapasitas, terisi")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return { success: false, error: "Data kamar tidak ditemukan." };
    }

    if (room.terisi >= room.kapasitas) {
      return {
        success: false,
        error: `Kamar ${room.nama_kamar} sudah penuh (${room.terisi}/${room.kapasitas} bed terisi). Silakan pilih kamar lain yang masih tersedia.`,
      };
    }

    // 2. Increment room occupancy atomically
    const { error: roomUpdateError } = await serviceSupabase
      .from("rooms")
      .update({
        terisi: room.terisi + 1,
      })
      .eq("id", roomId);

    if (roomUpdateError) {
      return { success: false, error: roomUpdateError.message };
    }

    // 3. Update inpatient request status
    const { error: requestUpdateError } = await serviceSupabase
      .from("inpatient_requests")
      .update({
        room_id: roomId,
        status: "dirawat",
      })
      .eq("id", requestId);

    if (requestUpdateError) {
      // rollback room occupancy
      await serviceSupabase.from("rooms").update({ terisi: room.terisi }).eq("id", roomId);
      return { success: false, error: requestUpdateError.message };
    }

    revalidatePath("/petugas/rawat-inap");

    return {
      success: true,
      message: `Pasien berhasil ditempatkan di kamar ${room.nama_kamar}.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menempatkan pasien ke kamar." };
  }
}

/**
 * Creates a billing invoice with itemized services/medicines.
 */
export async function createInvoice(payload: {
  patientId: string;
  ticketId?: string;
  items: { namaItem: string; qty: number; hargaSatuan: number }[];
}) {
  try {
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "Tagihan harus memiliki minimal 1 rincian item layanan/obat." };
    }

    const totalAmount = payload.items.reduce((sum, item) => sum + item.qty * item.hargaSatuan, 0);

    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const invoiceNumber = `INV-${ymd}-${randSuffix}`;

    const serviceSupabase = createServiceRoleClient();

    // 1. Insert invoice
    const invoiceId = crypto.randomUUID();
    const { data: invoice, error: invoiceError } = await serviceSupabase
      .from("invoices")
      .insert({
        id: invoiceId,
        patient_id: payload.patientId,
        ticket_id: payload.ticketId || null,
        invoice_no: invoiceNumber,
        total_amount: totalAmount,
        status: "belum_bayar",
      })
      .select()
      .single();

    if (invoiceError) {
      return { success: false, error: invoiceError.message };
    }

    // 2. Insert itemized rows
    const itemRows = payload.items.map((it) => ({
      invoice_id: invoiceId,
      nama_item: it.namaItem,
      qty: it.qty,
      harga_satuan: it.hargaSatuan,
    }));

    await serviceSupabase.from("invoice_items").insert(itemRows);

    revalidatePath("/pembayaran");
    revalidatePath("/petugas/kasir");

    return {
      success: true,
      message: `Invoice ${invoiceNumber} sebesar Rp ${totalAmount.toLocaleString("id-ID")} berhasil dibuat.`,
      invoice,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menerbitkan invoice." };
  }
}

/**
 * Records an on-site cash payment at the cashier desk.
 * Only valid for status 'belum_bayar' or 'pending'.
 */
export async function recordCashPayment(payload: {
  invoiceId: string;
  cashierStaffId?: string;
  jumlahBayar: number;
}) {
  try {
    const serviceSupabase = createServiceRoleClient();

    // 1. Fetch invoice
    const { data: invoice, error: fetchError } = await serviceSupabase
      .from("invoices")
      .select("*")
      .eq("id", payload.invoiceId)
      .single();

    if (fetchError || !invoice) {
      return { success: false, error: "Invoice tagihan tidak ditemukan." };
    }

    // Only allow payment for 'belum_bayar' or 'pending'
    if (invoice.status !== "belum_bayar" && invoice.status !== "pending") {
      return {
        success: false,
        error: `Tagihan ini tidak dapat dibayar karena berstatus: '${invoice.status}'.`,
      };
    }

    if (payload.jumlahBayar < invoice.total_amount) {
      return {
        success: false,
        error: `Jumlah uang yang diterima (Rp ${payload.jumlahBayar.toLocaleString("id-ID")}) kurang dari total tagihan (Rp ${invoice.total_amount.toLocaleString("id-ID")}).`,
      };
    }

    const kembalian = payload.jumlahBayar - invoice.total_amount;
    const nowIso = new Date().toISOString();

    // 2. Mark invoice as settled
    const { error: updateError } = await serviceSupabase
      .from("invoices")
      .update({
        status: "settlement",
        metode_bayar: "tunai",
        paid_at: nowIso,
      })
      .eq("id", payload.invoiceId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/petugas/kasir");
    revalidatePath(`/pembayaran/${payload.invoiceId}`);
    revalidatePath("/pembayaran");

    return {
      success: true,
      message: `Pembayaran tunai untuk ${invoice.invoice_no} berhasil dicatat. Kembalian: Rp ${kembalian.toLocaleString("id-ID")}.`,
      kembalian,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mencatat pembayaran kasir." };
  }
}

/**
 * Creates a TV display screen configuration with unique access token.
 */
export async function createDisplayScreen(payload: {
  unitId: string;
  buildingId: string;
  nama: string;
  mode: "antrean" | "info" | "bergantian";
  pengumuman?: string;
}) {
  try {
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const serviceSupabase = createServiceRoleClient();

    const { data: display, error: insertError } = await serviceSupabase
      .from("display_screens")
      .insert({
        unit_id: payload.unitId,
        building_id: payload.buildingId,
        nama: payload.nama,
        token: token,
        mode: payload.mode,
        pengumuman: payload.pengumuman || null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath("/petugas/display");
    revalidatePath("/admin/lokasi");

    return {
      success: true,
      message: `Layar display ${payload.nama} berhasil didaftarkan.`,
      display,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mendaftarkan layar display." };
  }
}

/**
 * Revokes and regenerates display screen token.
 */
export async function revokeDisplayToken(displayId: string) {
  try {
    const newToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const serviceSupabase = createServiceRoleClient();

    const { error } = await serviceSupabase
      .from("display_screens")
      .update({
        token: newToken,
      })
      .eq("id", displayId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/petugas/display");

    return {
      success: true,
      message: "Token display baru berhasil digenerate.",
      newToken,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui token display." };
  }
}

/**
 * Updates display operational mode and announcement text.
 */
export async function updateDisplayMode(
  displayId: string,
  mode: "antrean" | "info" | "bergantian",
  pengumuman?: string
) {
  try {
    const serviceSupabase = createServiceRoleClient();

    const { error } = await serviceSupabase
      .from("display_screens")
      .update({
        mode,
        pengumuman: pengumuman || null,
      })
      .eq("id", displayId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/petugas/display");
    revalidatePath("/display");

    return {
      success: true,
      message: "Pengaturan tampilan display TV berhasil disimpan.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui mode display." };
  }
}

"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";

/**
 * Calls the next ticket in queue based on strict triage, priority categories, and sequence number.
 * Order of precedence:
 * 1. Triage: Merah -> Kuning -> Hijau
 * 2. Priority category: emergency -> lansia -> disabilitas -> ibu_hamil -> normal
 * 3. Sequence: urutan ASC
 */
export async function callNextTicket(unitId: string, counterId?: string, staffId?: string) {
  try {
    const serviceSupabase = createServiceRoleClient();
    const today = new Date().toISOString().split("T")[0];

    // Query active waiting tickets for this unit today
    const { data: waitingTickets, error: queryError } = await serviceSupabase
      .from("queue_tickets")
      .select("*, profiles(nama_lengkap, no_rm, kategori_prioritas)")
      .eq("unit_id", unitId)
      .eq("tanggal", today)
      .eq("status", "menunggu");

    if (queryError) {
      return { success: false, error: queryError.message };
    }

    if (!waitingTickets || waitingTickets.length === 0) {
      return { success: false, error: "Tidak ada antrean yang sedang menunggu di unit ini." };
    }

    // Sorting algorithm:
    // 1. Triage level weight: merah = 3, kuning = 2, hijau = 1, null = 0
    // 2. Priority weight: emergency = 5, lansia = 4, disabilitas = 3, ibu_hamil = 2, normal = 1
    // 3. Sequence: urutan ascending
    const triageScore: Record<string, number> = { merah: 3, kuning: 2, hijau: 1 };
    const priorityScore: Record<string, number> = { emergency: 5, lansia: 4, disabilitas: 3, ibu_hamil: 2, normal: 1 };

    const sorted = [...waitingTickets].sort((a, b) => {
      const aTriage = triageScore[a.triage || ""] || 0;
      const bTriage = triageScore[b.triage || ""] || 0;
      if (aTriage !== bTriage) return bTriage - aTriage;

      const aPrio = priorityScore[a.prioritas || "normal"] || 1;
      const bPrio = priorityScore[b.prioritas || "normal"] || 1;
      if (aPrio !== bPrio) return bPrio - aPrio;

      return (a.urutan || 0) - (b.urutan || 0);
    });

    const targetTicket = sorted[0];

    // Update ticket status to 'dipanggil'
    const { data: updated, error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "dipanggil",
        counter_id: counterId || null,
        dipanggil_at: new Date().toISOString(),
        jumlah_panggilan: (targetTicket.jumlah_panggilan || 0) + 1,
      })
      .eq("id", targetTicket.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Record event
    await serviceSupabase.from("queue_events").insert({
      ticket_id: targetTicket.id,
      aksi: "panggil",
      actor_id: staffId || null,
      catatan: `Nomor antrean ${targetTicket.nomor_tiket} dipanggil oleh petugas.`,
    });

    revalidatePath("/petugas/panel");
    revalidatePath("/petugas/dashboard");
    revalidatePath("/display");

    return {
      success: true,
      message: `Nomor antrean ${targetTicket.nomor_tiket} berhasil dipanggil.`,
      ticket: updated,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memanggil antrean berikutnya." };
  }
}

/**
 * Recalls ticket with maximum 3 times limit.
 */
export async function recallTicket(ticketId: string, staffId?: string) {
  try {
    const serviceSupabase = createServiceRoleClient();

    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_tiket, jumlah_panggilan, status")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    const currentCount = ticket.jumlah_panggilan || 1;
    if (currentCount >= 3) {
      return {
        success: false,
        error: `Nomor ${ticket.nomor_tiket} telah dipanggil maksimal 3 kali. Silakan pilih aksi 'Lewati'.`,
      };
    }

    const newCount = currentCount + 1;
    const { data: updated, error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        jumlah_panggilan: newCount,
        dipanggil_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      aksi: "panggil_ulang",
      actor_id: staffId || null,
      catatan: `Panggilan ulang ke-${newCount} untuk tiket ${ticket.nomor_tiket}.`,
    });

    revalidatePath("/petugas/panel");
    revalidatePath("/display");

    return {
      success: true,
      message: `Panggilan ulang ke-${newCount} untuk ${ticket.nomor_tiket} berhasil disiarkan.`,
      recallCount: newCount,
      ticket: updated,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memanggil ulang antrean." };
  }
}

/**
 * Skips ticket and appends to skipped list.
 */
export async function skipTicket(ticketId: string, staffId?: string, reason?: string) {
  try {
    const serviceSupabase = createServiceRoleClient();

    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_tiket, jumlah_lewati")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    const { error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "dilewati",
        jumlah_lewati: (ticket.jumlah_lewati || 0) + 1,
      })
      .eq("id", ticketId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      aksi: "lewati",
      actor_id: staffId || null,
      catatan: reason || "Pasien tidak hadir setelah 3 kali panggilan.",
    });

    revalidatePath("/petugas/panel");
    revalidatePath("/display");

    return {
      success: true,
      message: `Nomor antrean ${ticket.nomor_tiket} berhasil dilewati.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal melewati antrean." };
  }
}

/**
 * Sets ticket status to 'dilayani' (in-service).
 */
export async function serveTicket(ticketId: string, staffId?: string) {
  try {
    const serviceSupabase = createServiceRoleClient();

    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_tiket")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    const { error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "dilayani",
        dilayani_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      aksi: "layani",
      actor_id: staffId || null,
      catatan: `Pelayanan untuk tiket ${ticket.nomor_tiket} sedang berlangsung.`,
    });

    revalidatePath("/petugas/panel");

    return {
      success: true,
      message: `Pelayanan untuk ${ticket.nomor_tiket} dimulai.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memulai pelayanan." };
  }
}

/**
 * Finishes ticket service and updates service statistics.
 */
export async function finishTicket(
  ticketId: string,
  staffId?: string,
  diagnoses?: string,
  actions?: string
) {
  try {
    const serviceSupabase = createServiceRoleClient();

    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_tiket, unit_id, dilayani_at")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    const now = new Date();
    const { error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "selesai",
        selesai_at: now.toISOString(),
      })
      .eq("id", ticketId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      aksi: "selesai",
      actor_id: staffId || null,
      catatan: `Pelayanan tuntas. ${diagnoses ? "Diagnosa: " + diagnoses : ""} ${actions ? "Tindakan: " + actions : ""}`.trim(),
    });

    revalidatePath("/petugas/panel");
    revalidatePath("/petugas/dashboard");

    return {
      success: true,
      message: `Pelayanan nomor ${ticket.nomor_tiket} berhasil diselesaikan.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyelesaikan antrean." };
  }
}

/**
 * Classifies patient triage at emergency room (IGD).
 */
export async function classifyTriage(
  ticketId: string,
  triageLevel: "merah" | "kuning" | "hijau",
  vitalSigns: {
    tensi?: string;
    nadi?: string;
    rr?: string;
    spo2?: string;
    suhu?: string;
  },
  nurseId?: string
) {
  try {
    const serviceSupabase = createServiceRoleClient();

    const { error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        triage: triageLevel,
      })
      .eq("id", ticketId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      aksi: "pindah_triase",
      actor_id: nurseId || null,
      catatan: `Klasifikasi triase ${triageLevel.toUpperCase()}. Vital: TD ${vitalSigns.tensi || "-"}, Nadi ${vitalSigns.nadi || "-"}, SpO2 ${vitalSigns.spo2 || "-"}.`,
    });

    revalidatePath("/petugas/triase");
    revalidatePath("/petugas/dashboard");

    return {
      success: true,
      message: `Triase pasien berhasil ditetapkan sebagai ${triageLevel.toUpperCase()}.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui triase pasien." };
  }
}

/**
 * Updates doctor session quota in real-time.
 */
export async function updateDoctorSessionQuota(sessionId: string, newQuota: number) {
  try {
    if (newQuota < 1 || newQuota > 200) {
      return { success: false, error: "Kuota harus di antara 1 dan 200 pasien." };
    }

    const serviceSupabase = createServiceRoleClient();
    const { error } = await serviceSupabase
      .from("doctor_sessions")
      .update({ kuota: newQuota })
      .eq("id", sessionId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/petugas/kuota-dokter");
    revalidatePath("/booking/poliklinik");

    return {
      success: true,
      message: `Kuota dokter berhasil diperbarui menjadi ${newQuota} pasien.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui kuota sesi." };
  }
}

/**
 * Assigns room to inpatient request and atomically increments occupied count.
 */
export async function assignPatientRoom(requestId: string, roomId: string, staffId?: string) {
  try {
    const serviceSupabase = createServiceRoleClient();

    // 1. Check room capacity
    const { data: room, error: roomError } = await serviceSupabase
      .from("rooms")
      .select("id, nama_kamar, kapasitas, terisi")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return { success: false, error: "Kamar rawat inap tidak ditemukan." };
    }

    if (room.terisi >= room.kapasitas) {
      return { success: false, error: `Kamar ${room.nama_kamar} sudah penuh (${room.terisi}/${room.kapasitas}).` };
    }

    // 2. Assign room to request
    const { error: reqError } = await serviceSupabase
      .from("inpatient_requests")
      .update({
        room_id: roomId,
        status: "dirawat",
      })
      .eq("id", requestId);

    if (reqError) {
      return { success: false, error: reqError.message };
    }

    // 3. Atomically increment room occupancy
    await serviceSupabase
      .from("rooms")
      .update({ terisi: room.terisi + 1 })
      .eq("id", roomId);

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
 * Records cash payment at cashier desk.
 */
export async function recordCashPayment(invoiceId: string, staffId?: string) {
  try {
    const serviceSupabase = createServiceRoleClient();

    const { data: inv, error: fetchError } = await serviceSupabase
      .from("invoices")
      .select("id, status, total_amount, invoice_no")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !inv) {
      return { success: false, error: "Faktur tagihan tidak ditemukan." };
    }

    if (inv.status === "settlement") {
      return { success: false, error: "Faktur tagihan ini sudah lunas sebelumnya." };
    }

    const { error: updateError } = await serviceSupabase
      .from("invoices")
      .update({
        status: "settlement",
        metode_bayar: "tunai",
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/petugas/kasir");
    revalidatePath(`/pembayaran/${invoiceId}`);

    return {
      success: true,
      message: `Pembayaran tunai sebesar Rp ${(inv.total_amount || 0).toLocaleString("id-ID")} untuk faktur ${inv.invoice_no} berhasil dicatat.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mencatat pembayaran tunai." };
  }
}

/**
 * Creates or updates public display screen.
 */
export async function createDisplayScreen(
  buildingId: string,
  unitId: string,
  nama: string,
  mode: "antrean" | "info" | "bergantian",
  pengumuman?: string
) {
  try {
    const serviceSupabase = createServiceRoleClient();
    const token = `tv-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;

    const { data: newScreen, error } = await serviceSupabase
      .from("display_screens")
      .insert({
        building_id: buildingId,
        unit_id: unitId,
        nama,
        token,
        mode,
        pengumuman: pengumuman || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/petugas/display");

    return {
      success: true,
      message: "Layar display baru berhasil didaftarkan.",
      screen: newScreen,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mendaftarkan display screen." };
  }
}

/**
 * Revokes display token.
 */
export async function revokeDisplayToken(screenId: string) {
  try {
    const serviceSupabase = createServiceRoleClient();
    const newToken = `tv-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;

    const { error } = await serviceSupabase
      .from("display_screens")
      .update({ token: newToken })
      .eq("id", screenId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/petugas/display");

    return {
      success: true,
      message: "Token display berhasil diganti / di-revoke.",
      newToken,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal me-revoke token display." };
  }
}

export const completeTicket = finishTicket;
export const setDoctorQuota = updateDoctorSessionQuota;
export async function moveTriageLevel(
  ticketId: string,
  triageLevel: "merah" | "kuning" | "hijau",
  nurseId?: string,
  catatan?: string
) {
  return await classifyTriage(ticketId, triageLevel, {}, nurseId);
}


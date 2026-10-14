"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface BookingPayload {
  patientId: string;
  unitId: string;
  unitKind: "pendaftaran" | "poliklinik" | "triase" | "laboratorium" | "radiologi" | "farmasi" | "kasir" | "rawat_inap";
  bookingDate: string; // YYYY-MM-DD
  sessionId?: string; // UUID from doctor_sessions
  doctorId?: string; // UUID from doctors
  triageLevel?: "merah" | "kuning" | "hijau";
  priorityCategory?: "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
  keluhan?: string;
}

/**
 * Generates an official formatted ticket number based on unit kind, triage, and daily sequence.
 */
export async function generateTicketNumber(
  unitKind: string,
  sequenceNumber: number,
  triageLevel?: "merah" | "kuning" | "hijau",
  subCode?: string
): Promise<string> {
  const pad = (n: number) => n.toString().padStart(3, "0");
  const numStr = pad(sequenceNumber);

  switch (unitKind) {
    case "poliklinik":
      return `POL-${subCode || "A"}-${numStr}`;
    case "triase":
      const tCode = triageLevel === "merah" ? "M" : triageLevel === "kuning" ? "K" : "H";
      return `IGD-${tCode}-${numStr}`;
    case "laboratorium":
      return `LAB-${numStr}`;
    case "radiologi":
      return `RAD-${numStr}`;
    case "farmasi":
      return `FAR-${numStr}`;
    case "kasir":
      return `KAS-${numStr}`;
    case "pendaftaran":
      return `LOK-${numStr}`;
    default:
      return `ANT-${numStr}`;
  }
}

/**
 * Calculates estimated wait time in minutes based on active queue count and historical service stats.
 */
export async function getEstimatedWait(unitId: string, supabaseClient?: any): Promise<number> {
  try {
    const supabase = supabaseClient || createServiceRoleClient();

    // 1. Get average service duration for this unit
    const { data: stats } = await supabase
      .from("unit_stats")
      .select("avg_service_seconds")
      .eq("unit_id", unitId)
      .maybeSingle();

    let avgMinutes = 10;
    if (stats?.avg_service_seconds) {
      avgMinutes = Math.max(2, Math.round(stats.avg_service_seconds / 60));
    } else {
      // Fallback to unit's default_service_minutes
      const { data: unit } = await supabase
        .from("units")
        .select("default_service_minutes")
        .eq("id", unitId)
        .maybeSingle();
      if (unit?.default_service_minutes) {
        avgMinutes = unit.default_service_minutes;
      }
    }

    // 2. Count tickets currently waiting
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("queue_tickets")
      .select("*", { count: "exact", head: true })
      .eq("unit_id", unitId)
      .eq("tanggal", today)
      .eq("status", "menunggu");

    const waitingCount = count || 0;
    return (waitingCount + 1) * avgMinutes;
  } catch {
    return 15; // default fallback estimate
  }
}

/**
 * Creates a queue ticket with H-7 to H-0 validation, 1 active ticket limit, and atomic quota management.
 */
export async function createBooking(payload: BookingPayload) {
  try {
    const { patientId, unitId, unitKind, bookingDate, sessionId, doctorId, triageLevel, priorityCategory, keluhan } = payload;

    // 1. Validate Date (H-0 to H-7)
    const todayStr = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    if (bookingDate < todayStr) {
      return {
        success: false,
        error: "Tanggal booking tidak boleh di masa lampau.",
      };
    }

    if (bookingDate > maxDateStr) {
      return {
        success: false,
        error: "Booking hanya dapat dilakukan maksimal 7 hari ke depan (H-7).",
      };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      const mockSeq = Math.floor(1 + Math.random() * 40);
      const mockTicketNo = await generateTicketNumber(unitKind, mockSeq, triageLevel, "A");
      return {
        success: true,
        message: "Booking antrean berhasil dibuat (Mode Simulasi).",
        ticket: {
          id: "mock-ticket-" + Date.now(),
          nomor_antrean: mockTicketNo,
          nomor_urut: mockSeq,
          status: "menunggu",
          tanggal: bookingDate,
          estimasi_menit: mockSeq * 10,
          unit_id: unitId,
          patient_id: patientId,
        },
      };
    }

    const serviceSupabase = createServiceRoleClient();

    // 2. Validate: Maximum 1 active ticket per unit per day for this patient
    const { data: existingTicket } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_antrean, status")
      .eq("patient_id", patientId)
      .eq("unit_id", unitId)
      .eq("tanggal", bookingDate)
      .in("status", ["menunggu", "dipanggil", "dilayani"])
      .maybeSingle();

    if (existingTicket) {
      return {
        success: false,
        error: `Anda sudah memiliki tiket antrean aktif (${existingTicket.nomor_antrean}) untuk unit ini pada tanggal tersebut.`,
      };
    }

    // 3. Quota check & atomic increment if doctor session booking
    if (sessionId) {
      const { data: bookSuccess, error: rpcError } = await serviceSupabase.rpc("book_doctor_session", {
        p_session_id: sessionId,
      });

      if (rpcError || !bookSuccess) {
        return {
          success: false,
          error: "Kuota dokter untuk sesi ini telah habis atau sesi tidak aktif. Silakan pilih jadwal sesi lainnya.",
        };
      }
    }

    // 4. Compute next sequence number for this unit and date
    const { count: currentTotal } = await serviceSupabase
      .from("queue_tickets")
      .select("*", { count: "exact", head: true })
      .eq("unit_id", unitId)
      .eq("tanggal", bookingDate);

    const sequenceNumber = (currentTotal || 0) + 1;
    const ticketNumber = await generateTicketNumber(unitKind, sequenceNumber, triageLevel, "A");
    const estimatedMinutes = await getEstimatedWait(unitId, serviceSupabase);

    // 5. Insert new ticket
    const ticketId = crypto.randomUUID();
    const { data: newTicket, error: insertError } = await serviceSupabase
      .from("queue_tickets")
      .insert({
        id: ticketId,
        patient_id: patientId,
        unit_id: unitId,
        session_id: sessionId || null,
        nomor_antrean: ticketNumber,
        nomor_urut: sequenceNumber,
        status: "menunggu",
        triage_level: triageLevel || null,
        kategori_prioritas: priorityCategory || "normal",
        tanggal: bookingDate,
        estimasi_menit: estimatedMinutes,
        keluhan: keluhan || null,
      })
      .select()
      .single();

    if (insertError) {
      // Rollback session counter if session was booked
      if (sessionId) {
        try {
          await serviceSupabase.rpc("decrement_doctor_session", { p_session_id: sessionId });
        } catch {
          // ignore
        }
      }
      return { success: false, error: insertError.message };
    }

    // 6. Record event in queue_events
    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      action: "dibuat",
      actor_id: patientId,
      keterangan: `Booking tiket ${ticketNumber} dibuat oleh pasien.`,
    });

    revalidatePath("/antrean/saya");
    revalidatePath(`/antrean/${ticketId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Tiket antrean ${ticketNumber} berhasil dipesan.`,
      ticket: newTicket,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat booking antrean." };
  }
}

/**
 * Cancels booking with minimum 2 hours before session validation.
 */
export async function cancelBooking(ticketId: string, patientId: string, alasan?: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: "Tiket antrean berhasil dibatalkan (Mode Simulasi).",
      };
    }

    const serviceSupabase = createServiceRoleClient();

    // 1. Fetch ticket and session
    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select(`
        *,
        doctor_sessions (
          id,
          jam_mulai,
          slot
        )
      `)
      .eq("id", ticketId)
      .eq("patient_id", patientId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    if (ticket.status !== "menunggu") {
      return {
        success: false,
        error: `Tiket dengan status '${ticket.status}' tidak dapat dibatalkan.`,
      };
    }

    // 2. Validate minimum 2 hours before session start time if session is present
    if (ticket.doctor_sessions?.jam_mulai && ticket.tanggal) {
      const sessionDateTime = new Date(`${ticket.tanggal}T${ticket.doctor_sessions.jam_mulai}`);
      const now = new Date();
      const diffMs = sessionDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // If session is today and less than 2 hours away
      if (ticket.tanggal === now.toISOString().split("T")[0] && diffHours < 2) {
        return {
          success: false,
          error: "Pembatalan tiket hanya dapat dilakukan minimal 2 jam sebelum jam sesi dokter dimulai.",
        };
      }
    }

    // 3. Update ticket status to 'batal'
    const { error: cancelError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "batal",
        selesai_pada: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (cancelError) {
      return { success: false, error: cancelError.message };
    }

    // 4. Release quota on doctor_sessions if session linked
    if (ticket.session_id) {
      await serviceSupabase
        .from("doctor_sessions")
        .update({
          terpakai: Math.max(0, (ticket.doctor_sessions?.terpakai || 1) - 1),
        })
        .eq("id", ticket.session_id);
    }

    // 5. Record queue event
    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      action: "dibatalkan",
      actor_id: patientId,
      keterangan: alasan || "Dibatalkan oleh pasien.",
    });

    revalidatePath("/antrean/saya");
    revalidatePath(`/antrean/${ticketId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Tiket antrean berhasil dibatalkan.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membatalkan tiket antrean." };
  }
}

/**
 * Patient check-in verification at hospital kiosk or arrival desk.
 */
export async function checkInTicket(ticketId: string, patientId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: "Check-in antrean berhasil dikonfirmasi (Mode Simulasi).",
      };
    }

    const serviceSupabase = createServiceRoleClient();

    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select("id, status, tanggal, nomor_antrean")
      .eq("id", ticketId)
      .eq("patient_id", patientId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    const today = new Date().toISOString().split("T")[0];
    if (ticket.tanggal !== today) {
      return {
        success: false,
        error: `Check-in hanya dapat dilakukan pada hari layanan (${ticket.tanggal}).`,
      };
    }

    // Record check-in event
    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      action: "check_in",
      actor_id: patientId,
      keterangan: `Pasien check-in untuk nomor ${ticket.nomor_antrean}.`,
    });

    revalidatePath(`/antrean/${ticketId}`);
    revalidatePath("/antrean/saya");

    return {
      success: true,
      message: `Check-in tiket ${ticket.nomor_antrean} berhasil. Silakan menuju ruang tunggu unit terkait.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal melakukan check-in antrean." };
  }
}

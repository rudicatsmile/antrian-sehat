"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";

/**
 * Calls the next ticket in queue based on strict triage, priority categories, and sequence number.
 * Order of precedence:
 * 1. Triage: Merah -> Kuning -> Hijau
 * 2. Priority category: emergency -> lansia -> disabilitas -> ibu_hamil -> normal
 * 3. Sequence number: nomor_urut ASC
 */
export async function callNextTicket(unitId: string, counterId?: string, staffId?: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: "Nomor antrean berhasil dipanggil (Mode Simulasi).",
        ticket: {
          id: "mock-ticket-called-" + Date.now(),
          nomor_antrean: "POL-A-015",
          nomor_urut: 15,
          status: "dipanggil",
        },
      };
    }

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
    // 3. Sequence: nomor_urut ascending
    const triageScore: Record<string, number> = { merah: 3, kuning: 2, hijau: 1 };
    const priorityScore: Record<string, number> = { emergency: 5, lansia: 4, disabilitas: 3, ibu_hamil: 2, normal: 1 };

    const sorted = [...waitingTickets].sort((a, b) => {
      const aTriage = triageScore[a.triage_level || ""] || 0;
      const bTriage = triageScore[b.triage_level || ""] || 0;
      if (aTriage !== bTriage) return bTriage - aTriage;

      const aPriority = priorityScore[a.kategori_prioritas || "normal"] || 1;
      const bPriority = priorityScore[b.kategori_prioritas || "normal"] || 1;
      if (aPriority !== bPriority) return bPriority - aPriority;

      return (a.nomor_urut || 0) - (b.nomor_urut || 0);
    });

    const nextTicket = sorted[0];

    // Update ticket to 'dipanggil'
    const nowIso = new Date().toISOString();
    const { data: updatedTicket, error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "dipanggil",
        dipanggil_pada: nowIso,
      })
      .eq("id", nextTicket.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Record into queue_events
    await serviceSupabase.from("queue_events").insert({
      ticket_id: nextTicket.id,
      action: "dipanggil",
      actor_id: staffId || null,
      keterangan: counterId ? `Dipanggil ke Loket/Ruang ${counterId}` : "Dipanggil oleh petugas",
    });

    revalidatePath(`/petugas/panel/${unitId}`);
    revalidatePath("/display");

    return {
      success: true,
      message: `Nomor antrean ${nextTicket.nomor_antrean} berhasil dipanggil.`,
      ticket: updatedTicket,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memanggil antrean berikutnya." };
  }
}

/**
 * Recalls the current ticket. Strict limit of max 3 recalls.
 */
export async function recallTicket(ticketId: string, staffId?: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: "Nomor antrean berhasil dipanggil ulang (Mode Simulasi - Panggilan ke-2).",
        recallCount: 2,
      };
    }

    const serviceSupabase = createServiceRoleClient();

    // Fetch ticket and check how many times it has been recalled
    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_antrean, unit_id, status")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    const { count: recallEventsCount } = await serviceSupabase
      .from("queue_events")
      .select("*", { count: "exact", head: true })
      .eq("ticket_id", ticketId)
      .eq("action", "dipanggil_ulang");

    const count = recallEventsCount || 0;
    if (count >= 3) {
      return {
        success: false,
        error: `Batas maksimal 3 kali panggilan ulang untuk tiket ${ticket.nomor_antrean} telah tercapai. Silakan lewati nomor ini agar antrean lain dapat berjalan.`,
      };
    }

    // Insert recall event
    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      action: "dipanggil_ulang",
      actor_id: staffId || null,
      keterangan: `Panggilan ulang ke-${count + 1}`,
    });

    revalidatePath(`/petugas/panel/${ticket.unit_id}`);
    revalidatePath("/display");

    return {
      success: true,
      message: `Panggilan ulang ke-${count + 1} untuk ${ticket.nomor_antrean} berhasil disiarkan.`,
      recallCount: count + 1,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memanggil ulang antrean." };
  }
}

/**
 * Skips a ticket.
 * Strict rules:
 * - Red triage CANNOT be skipped.
 * - If skipped 2 times, returns to the end of the queue.
 */
export async function skipTicket(ticketId: string, staffId?: string, alasan?: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: "Tiket antrean berhasil dilewati (Mode Simulasi).",
      };
    }

    const serviceSupabase = createServiceRoleClient();

    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_antrean, unit_id, triage_level, tanggal")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    // RULE 1: Red triage can NEVER be skipped
    if (ticket.triage_level === "merah") {
      return {
        success: false,
        error: "PELANGGARAN PROTOKOL MEDIS: Pasien dengan Triase MERAH (Kritis/Gawat Darurat) TIDAK BOLEH dilewati!",
      };
    }

    // RULE 2: Check how many times already skipped
    const { count: skipEventsCount } = await serviceSupabase
      .from("queue_events")
      .select("*", { count: "exact", head: true })
      .eq("ticket_id", ticketId)
      .eq("action", "dilewati");

    const totalSkips = skipEventsCount || 0;

    if (totalSkips >= 1) {
      // Second skip -> send to end of queue:
      // Find highest sequence number for this unit and date
      const { data: maxTicket } = await serviceSupabase
        .from("queue_tickets")
        .select("nomor_urut")
        .eq("unit_id", ticket.unit_id)
        .eq("tanggal", ticket.tanggal)
        .order("nomor_urut", { ascending: false })
        .limit(1)
        .maybeSingle();

      const newSeq = ((maxTicket?.nomor_urut as number) || 50) + 1;

      await serviceSupabase
        .from("queue_tickets")
        .update({
          status: "menunggu",
          nomor_urut: newSeq,
        })
        .eq("id", ticketId);

      await serviceSupabase.from("queue_events").insert({
        ticket_id: ticketId,
        action: "dilewati",
        actor_id: staffId || null,
        keterangan: `Dua kali dilewati: Tiket dikembalikan ke urutan paling akhir (Urut: ${newSeq}). Alasan: ${alasan || "Pasien tidak merespons"}`,
      });

      revalidatePath(`/petugas/panel/${ticket.unit_id}`);
      return {
        success: true,
        message: `Tiket ${ticket.nomor_antrean} telah dilewati 2 kali dan dipindahkan ke urutan antrean paling akhir (#${newSeq}).`,
      };
    }

    // First skip -> mark status as 'dilewati'
    await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "dilewati",
      })
      .eq("id", ticketId);

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      action: "dilewati",
      actor_id: staffId || null,
      keterangan: `Dilewati (Pertama kali). Alasan: ${alasan || "Pasien belum hadir di ruang periksa"}`,
    });

    revalidatePath(`/petugas/panel/${ticket.unit_id}`);
    revalidatePath("/display");

    return {
      success: true,
      message: `Tiket ${ticket.nomor_antrean} berhasil dilewati. Pasien dapat dipanggil kembali dari daftar lewati.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal melewati antrean." };
  }
}

/**
 * Starts serving the patient at counter/doctor desk.
 */
export async function serveTicket(ticketId: string, staffId?: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: "Status antrean diubah menjadi: Sedang Dilayani (Mode Simulasi).",
      };
    }

    const serviceSupabase = createServiceRoleClient();
    const nowIso = new Date().toISOString();

    const { data: ticket, error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "dilayani",
        dilayani_pada: nowIso,
      })
      .eq("id", ticketId)
      .select("id, nomor_antrean, unit_id")
      .single();

    if (updateError || !ticket) {
      return { success: false, error: updateError?.message || "Gagal memperbarui status antrean." };
    }

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      action: "dilayani",
      actor_id: staffId || null,
      keterangan: "Layanan dimulai",
    });

    revalidatePath(`/petugas/panel/${ticket.unit_id}`);
    revalidatePath("/display");

    return {
      success: true,
      message: `Layanan untuk ${ticket.nomor_antrean} dimulai.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memulai layanan." };
  }
}

/**
 * Completes service for a ticket and updates service statistics.
 */
export async function completeTicket(ticketId: string, staffId?: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: "Layanan selesai (Mode Simulasi).",
      };
    }

    const serviceSupabase = createServiceRoleClient();
    const nowIso = new Date().toISOString();

    // Fetch ticket to calculate duration
    const { data: ticket, error: fetchError } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_antrean, unit_id, dilayani_pada")
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return { success: false, error: "Tiket antrean tidak ditemukan." };
    }

    // Update ticket to 'selesai'
    const { error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        status: "selesai",
        selesai_pada: nowIso,
      })
      .eq("id", ticketId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Calculate duration in seconds
    let durationSeconds = 600; // default 10 minutes
    if (ticket.dilayani_pada) {
      durationSeconds = Math.max(60, Math.round((new Date(nowIso).getTime() - new Date(ticket.dilayani_pada).getTime()) / 1000));
    }

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      action: "selesai",
      actor_id: staffId || null,
      keterangan: `Layanan selesai. Durasi: ${Math.round(durationSeconds / 60)} menit.`,
    });

    // Update unit_stats
    const { data: existingStats } = await serviceSupabase
      .from("unit_stats")
      .select("*")
      .eq("unit_id", ticket.unit_id)
      .maybeSingle();

    if (existingStats) {
      const newTotal = existingStats.total_selesai + 1;
      const newAvg = Math.round(
        (existingStats.avg_service_seconds * existingStats.total_selesai + durationSeconds) / newTotal
      );
      await serviceSupabase
        .from("unit_stats")
        .update({
          total_selesai: newTotal,
          avg_service_seconds: newAvg,
          updated_at: nowIso,
        })
        .eq("unit_id", ticket.unit_id);
    } else {
      await serviceSupabase.from("unit_stats").insert({
        unit_id: ticket.unit_id,
        total_selesai: 1,
        avg_service_seconds: durationSeconds,
        updated_at: nowIso,
      });
    }

    revalidatePath(`/petugas/panel/${ticket.unit_id}`);
    revalidatePath("/display");

    return {
      success: true,
      message: `Layanan tiket ${ticket.nomor_antrean} telah selesai dicatat.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyelesaikan antrean." };
  }
}

/**
 * Changes emergency triage level (merah, kuning, hijau) with medical rationale.
 */
export async function moveTriageLevel(
  ticketId: string,
  newLevel: "merah" | "kuning" | "hijau",
  staffId?: string,
  alasan?: string
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: `Kategori Triase berhasil diubah menjadi ${newLevel.toUpperCase()} (Mode Simulasi).`,
      };
    }

    const serviceSupabase = createServiceRoleClient();

    const { data: ticket, error: updateError } = await serviceSupabase
      .from("queue_tickets")
      .update({
        triage_level: newLevel,
      })
      .eq("id", ticketId)
      .select("id, nomor_antrean, unit_id")
      .single();

    if (updateError || !ticket) {
      return { success: false, error: updateError?.message || "Gagal memperbarui level triase." };
    }

    await serviceSupabase.from("queue_events").insert({
      ticket_id: ticketId,
      action: "triage_diubah",
      actor_id: staffId || null,
      keterangan: `Triase diubah menjadi ${newLevel.toUpperCase()}. Alasan: ${alasan || "Penilaian ulang kondisi tanda vital pasien"}`,
    });

    revalidatePath("/petugas/triase");
    revalidatePath(`/petugas/panel/${ticket.unit_id}`);

    return {
      success: true,
      message: `Klasifikasi triase untuk ${ticket.nomor_antrean} berhasil diperbarui menjadi ${newLevel.toUpperCase()}.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status triase." };
  }
}

/**
 * Sets doctor session quota with validation: quota cannot be less than already booked/terpakai.
 */
export async function setDoctorQuota(sessionId: string, newQuota: number, staffId?: string) {
  try {
    if (newQuota < 1) {
      return { success: false, error: "Kuota dokter minimal 1 pasien." };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      return {
        success: true,
        message: `Kuota dokter berhasil diperbarui menjadi ${newQuota} pasien (Mode Simulasi).`,
      };
    }

    const serviceSupabase = createServiceRoleClient();

    const { data: session, error: fetchError } = await serviceSupabase
      .from("doctor_sessions")
      .select("id, kuota, terpakai")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return { success: false, error: "Sesi dokter tidak ditemukan." };
    }

    // Validation: newQuota cannot be smaller than already terpakai
    if (newQuota < session.terpakai) {
      return {
        success: false,
        error: `Kuota baru (${newQuota}) tidak boleh lebih kecil dari kuota yang sudah terpakai (${session.terpakai} pasien). Batalkan booking terlebih dahulu jika ingin menurunkan kuota di bawah angka ini.`,
      };
    }

    const { error: updateError } = await serviceSupabase
      .from("doctor_sessions")
      .update({
        kuota: newQuota,
      })
      .eq("id", sessionId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/petugas/kuota-dokter");
    revalidatePath("/jadwal-dokter");

    return {
      success: true,
      message: `Kuota sesi dokter berhasil diperbarui menjadi ${newQuota} pasien.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah kuota dokter." };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(req: NextRequest) {
  return handleUnitStatsCron(req);
}

export async function POST(req: NextRequest) {
  return handleUnitStatsCron(req);
}

async function handleUnitStatsCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretQuery = req.nextUrl.searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && cronSecret !== "generate-random-string-32-char") {
      const isBearerMatch = authHeader === `Bearer ${cronSecret}`;
      const isQueryMatch = secretQuery === cronSecret;

      if (!isBearerMatch && !isQueryMatch) {
        return NextResponse.json({ error: "Unauthorized: Invalid cron secret" }, { status: 401 });
      }
    }

    const serviceSupabase = createServiceRoleClient();
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch all active units
    const { data: units } = await serviceSupabase
      .from("units")
      .select("id, default_service_minutes")
      .eq("is_active", true);

    const updatedUnits = [];

    if (units) {
      for (const unit of units) {
        // Fetch up to 50 last completed tickets for this unit
        const { data: completedTickets } = await serviceSupabase
          .from("queue_tickets")
          .select("dilayani_pada, selesai_pada")
          .eq("unit_id", unit.id)
          .eq("status", "selesai")
          .not("dilayani_pada", "is", null)
          .not("selesai_pada", "is", null)
          .order("selesai_pada", { ascending: false })
          .limit(50);

        let avgSeconds = unit.default_service_minutes * 60;

        if (completedTickets && completedTickets.length > 0) {
          const totalDurations = completedTickets.reduce((sum, t) => {
            const diff = Math.round(
              (new Date(t.selesai_pada).getTime() - new Date(t.dilayani_pada).getTime()) / 1000
            );
            return sum + (diff > 30 ? diff : 600);
          }, 0);
          avgSeconds = Math.round(totalDurations / completedTickets.length);
        }

        // Upsert unit_stats
        await serviceSupabase
          .from("unit_stats")
          .upsert({
            unit_id: unit.id,
            total_selesai: completedTickets?.length || 0,
            avg_service_seconds: avgSeconds,
            updated_at: new Date().toISOString(),
          }, { onConflict: "unit_id" });

        // Update estimasi_menit on all active tickets for this unit today
        const { data: waitingTickets } = await serviceSupabase
          .from("queue_tickets")
          .select("id, nomor_urut")
          .eq("unit_id", unit.id)
          .eq("tanggal", today)
          .eq("status", "menunggu")
          .order("nomor_urut", { ascending: true });

        if (waitingTickets && waitingTickets.length > 0) {
          const avgMinutes = Math.max(2, Math.round(avgSeconds / 60));
          for (let i = 0; i < waitingTickets.length; i++) {
            const est = (i + 1) * avgMinutes;
            await serviceSupabase
              .from("queue_tickets")
              .update({ estimasi_menit: est })
              .eq("id", waitingTickets[i].id);
          }
        }

        updatedUnits.push({
          unitId: unit.id,
          avgMinutes: Math.round(avgSeconds / 60),
          waitingCount: waitingTickets?.length || 0,
        });
      }
    }

    // 2. Daily auto-cancellation for past sessions/dates where ticket is still 'menunggu'
    const nowIso = new Date().toISOString();
    const { data: expiredTickets } = await serviceSupabase
      .from("queue_tickets")
      .select("id, nomor_antrean")
      .lt("tanggal", today)
      .eq("status", "menunggu");

    if (expiredTickets && expiredTickets.length > 0) {
      for (const t of expiredTickets) {
        await serviceSupabase
          .from("queue_tickets")
          .update({
            status: "batal",
            selesai_pada: nowIso,
          })
          .eq("id", t.id);

        await serviceSupabase.from("queue_events").insert({
          ticket_id: t.id,
          action: "dibatalkan",
          keterangan: "Dibatalkan otomatis oleh sistem (Pasien tidak hadir lewat jam layanan sesi)",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Unit stats and estimated wait times successfully updated.",
      updatedUnits,
      cancelledExpiredCount: expiredTickets?.length || 0,
    });
  } catch (err: any) {
    console.error("Cron Unit Stats Error:", err);
    return NextResponse.json(
      { error: "Internal Cron Error", details: err.message },
      { status: 500 }
    );
  }
}

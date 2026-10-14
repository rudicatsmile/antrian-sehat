import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sendWhatsAppMessage, WhatsAppTemplates, NotificationType } from "@/lib/wa";

export async function GET(req: NextRequest) {
  return handleCronJob(req);
}

export async function POST(req: NextRequest) {
  return handleCronJob(req);
}

async function handleCronJob(req: NextRequest) {
  try {
    // 1. Authorization check with CRON_SECRET
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

    // 2. Fetch pending notification jobs (status 'antrean' or 'gagal' with retry < 3)
    const { data: jobs, error: fetchError } = await serviceSupabase
      .from("notification_jobs")
      .select("*")
      .in("status", ["antrean", "gagal"])
      .order("created_at", { ascending: true })
      .limit(20);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada antrean pekerjaan notifikasi yang menunggu.",
        processed: 0,
      });
    }

    const results = [];

    // 3. Process jobs
    for (const job of jobs) {
      const templateFn = WhatsAppTemplates[job.tipe as NotificationType];
      let messageBody = "";

      if (templateFn) {
        messageBody = templateFn(job.payload || {});
      } else if (job.payload?.message) {
        messageBody = job.payload.message;
      } else {
        messageBody = `Pemberitahuan Antrean Sehat RSUD: Tiket ${job.payload?.nomorTiket || ""}`;
      }

      const sendResult = await sendWhatsAppMessage(job.no_whatsapp, messageBody);

      if (sendResult.success) {
        await serviceSupabase
          .from("notification_jobs")
          .update({
            status: "sukses",
            error_details: null,
          })
          .eq("id", job.id);

        results.push({ id: job.id, status: "sukses", phone: job.no_whatsapp });
      } else {
        await serviceSupabase
          .from("notification_jobs")
          .update({
            status: "gagal",
            error_details: sendResult.error || "Gagal kirim via gateway",
          })
          .eq("id", job.id);

        results.push({ id: job.id, status: "gagal", error: sendResult.error });
      }
    }

    return NextResponse.json({
      success: true,
      processed: jobs.length,
      results,
    });
  } catch (err: any) {
    console.error("Cron Notifications Error:", err);
    return NextResponse.json(
      { error: "Internal Cron Error", details: err.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { error: "Payload notifikasi Midtrans tidak lengkap" },
        { status: 400 }
      );
    }

    // 1. Verify Signature Key with SHA512
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    const isMock = !process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY.includes("your-");

    if (!isValid && !isMock) {
      console.error(`Invalid Midtrans signature for order ${order_id}`);
      return NextResponse.json(
        { error: "Tanda tangan signature_key tidak valid." },
        { status: 403 }
      );
    }

    // 2. Map Midtrans transaction_status to Antrean Sehat payment_status
    let newStatus: "settlement" | "pending" | "deny" | "expire" | "cancel" = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        newStatus = "pending";
      } else if (fraud_status === "accept") {
        newStatus = "settlement";
      }
    } else if (transaction_status === "settlement") {
      newStatus = "settlement";
    } else if (transaction_status === "cancel") {
      newStatus = "cancel";
    } else if (transaction_status === "deny") {
      newStatus = "deny";
    } else if (transaction_status === "expire") {
      newStatus = "expire";
    } else if (transaction_status === "pending") {
      newStatus = "pending";
    }

    // 3. Update invoice in database
    const serviceSupabase = createServiceRoleClient();

    // Find invoice by midtrans_order_id or suffix
    const { data: invoice } = await serviceSupabase
      .from("invoices")
      .select("id, status, total_amount, patient_id, nomor_invoice")
      .eq("midtrans_order_id", order_id)
      .maybeSingle();

    if (invoice) {
      // Idempotency: If already settled, respond HTTP 200 without duplicate action
      if (invoice.status === "settlement" && newStatus === "settlement") {
        return NextResponse.json({
          success: true,
          message: "Tagihan sudah lunas (Idempoten).",
        });
      }

      const updateData: Record<string, any> = {
        status: newStatus,
        payment_type: payment_type || "midtrans_snap",
      };

      if (newStatus === "settlement") {
        updateData.paid_at = new Date().toISOString();
      }

      await serviceSupabase
        .from("invoices")
        .update(updateData)
        .eq("id", invoice.id);

      // Queue WhatsApp notification for successful payment
      if (newStatus === "settlement") {
        const { data: patient } = await serviceSupabase
          .from("profiles")
          .select("nama_lengkap, no_whatsapp")
          .eq("id", invoice.patient_id)
          .maybeSingle();

        if (patient?.no_whatsapp) {
          await serviceSupabase.from("notification_jobs").insert({
            patient_id: invoice.patient_id,
            no_whatsapp: patient.no_whatsapp,
            tipe: "pembayaran_berhasil",
            payload: {
              nama: patient.nama_lengkap,
              nomor_invoice: invoice.nomor_invoice,
              total: invoice.total_amount,
              metode: payment_type || "Online",
            },
            status: "antrean",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Webhook berhasil diproses. Status: ${newStatus}`,
    });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses webhook Midtrans", details: error.message },
      { status: 500 }
    );
  }
}

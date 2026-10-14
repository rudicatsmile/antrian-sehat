import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-supabase-signature") || "";
    const hookSecret = process.env.SUPABASE_SEND_SMS_HOOK_SECRET || "mock-hook-secret";

    // Optional signature verification when secret is configured
    if (hookSecret && hookSecret !== "mock-hook-secret" && signature) {
      const hmac = crypto.createHmac("sha256", hookSecret).update(rawBody).digest("hex");
      if (signature !== hmac && !signature.includes(hmac)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody || "{}");
    const { user, sms } = payload;
    const phone = user?.phone || payload?.phone;
    const otpCode = sms?.otp || payload?.otp;

    // Send payload to WhatsApp Gateway
    const waApiUrl = process.env.WA_GATEWAY_BASE_URL;
    const waApiKey = process.env.WA_GATEWAY_API_KEY;

    if (waApiUrl && waApiKey && phone && otpCode) {
      await fetch(`${waApiUrl}/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${waApiKey}`,
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          message: `Kode verifikasi OTP Antrean Sehat RSUD Sejahtera Sehat Anda adalah: *${otpCode}*. Berlaku selama 5 menit. JANGAN bagikan kode ini kepada siapa pun.`,
        }),
      }).catch((err) => {
        console.error("WA Gateway delivery error:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP forwarded to WhatsApp Gateway",
    });
  } catch (error: any) {
    console.error("Send SMS Hook Error:", error);
    return NextResponse.json(
      { error: "Internal Hook Error", details: error.message },
      { status: 500 }
    );
  }
}

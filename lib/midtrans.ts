import crypto from "crypto";
import { createServiceRoleClient } from "./supabase/service-role";

export interface MidtransItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface CreateSnapTransactionParams {
  invoiceId: string;
  invoiceNo: string;
  grossAmount: number;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  items?: MidtransItemDetail[];
}

export interface SnapTransactionResult {
  success: boolean;
  token?: string;
  redirectUrl?: string;
  orderId?: string;
  error?: string;
}

/**
 * Returns the correct Midtrans Snap Base URL depending on environment
 */
export function getMidtransSnapUrl(): string {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  return isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

/**
 * Generates an official Midtrans Order ID: ANT-[YYYYMMDD]-[INVOICE_NO]
 */
export function formatMidtransOrderId(invoiceNo: string): string {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const cleanInv = invoiceNo.replace(/[^a-zA-Z0-9]/g, "");
  return `ANT-${ymd}-${cleanInv}`;
}

/**
 * Verifies Midtrans SHA512 signature key:
 * SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  receivedSignature: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  if (!serverKey) return false;

  const rawString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedHash = crypto.createHash("sha512").update(rawString).digest("hex");

  return computedHash.toLowerCase() === receivedSignature.toLowerCase();
}

/**
 * Creates a Snap Transaction Token and updates the invoices table
 */
export async function createSnapTransaction(
  params: CreateSnapTransactionParams
): Promise<SnapTransactionResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isMock = !serverKey || serverKey.includes("your-");

  const orderId = formatMidtransOrderId(params.invoiceNo);

  // In Mock Mode fallback
  if (isMock) {
    const mockToken = `mock-snap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      token: mockToken,
      redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`,
      orderId,
    };
  }

  try {
    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(params.grossAmount),
      },
      item_details: params.items?.map((item) => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.slice(0, 50),
      })) || [
        {
          id: params.invoiceNo,
          price: Math.round(params.grossAmount),
          quantity: 1,
          name: `Layanan RSUD ${params.invoiceNo}`,
        },
      ],
      customer_details: {
        first_name: params.patientName,
        phone: params.patientPhone,
        email: params.patientEmail || "pasien@antreansehat.rsud.go.id",
      },
    };

    const res = await fetch(getMidtransSnapUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      return {
        success: false,
        error: data.error_messages ? data.error_messages.join(", ") : "Gagal membuat transaksi Snap.",
      };
    }

    // Save snap_token and order_id to database
    try {
      const serviceSupabase = createServiceRoleClient();
      await serviceSupabase
        .from("invoices")
        .update({
          snap_token: data.token,
          midtrans_order_id: orderId,
        })
        .eq("id", params.invoiceId);
    } catch {
      // Continue even if offline
    }

    return {
      success: true,
      token: data.token,
      redirectUrl: data.redirect_url,
      orderId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Terjadi kesalahan koneksi Midtrans.",
    };
  }
}

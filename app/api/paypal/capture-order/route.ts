import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/utils/supabase/server";
const PAYPAL_BASE_URL = "https://api-m.paypal.com";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal credentials");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not authenticate with PayPal");
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const admin = createAdminClient();
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing PayPal order ID" },
        { status: 400 }
      );
    }

    const tokenData = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal capture error:", data);

      return NextResponse.json(
        {
          success: false,
          error: "PayPal payment could not be captured",
          details: data,
        },
        { status: response.status }
      );
    }
const { error: invoiceError } = await admin
  .from("client_invoices")
  .update({
    status: "Paid",
    paid_at: new Date().toISOString(),
  })
  .eq("paypal_order_id", orderId);

if (invoiceError) {
  console.error("Could not mark invoice paid:", invoiceError.message);
}
    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("Capture order error:", error);

    return NextResponse.json(
      { success: false, error: "Could not capture PayPal payment" },
      { status: 500 }
    );
  }
}
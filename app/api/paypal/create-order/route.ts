import { NextResponse } from "next/server";

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
    const { amount } = await request.json();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid invoice amount" },
        { status: 400 }
      );
    }

    const tokenData = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        payment_source: {
  paypal: {
    experience_context: {
      user_action: "PAY_NOW",
      return_url: "http://localhost:3000/paypal/success",
      cancel_url: "http://localhost:3000/paypal/cancel",
    },
  },
},
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: numericAmount.toFixed(2),
            },
          },
        ],
      }),
      cache: "no-store",
    });

    const order = await response.json();
console.log("PAYPAL ORDER RESPONSE:", JSON.stringify(order, null, 2));

    if (!response.ok) {
      console.error("PayPal create order error:", order);
      return NextResponse.json(
        { success: false, error: "Could not create PayPal order" },
        { status: response.status }
      );
    }
    console.log("PAYPAL ORDER RESPONSE:", JSON.stringify(order, null, 2));
const approvalLink = order.links?.find(
  (link: { rel: string; href: string }) =>
    link.rel === "payer-action" || link.rel === "approve"
)?.href;
    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalLink,
      order,
    });
  } catch (error) {
    console.error("PayPal order error:", error);

    return NextResponse.json(
      { success: false, error: "PayPal order failed" },
      { status: 500 }
    );
  }
}
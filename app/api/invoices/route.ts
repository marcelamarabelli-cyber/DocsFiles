import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { clientId, amount, description } = await request.json();

    const numericAmount = Number(amount);

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Missing client ID" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid invoice amount" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("client_invoices")
      .insert({
        client_id: clientId,
        amount: numericAmount,
        description: description?.trim() || "Services",
        status: "unpaid",
        paypal_order_id: null,
        paid_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Invoice insert error:", error.message);

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      invoice: data,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    return NextResponse.json(
      { success: false, error: "Could not create invoice" },
      { status: 500 },
    );
  }
}
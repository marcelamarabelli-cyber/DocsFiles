import { NextResponse } from "next/server";
import { inviteClientByEmail } from "@/app/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const redirectTo = String(body.redirectTo || "").trim();

    if (!email) {
      return NextResponse.json(
        { error: "Client email is required." },
        { status: 400 }
      );
    }

    if (!redirectTo) {
      return NextResponse.json(
        { error: "Redirect URL is required." },
        { status: 400 }
      );
    }

    const { data, error } = await inviteClientByEmail(email, redirectTo);

    if (error) {
      console.error("Supabase invite rejected:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("DocsFiles invite error:", error);

    return NextResponse.json(
      { error: "Unable to send client invitation." },
      { status: 500 }
    );
  }
}
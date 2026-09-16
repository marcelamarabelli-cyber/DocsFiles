import { NextResponse } from "next/server";
import { inviteClientByEmail, createAdminClient } from "@/app/utils/supabase/server";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const redirectTo = String(body.redirectTo || "").trim();
const clientId = String(body.clientId || "").trim();
if (!clientId) {
  return NextResponse.json(
    { error: "Client ID is required." },
    { status: 400 }
  );
}

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

    const admin = createAdminClient();

const { data, error } = await inviteClientByEmail(email, redirectTo);

let userId = data?.user?.id ?? null;

if (error) {
  const alreadyRegistered = error.message
    .toLowerCase()
    .includes("already been registered");

  if (!alreadyRegistered) {
    console.error("Supabase invite rejected:", error.message);

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  console.log("Client already has a Supabase login:", email);

  const {
    data: usersData,
    error: usersError,
  } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    console.error("Could not find existing Supabase user:", usersError.message);

    return NextResponse.json(
      { error: "Could not find existing client login." },
      { status: 500 }
    );
  }

  const existingUser = usersData.users.find(
    (user) =>
      user.email?.trim().toLowerCase() === email.trim().toLowerCase()
  );

  if (!existingUser) {
    return NextResponse.json(
      { error: "Existing client login could not be found." },
      { status: 404 }
    );
  }

  userId = existingUser.id;
}

if (!userId) {
  return NextResponse.json(
    { error: "Could not determine client user ID." },
    { status: 500 }
  );
}

const { error: accessError } = await admin
  .from("client_access")
  .upsert(
    {
  user_id: userId,
  client_id: clientId,
  email: email,
},
    { onConflict: "user_id" }
  );

if (accessError) {
  console.error("Could not link client access:", accessError.message);

  return NextResponse.json(
    { error: "Client access could not be linked." },
    { status: 500 }
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
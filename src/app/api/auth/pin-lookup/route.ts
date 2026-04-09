import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/auth/pin-lookup — Find a user by their 4-digit PIN.
 * Used by the staff login page for quick kiosk-style authentication.
 * Returns the user's email (so the client can call signIn with "pin:XXXX").
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = body.pin;

  if (!pin || typeof pin !== "string" || pin.length !== 4) {
    return NextResponse.json({ ok: false, error: "Enter a 4-digit PIN." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { pin },
    select: { id: true, email: true, name: true, role: true, locationId: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "PIN not recognized. Ask your supervisor." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

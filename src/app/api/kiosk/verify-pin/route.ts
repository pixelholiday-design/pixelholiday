import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ pin: z.string().min(4).max(8) });

/**
 * Hash a PIN using SHA-256.
 * PRODUCTION NOTE: Migrate all User.pin values to SHA-256 hashes.
 * Preferred: use bcrypt (npm install bcryptjs) for true salted hashing.
 */
function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  // Fetch all users who could match (we can't query by hash without knowing all PINs,
  // so for the migration period we fetch by plain OR hash). In a fully-migrated system,
  // query WHERE pin = hashPin(parsed.data.pin) directly.
  const hashedAttempt = hashPin(parsed.data.pin);
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { pin: hashedAttempt },          // hashed PIN (new)
        { pin: parsed.data.pin },        // plain-text PIN (legacy, migration fallback)
      ],
    },
    select: { id: true, name: true, role: true, locationId: true },
  });
  if (!user) return NextResponse.json({ ok: false, error: "Wrong PIN" }, { status: 401 });
  return NextResponse.json({ ok: true, user });
}

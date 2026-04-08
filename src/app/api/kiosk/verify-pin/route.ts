import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ pin: z.string().min(4).max(8) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  // Match against User.pin (plain for now — would be hashed in production).
  const user = await prisma.user.findFirst({
    where: { pin: parsed.data.pin },
    select: { id: true, name: true, role: true, locationId: true },
  });
  if (!user) return NextResponse.json({ ok: false, error: "Wrong PIN" }, { status: 401 });
  return NextResponse.json({ ok: true, user });
}

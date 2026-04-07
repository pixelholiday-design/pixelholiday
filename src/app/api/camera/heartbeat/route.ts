import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ externalId: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  try {
    const cam = await prisma.camera.update({
      where: { externalId: parsed.data.externalId },
      data: { lastPingAt: new Date(), isActive: true },
    });
    return NextResponse.json({ ok: true, lastPingAt: cam.lastPingAt });
  } catch {
    return NextResponse.json({ ok: false, error: "Camera not registered" }, { status: 404 });
  }
}

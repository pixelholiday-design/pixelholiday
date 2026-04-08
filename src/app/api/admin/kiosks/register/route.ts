import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  locationId: z.string().min(1),
});

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";
  let body: any = {};
  if (ct.includes("application/json")) {
    body = await req.json().catch(() => ({}));
  } else {
    const fd = await req.formData().catch(() => null);
    if (fd) fd.forEach((v, k) => { body[k] = String(v); });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  const k = await prisma.kioskDevice.upsert({
    where: { externalId: parsed.data.externalId },
    update: { name: parsed.data.name, locationId: parsed.data.locationId },
    create: { ...parsed.data, isOnline: true, lastPingAt: new Date() },
  });
  return NextResponse.json({ ok: true, kiosk: k });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { KioskAppType, NetworkMode } from "@prisma/client";

export const dynamic = "force-dynamic";

const schema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["SALE_POINT", "GALLERY_DISPLAY", "TV_DISPLAY", "SD_UPLOAD"]),
  locationId: z.string().min(1),
  networkMode: z.enum(["ONLINE", "LOCAL"]).default("ONLINE"),
  serverIp: z.string().nullable().optional(),
  isLocalServer: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  const k = await prisma.kioskConfig.upsert({
    where: { externalId: parsed.data.externalId },
    update: {
      name: parsed.data.name,
      type: parsed.data.type as KioskAppType,
      locationId: parsed.data.locationId,
      networkMode: parsed.data.networkMode as NetworkMode,
      serverIp: parsed.data.serverIp,
      isLocalServer: parsed.data.isLocalServer,
      lastSeenAt: new Date(),
    },
    create: {
      externalId: parsed.data.externalId,
      name: parsed.data.name,
      type: parsed.data.type as KioskAppType,
      locationId: parsed.data.locationId,
      networkMode: parsed.data.networkMode as NetworkMode,
      serverIp: parsed.data.serverIp,
      isLocalServer: parsed.data.isLocalServer || false,
      lastSeenAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, kiosk: k });
}

export async function GET() {
  const kiosks = await prisma.kioskConfig.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ kiosks });
}

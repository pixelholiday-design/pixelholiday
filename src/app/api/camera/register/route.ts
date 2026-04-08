import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { CameraType } from "@prisma/client";

const schema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  locationId: z.string().min(1),
  type: z.enum(["SPEED_CAM", "RIDE_CAM", "ENTRANCE_CAM", "ROAMING"]),
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
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const cam = await prisma.camera.upsert({
      where: { externalId: parsed.data.externalId },
      update: {
        name: parsed.data.name,
        locationId: parsed.data.locationId,
        type: parsed.data.type as CameraType,
        isActive: true,
      },
      create: {
        externalId: parsed.data.externalId,
        name: parsed.data.name,
        locationId: parsed.data.locationId,
        type: parsed.data.type as CameraType,
      },
    });
    return NextResponse.json({ ok: true, camera: cam });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function GET() {
  const cameras = await prisma.camera.findMany({
    include: { location: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ cameras });
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const [appointments, locations, photographers] = await Promise.all([
      prisma.appointment.findMany({
        include: {
          assignedPhotographer: { select: { id: true, name: true, role: true } },
          location: { select: { id: true, name: true, locationType: true } },
          gallery: { include: { location: true, customer: true } },
        },
        orderBy: { scheduledTime: "asc" },
      }),
      prisma.location.findMany({
        where: { isActive: true },
        select: { id: true, name: true, locationType: true },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "PHOTOGRAPHER" },
        select: { id: true, name: true, locationId: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return NextResponse.json({ appointments, locations, photographers });
  } catch {
    // Fallback with minimal select in case schema columns are missing
    let appointments: any[] = [];
    let locations: any[] = [];
    let photographers: any[] = [];
    try {
      appointments = await prisma.appointment.findMany({
        select: {
          id: true, scheduledTime: true, status: true, source: true,
          assignedPhotographerId: true,
          assignedPhotographer: { select: { id: true, name: true } },
          galleryId: true,
        },
        orderBy: { scheduledTime: "asc" },
      });
    } catch { /* no appointments table yet */ }
    try {
      locations = await prisma.location.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
    } catch { /* no locations table yet */ }
    try {
      photographers = await prisma.user.findMany({
        where: { role: "PHOTOGRAPHER" },
        select: { id: true, name: true, locationId: true },
        orderBy: { name: "asc" },
      });
    } catch { /* no users table yet */ }
    return NextResponse.json({ appointments, locations, photographers });
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "NO_SHOW", "CANCELLED"]),
});

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  try {
    const appointment = await prisma.appointment.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status as any },
    });
    return NextResponse.json({ ok: true, appointment });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}

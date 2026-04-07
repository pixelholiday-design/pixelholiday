import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** VIP Concierge auto-dispatch: highest-rated available photographer at the location */
export async function POST(req: NextRequest) {
  const { appointmentId } = await req.json();
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId }, include: { gallery: true } });
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const top = await prisma.user.findFirst({
    where: { role: "PHOTOGRAPHER", locationId: appt.gallery.locationId },
    orderBy: [{ rating: "desc" }, { xp: "desc" }],
  });
  if (!top) return NextResponse.json({ error: "No photographers available" }, { status: 404 });

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { assignedPhotographerId: top.id, status: "CONFIRMED" },
    include: { assignedPhotographer: true },
  });
  return NextResponse.json({ appointment: updated });
}

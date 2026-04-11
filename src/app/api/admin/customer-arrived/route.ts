import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { appointmentId } = await req.json();
  if (!appointmentId) return NextResponse.json({ error: "appointmentId required" }, { status: 400 });
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt) return NextResponse.json({ error: "not found" }, { status: 404 });

  const outcome = await prisma.appointmentOutcome.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      didArrive: true,
      arrivedAt: new Date(),
      photographerId: appt.assignedPhotographerId,
    },
    update: { didArrive: true, arrivedAt: new Date() },
  });

  const commission = await prisma.commission.create({
    data: {
      userId: appt.assignedPhotographerId,
      type: "ATTENDANCE_BONUS",
      amount: 2,
      rate: 0,
      month: new Date().toISOString().slice(0, 7),
    },
  });

  return NextResponse.json({ outcome, commission });
}

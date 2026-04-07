export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    include: { assignedPhotographer: true, gallery: { include: { location: true, customer: true } } },
    orderBy: { scheduledTime: "asc" },
  });
  return NextResponse.json({ appointments });
}

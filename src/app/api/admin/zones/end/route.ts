import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { assignmentId } = await req.json();
  const a = await prisma.zoneAssignment.findUnique({ where: { id: assignmentId } });
  if (!a) return NextResponse.json({ error: "not found" }, { status: 404 });
  const endedAt = new Date();
  const durationMs = endedAt.getTime() - a.startedAt.getTime();
  const rotatedOnTime = durationMs < 4 * 60 * 60 * 1000;
  const updated = await prisma.zoneAssignment.update({
    where: { id: assignmentId },
    data: { endedAt, rotatedOnTime },
  });
  return NextResponse.json({ assignment: updated });
}

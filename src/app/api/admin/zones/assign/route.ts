import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { photographerId, locationId, zoneName, isOutdoor } = await req.json();
  if (!photographerId || !locationId || !zoneName)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  await prisma.zoneAssignment.updateMany({
    where: { photographerId, endedAt: null },
    data: { endedAt: new Date() },
  });

  const created = await prisma.zoneAssignment.create({
    data: { photographerId, locationId, zoneName, isOutdoor: !!isOutdoor },
  });
  return NextResponse.json({ assignment: created });
}

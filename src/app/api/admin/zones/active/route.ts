export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const active = await prisma.zoneAssignment.findMany({
    where: { endedAt: null },
    include: { photographer: { select: { id: true, name: true } } },
  });
  const now = Date.now();
  const enriched = active.map((a) => {
    const durMin = Math.floor((now - a.startedAt.getTime()) / 60000);
    return {
      ...a,
      durationMinutes: durMin,
      warning: durMin >= 210 && durMin < 240,
      critical: durMin >= 240,
    };
  });
  return NextResponse.json({ assignments: enriched });
}

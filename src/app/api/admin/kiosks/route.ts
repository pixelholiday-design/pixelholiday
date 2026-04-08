import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const kiosks = await prisma.kioskDevice.findMany({
    include: { location: { select: { id: true, name: true, type: true } } },
    orderBy: [{ isOnline: "desc" }, { lastPingAt: "desc" }],
  });
  const now = Date.now();
  const withStatus = kiosks.map((k) => {
    const lastPingMs = k.lastPingAt ? now - k.lastPingAt.getTime() : null;
    // Consider a kiosk "stale" if no ping in the last 5 minutes
    const stale = lastPingMs === null || lastPingMs > 5 * 60_000;
    return {
      id: k.id,
      name: k.name,
      externalId: k.externalId,
      location: k.location,
      isOnline: k.isOnline && !stale,
      lastPingAt: k.lastPingAt,
      lastPingAgeSeconds: lastPingMs === null ? null : Math.round(lastPingMs / 1000),
    };
  });
  return NextResponse.json({
    count: withStatus.length,
    online: withStatus.filter((k) => k.isOnline).length,
    kiosks: withStatus,
  });
}

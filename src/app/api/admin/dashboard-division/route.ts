export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const division = req.nextUrl.searchParams.get("division") ?? "LUXURY";
  const locations = await prisma.location.findMany({ where: { locationType: division } });
  const ids = locations.map((l) => l.id);
  const galleries = await prisma.gallery.findMany({
    where: { locationId: { in: ids } },
    include: { order: true },
  });
  const orders = galleries.map((g) => g.order).filter(Boolean) as any[];
  const revenue = orders.reduce((s, o) => s + (o.amount ?? 0), 0);
  const aov = orders.length > 0 ? revenue / orders.length : 0;
  const targetAOV = locations[0]?.targetAOV ?? null;

  return NextResponse.json({
    division,
    locations: locations.length,
    galleries: galleries.length,
    orders: orders.length,
    revenue,
    aov,
    targetAOV,
    aovVsTarget: targetAOV ? aov / targetAOV : null,
  });
}

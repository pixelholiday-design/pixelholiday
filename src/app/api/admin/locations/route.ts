export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const locations = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      locationType: true,
      targetDailyRevenue: true,
      targetCaptureRate: true,
      targetAOV: true,
      rotationHours: true,
      contractEndDate: true,
      rentCost: true,
      rentAmount: true,
      partnerCommission: true,
      isActive: true,
    },
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ locations });
}

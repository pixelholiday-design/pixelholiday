import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/admin/marketing-campaigns — list all campaigns */
export async function GET() {
  const campaigns = await prisma.marketingCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      template: true,
      subject: true,
      sentCount: true,
      openCount: true,
      clickCount: true,
      sentAt: true,
    },
  });

  return NextResponse.json({ campaigns });
}

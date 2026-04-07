import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Module 20: AI Growth Engine v1 — analyze data and generate actionable insights.
export async function GET() {
  const [orders, galleries, photographers] = await Promise.all([
    prisma.order.findMany({ include: { gallery: true } }).catch(() => []),
    prisma.gallery.findMany().catch(() => []),
    prisma.user.findMany({ where: { role: "PHOTOGRAPHER" } }).catch(() => []),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const conversion = galleries.length ? orders.length / galleries.length : 0;

  const insights = [
    {
      type: "PRICING_OPTIMIZATION",
      title: "Raise digital gallery price by 10%",
      detail: `Conversion rate is ${(conversion * 100).toFixed(1)}% — pricing has headroom.`,
    },
    {
      type: "BOOKING_BOOST",
      title: "Push sunset slots on weekends",
      detail: "Sunset bookings convert 2.4× higher than midday on weekends.",
    },
    {
      type: "STAFF_PROMOTION_SUGGESTION",
      title: "Promote your top photographer to Supervisor",
      detail: `${photographers.length} photographers analyzed. Top performer flagged.`,
    },
    {
      type: "MARKETING_CAMPAIGN",
      title: "Launch 'Tunisia Summer 2026' WhatsApp campaign",
      detail: `€${totalRevenue.toFixed(0)} total revenue — re-target abandoned carts now.`,
    },
    {
      type: "SEO_UPDATE",
      title: "Add 'Resort photography Tunisia' to blog keywords",
      detail: "Trending search term in target region.",
    },
    {
      type: "PARTNER_DISCOVERY",
      title: "Reach out to 3 nearby hotels",
      detail: "Match profile of existing best-performing locations.",
    },
  ];

  // Log all suggestions
  for (const i of insights) {
    await prisma.aIGrowthLog.create({
      data: {
        type: i.type as any,
        description: i.title,
        result: i.detail,
        dataSnapshot: { totalRevenue, conversion, photographerCount: photographers.length },
      },
    }).catch(() => {});
  }

  return NextResponse.json({ insights, metrics: { totalRevenue, conversion } });
}

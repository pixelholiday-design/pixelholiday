import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const companies = await prisma.organization.findMany({
      where: { type: { in: ["VENUE_COMPANY", "HEADQUARTERS", "FRANCHISE"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, slug: true, type: true, brandName: true,
        country: true, city: true, commissionRate: true,
        _count: { select: { staff: true, locations: true } },
      },
    });

    const destinations = await prisma.destination.groupBy({
      by: ["organizationId"],
      _count: true,
    });

    const companiesData = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      type: c.type,
      brandName: c.brandName,
      country: c.country,
      city: c.city,
      commissionRate: c.commissionRate,
      destCount: destinations.find((d) => d.organizationId === c.id)?._count || 0,
      staffCount: c._count.staff,
    }));

    const totalDest = destinations.reduce((s, d) => s + d._count, 0);
    const totalStaff = companies.reduce((s, c) => s + c._count.staff, 0);

    return NextResponse.json({ companies: companiesData, totalDest, totalStaff });
  } catch (error) {
    console.error("Failed to list companies:", error);
    return NextResponse.json({ companies: [], totalDest: 0, totalStaff: 0 });
  }
}

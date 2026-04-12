import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = (session.user as any).orgId;
  const org = await prisma.organization.findFirst({
    where: { id: orgId, slug: params.slug },
    select: { id: true, name: true, slug: true, brandName: true, brandPrimaryColor: true },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const destinations = await prisma.destination.findMany({
    where: { organizationId: org.id, isActive: true },
    orderBy: { name: "asc" },
  });

  const staffCount = await prisma.destinationStaff.count({
    where: { destination: { organizationId: org.id } },
  });

  return NextResponse.json({
    org,
    destinations: destinations.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      venueType: d.venueType,
      address: d.address,
      city: d.city,
      country: d.country,
      currency: d.currency,
      isActive: d.isActive,
    })),
    staffCount,
  });
}

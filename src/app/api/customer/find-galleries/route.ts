import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/customer/find-galleries — Find galleries by customer email.
 * Used by /my-photos for customers who lost their gallery link.
 * No authentication required — public endpoint.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = body.email?.trim()?.toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Find customer(s) by email
  const customers = await prisma.customer.findMany({
    where: { email },
    select: { id: true },
  });

  if (customers.length === 0) {
    return NextResponse.json({ galleries: [] });
  }

  const customerIds = customers.map((c) => c.id);

  // Find their galleries (non-expired, with photos)
  const galleries = await prisma.gallery.findMany({
    where: {
      customerId: { in: customerIds },
      photos: { some: {} },
    },
    select: {
      magicLinkToken: true,
      status: true,
      createdAt: true,
      location: { select: { name: true } },
      photographer: { select: { name: true } },
      _count: { select: { photos: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    galleries: galleries.map((g) => ({
      magicLinkToken: g.magicLinkToken,
      location: g.location.name,
      photographer: g.photographer.name,
      photoCount: g._count.photos,
      status: g.status,
      createdAt: g.createdAt.toISOString(),
    })),
  });
}

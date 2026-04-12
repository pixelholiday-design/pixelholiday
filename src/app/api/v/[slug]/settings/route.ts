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
    select: {
      id: true,
      name: true,
      slug: true,
      brandName: true,
      brandPrimaryColor: true,
    },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Try to get default currency from destinations
  let defaultCurrency = "EUR";
  try {
    const firstDest = await prisma.destination.findFirst({
      where: { organizationId: org.id },
      select: { currency: true },
      orderBy: { createdAt: "asc" },
    });
    if (firstDest?.currency) defaultCurrency = firstDest.currency;
  } catch {
    // destination table may not exist
  }

  return NextResponse.json({
    name: org.name,
    slug: org.slug,
    brandName: org.brandName,
    brandPrimaryColor: org.brandPrimaryColor,
    defaultCurrency,
  });
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = (session.user as any).orgId;
  const org = await prisma.organization.findFirst({
    where: { id: orgId, slug: params.slug },
    select: { id: true },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { brandName, brandPrimaryColor, defaultCurrency } = body;

  // Validate color format
  if (brandPrimaryColor && !/^#[0-9A-Fa-f]{6}$/.test(brandPrimaryColor)) {
    return NextResponse.json({ error: "Invalid color format. Use #RRGGBB." }, { status: 400 });
  }

  // Update organization branding
  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: {
      ...(brandName !== undefined && { brandName: brandName || null }),
      ...(brandPrimaryColor !== undefined && { brandPrimaryColor }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      brandName: true,
      brandPrimaryColor: true,
    },
  });

  // Update default currency on all destinations if provided
  if (defaultCurrency) {
    try {
      await prisma.destination.updateMany({
        where: { organizationId: org.id },
        data: { currency: defaultCurrency },
      });
    } catch {
      // destination table may not exist yet
    }
  }

  return NextResponse.json({
    name: updated.name,
    slug: updated.slug,
    brandName: updated.brandName,
    brandPrimaryColor: updated.brandPrimaryColor,
    defaultCurrency: defaultCurrency || "EUR",
  });
}

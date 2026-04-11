import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;

  const sheetId = req.nextUrl.searchParams.get("sheetId");

  if (sheetId) {
    const tiers = await prisma.pricingTier.findMany({
      where: { priceSheetId: sheetId },
      orderBy: { minQuantity: "asc" },
    });
    return NextResponse.json({ ok: true, tiers });
  }

  // Return all price sheets with their tiers
  const priceSheets = await prisma.priceSheet.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
  });

  const tiersMap: Record<string, any[]> = {};
  for (const sheet of priceSheets) {
    tiersMap[sheet.id] = await prisma.pricingTier.findMany({
      where: { priceSheetId: sheet.id },
      orderBy: { minQuantity: "asc" },
    });
  }

  return NextResponse.json({ ok: true, priceSheets, tiers: tiersMap });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { priceSheetId, tiers } = body;

  if (!priceSheetId || !Array.isArray(tiers)) {
    return NextResponse.json({ error: "priceSheetId and tiers array required" }, { status: 400 });
  }

  // Delete existing tiers and recreate
  await prisma.pricingTier.deleteMany({ where: { priceSheetId } });

  const created = await Promise.all(
    tiers.map((t: any) =>
      prisma.pricingTier.create({
        data: {
          priceSheetId,
          minQuantity: t.minQuantity,
          maxQuantity: t.maxQuantity || null,
          pricePerUnit: t.pricePerUnit,
        },
      }),
    ),
  );

  return NextResponse.json({ ok: true, tiers: created });
}

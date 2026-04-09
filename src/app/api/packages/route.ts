export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const locationId = searchParams.get("locationId");

    const where: Record<string, unknown> = { isActive: true };
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (locationId) {
      where.OR = [{ locationId }, { locationId: null }];
    }

    const packages = await prisma.photoPackage.findMany({
      where,
      include: { addOns: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

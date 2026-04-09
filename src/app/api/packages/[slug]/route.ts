import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    const pkg = await prisma.photoPackage.findUnique({
      where: { slug, isActive: true },
      include: { addOns: { orderBy: { sortOrder: "asc" } }, location: { select: { id: true, name: true, city: true } } },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Failed to fetch package:", error);
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}

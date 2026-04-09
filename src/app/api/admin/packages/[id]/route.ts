import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const pkg = await prisma.photoPackage.findUnique({
    where: { id },
    include: { addOns: { orderBy: { sortOrder: "asc" } }, _count: { select: { bookings: true } } },
  });
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pkg);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Extract addOns separately for special handling
    const { addOns, ...data } = body;

    const pkg = await prisma.photoPackage.update({
      where: { id },
      data,
      include: { addOns: true },
    });

    // If addOns provided, replace them
    if (addOns) {
      await prisma.packageAddOn.deleteMany({ where: { packageId: id } });
      if (addOns.length > 0) {
        await prisma.packageAddOn.createMany({
          data: addOns.map((a: any) => ({ ...a, packageId: id })),
        });
      }
    }

    return NextResponse.json(pkg);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    console.error("Failed to update package:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    // Soft delete
    await prisma.photoPackage.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}

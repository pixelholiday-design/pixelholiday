import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const deliveries = await prisma.b2BDelivery.findMany({
      orderBy: { id: "desc" },
      include: { location: { select: { name: true, rentCost: true } } },
    });

    // Shape response to match existing UI expectations
    const shaped = deliveries.map((d) => ({
      id: d.id,
      locationId: d.locationId,
      locationName: d.location?.name || "",
      month: d.month,
      photoCount: d.photoCount,
      rentDiscountPercent: d.rentDiscountPercent ?? 0,
      monthlyRent: d.location?.rentCost ?? 0,
      notes: d.notes ?? "",
      deliveredAt: d.deliveredAt?.toISOString() || null,
    }));

    return NextResponse.json({ deliveries: shaped });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify locationId exists
    const location = await prisma.location.findUnique({ where: { id: body.locationId } }).catch(() => null);
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 400 });
    }

    const delivery = await prisma.b2BDelivery.create({
      data: {
        locationId: body.locationId,
        month: body.month || new Date().toISOString().slice(0, 7),
        photoCount: Number(body.photoCount) || 0,
        rentDiscountPercent: Number(body.rentDiscountPercent) || 0,
        notes: body.notes || null,
        deliveredAt: body.delivered ? new Date() : null,
      },
      include: { location: { select: { name: true, rentCost: true } } },
    });

    return NextResponse.json({
      ok: true,
      delivery: {
        id: delivery.id,
        locationId: delivery.locationId,
        locationName: delivery.location?.name || "",
        month: delivery.month,
        photoCount: delivery.photoCount,
        rentDiscountPercent: delivery.rentDiscountPercent ?? 0,
        monthlyRent: delivery.location?.rentCost ?? 0,
        notes: delivery.notes ?? "",
        deliveredAt: delivery.deliveredAt?.toISOString() || null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}

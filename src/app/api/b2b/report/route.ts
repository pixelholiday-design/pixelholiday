import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PHOTO_VALUE_EUR = 50; // estimated value per delivered promo photo

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  try {
    const deliveries = await prisma.b2BDelivery.findMany({
      where: month ? { month } : undefined,
      include: { location: { select: { name: true, rentCost: true } } },
    });

    const byLocation: Record<string, { locationId: string; locationName: string; photos: number; discountValue: number; estValue: number }> = {};
    let totalPhotos = 0;
    let totalDiscountValue = 0;
    let totalEstValue = 0;

    for (const d of deliveries) {
      const key = d.locationId;
      if (!byLocation[key]) {
        byLocation[key] = {
          locationId: key,
          locationName: d.location?.name || "",
          photos: 0,
          discountValue: 0,
          estValue: 0,
        };
      }
      byLocation[key].photos += d.photoCount;
      const monthlyRent = d.location?.rentCost ?? 0;
      const dv = monthlyRent * ((d.rentDiscountPercent ?? 0) / 100);
      byLocation[key].discountValue += dv;
      byLocation[key].estValue += d.photoCount * PHOTO_VALUE_EUR;
      totalPhotos += d.photoCount;
      totalDiscountValue += dv;
      totalEstValue += d.photoCount * PHOTO_VALUE_EUR;
    }

    return NextResponse.json({
      month,
      summary: {
        totalPhotos,
        totalDiscountValue,
        totalEstPhotoValue: totalEstValue,
        roi: totalEstValue ? (totalDiscountValue / totalEstValue).toFixed(2) : "0",
        net: totalDiscountValue - totalEstValue,
      },
      byLocation: Object.values(byLocation),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

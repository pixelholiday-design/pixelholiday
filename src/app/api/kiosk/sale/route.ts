import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PRICES } from "@/lib/stripe";

export async function POST(req: Request) {
  const { galleryId, photoIds, paymentMethod, cashPin } = await req.json();
  if (!galleryId || !Array.isArray(photoIds) || photoIds.length === 0) {
    return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });
  }

  const gallery = await prisma.gallery.findUnique({ where: { id: galleryId }, include: { photos: true } });
  if (!gallery) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const isFull = photoIds.length === gallery.photos.length;
  const unitPrice = isFull ? PRICES.FULL_GALLERY : PRICES.SINGLE_PHOTO;
  const amount = isFull ? PRICES.FULL_GALLERY : photoIds.length * PRICES.SINGLE_PHOTO;

  const order = await prisma.order.create({
    data: {
      galleryId,
      customerId: gallery.customerId,
      amount: amount / 100,
      paymentMethod,
      cashPin: paymentMethod === "CASH" ? cashPin : null,
      status: "COMPLETED",
      items: {
        create: photoIds.map((pid: string) => ({
          type: isFull ? "FULL_GALLERY" : "SINGLE_PHOTO",
          photoId: pid,
          unitPrice: unitPrice / 100,
        })),
      },
    },
  });

  await prisma.photo.updateMany({ where: { id: { in: photoIds } }, data: { isPurchased: true } });

  await prisma.gallery.update({
    where: { id: galleryId },
    data: {
      status: isFull ? "PAID" : "PARTIAL_PAID",
      partialPurchase: !isFull,
      purchasedCount: photoIds.length,
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}

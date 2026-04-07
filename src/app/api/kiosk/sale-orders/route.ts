import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { recordCommission } from "@/lib/commissions";
import { queuePrintJob } from "@/lib/print";
import { getPrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// GET — list pending orders for the photographer at the sale point
export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "PENDING";
  const orders = await prisma.saleOrder.findMany({
    where: { status: status as any },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  // Hydrate galleries + customers
  const ids = Array.from(new Set(orders.map((o) => o.galleryId)));
  const galleries = await prisma.gallery.findMany({
    where: { id: { in: ids } },
    include: { customer: true, photographer: true, photos: true },
  });
  const map = new Map(galleries.map((g) => [g.id, g]));
  return NextResponse.json({
    orders: orders.map((o) => {
      const g = map.get(o.galleryId);
      return {
        ...o,
        gallery: g
          ? {
              id: g.id,
              magicLinkToken: g.magicLinkToken,
              customer: g.customer,
              photographer: g.photographer,
              photos: g.photos.filter((p) => o.photoIds.includes(p.id)),
            }
          : null,
      };
    }),
  });
}

// POST — customer-facing kiosk creates a pending order to be picked up at sale point
const createSchema = z.object({
  galleryId: z.string().min(1),
  photoIds: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  const gallery = await prisma.gallery.findUnique({
    where: { id: parsed.data.galleryId },
    include: { photos: true },
  });
  if (!gallery) return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  const valid = new Set(gallery.photos.map((p) => p.id));
  const ids = parsed.data.photoIds.filter((i) => valid.has(i));
  if (ids.length === 0) return NextResponse.json({ ok: false, error: "No valid photos" }, { status: 400 });

  const isFull = ids.length === gallery.photos.length;
  const fullPrice = await getPrice("full_gallery");
  const singlePrice = await getPrice("single_photo");
  const totalCents = Math.round((isFull ? fullPrice : ids.length * singlePrice) * 100);

  const order = await prisma.saleOrder.create({
    data: {
      galleryId: gallery.id,
      customerId: gallery.customerId,
      photoIds: ids,
      totalCents,
    },
  });
  return NextResponse.json({ ok: true, order });
}

// PATCH — photographer confirms a sale order at the sale point
const confirmSchema = z.object({
  id: z.string().min(1),
  paymentMethod: z.enum(["POS", "CASH"]),
  receivedCents: z.number().int().nonnegative().optional(),
  staffId: z.string().min(1),
  printSize: z.string().optional(),
  printCopies: z.number().int().min(0).optional(),
});

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const so = await prisma.saleOrder.findUnique({ where: { id: parsed.data.id } });
  if (!so) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  if (so.status !== "PENDING") return NextResponse.json({ ok: false, error: "Already processed" }, { status: 409 });

  const gallery = await prisma.gallery.findUnique({ where: { id: so.galleryId } });
  if (!gallery) return NextResponse.json({ ok: false, error: "Gallery missing" }, { status: 404 });

  // Build a real Order + commissions, mark photos purchased, flip gallery.
  const isFull = so.photoIds.length === (await prisma.photo.count({ where: { galleryId: so.galleryId } }));
  const order = await prisma.order.upsert({
    where: { galleryId: so.galleryId },
    update: {
      amount: so.totalCents / 100,
      paymentMethod: parsed.data.paymentMethod === "POS" ? "STRIPE_TERMINAL" : "CASH",
      cashPin: parsed.data.paymentMethod === "CASH" ? "kiosk" : null,
      status: "COMPLETED",
    },
    create: {
      galleryId: so.galleryId,
      customerId: so.customerId,
      amount: so.totalCents / 100,
      paymentMethod: parsed.data.paymentMethod === "POS" ? "STRIPE_TERMINAL" : "CASH",
      cashPin: parsed.data.paymentMethod === "CASH" ? "kiosk" : null,
      status: "COMPLETED",
    },
  });

  await prisma.photo.updateMany({ where: { id: { in: so.photoIds } }, data: { isPurchased: true } });
  await prisma.gallery.update({
    where: { id: so.galleryId },
    data: {
      status: isFull ? "PAID" : "PARTIAL_PAID",
      partialPurchase: !isFull,
      purchasedCount: so.photoIds.length,
    },
  });

  await recordCommission({
    userId: gallery.photographerId,
    orderId: order.id,
    type: "PHOTO_SALE",
    amount: order.amount,
  });
  if (parsed.data.staffId !== gallery.photographerId) {
    await recordCommission({
      userId: parsed.data.staffId,
      orderId: order.id,
      type: "APPOINTMENT_BOOKING",
      amount: order.amount,
    });
  }

  // Optional print job
  if ((parsed.data.printCopies || 0) > 0) {
    await queuePrintJob({
      orderId: order.id,
      photoIds: so.photoIds,
      printSize: parsed.data.printSize,
      copies: parsed.data.printCopies,
    });
  }

  const change = parsed.data.paymentMethod === "CASH" && parsed.data.receivedCents
    ? Math.max(0, parsed.data.receivedCents - so.totalCents)
    : 0;

  const updated = await prisma.saleOrder.update({
    where: { id: so.id },
    data: {
      status: "COMPLETED",
      paymentMethod: parsed.data.paymentMethod,
      receivedCents: parsed.data.receivedCents,
      changeCents: change,
      staffId: parsed.data.staffId,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, saleOrder: updated, orderId: order.id, receiptCode: updated.receiptCode });
}

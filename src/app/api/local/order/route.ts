import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPrice } from "@/lib/pricing";
import { recordCommission } from "@/lib/commissions";
import { queuePrintJob } from "@/lib/print";
import { enqueueSync } from "@/lib/sync-queue";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

// ── GET — sale-kiosk pulls all pending orders for its location ────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const locationId = url.searchParams.get("locationId");
  const status = url.searchParams.get("status") || "PENDING";

  const where: any = { status };
  if (locationId) {
    const galleryIds = await prisma.gallery.findMany({
      where: { locationId },
      select: { id: true },
    });
    where.galleryId = { in: galleryIds.map((g) => g.id) };
  }

  const orders = await prisma.saleOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const galleries = await prisma.gallery.findMany({
    where: { id: { in: orders.map((o) => o.galleryId) } },
    include: { customer: true, photographer: true, photos: true },
  });
  const map = new Map(galleries.map((g) => [g.id, g]));
  return NextResponse.json(
    {
      orders: orders.map((o) => {
        const g = map.get(o.galleryId);
        return {
          ...o,
          gallery: g
            ? {
                id: g.id,
                customer: g.customer,
                photographer: g.photographer,
                photos: g.photos.filter((p) => o.photoIds.includes(p.id)),
              }
            : null,
        };
      }),
    },
    { headers: CORS }
  );
}

// ── POST — gallery kiosk creates an order to be picked up at counter ─
const createSchema = z.object({
  galleryId: z.string().min(1),
  photoIds: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400, headers: CORS });
  }
  const gallery = await prisma.gallery.findUnique({
    where: { id: parsed.data.galleryId },
    include: { photos: true },
  });
  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404, headers: CORS });
  }
  const valid = new Set(gallery.photos.map((p) => p.id));
  const ids = parsed.data.photoIds.filter((i) => valid.has(i));
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "No valid photos" }, { status: 400, headers: CORS });
  }

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

  await enqueueSync({
    type: "order",
    action: "create",
    localId: order.id,
    payload: { galleryId: gallery.id, photoIds: ids, totalCents },
    priority: 1,
  });

  return NextResponse.json({ ok: true, order }, { headers: CORS });
}

// ── PATCH — sale kiosk confirms payment ──────────────────────────────
const confirmSchema = z.object({
  id: z.string().min(1),
  paymentMethod: z.enum(["POS", "CASH"]),
  receivedCents: z.number().int().nonnegative().optional(),
  staffId: z.string().min(1),
  staffPin: z.string().min(4).max(8),
  printSize: z.string().optional(),
  printCopies: z.number().int().min(0).optional(),
});

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400, headers: CORS });
  }

  // PIN-verify staff
  const staff = await prisma.user.findUnique({ where: { id: parsed.data.staffId } });
  if (!staff || staff.pin !== parsed.data.staffPin) {
    return NextResponse.json({ ok: false, error: "PIN verification failed" }, { status: 401, headers: CORS });
  }

  const so = await prisma.saleOrder.findUnique({ where: { id: parsed.data.id } });
  if (!so) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404, headers: CORS });
  if (so.status !== "PENDING") {
    return NextResponse.json({ ok: false, error: "Already processed" }, { status: 409, headers: CORS });
  }

  const gallery = await prisma.gallery.findUnique({ where: { id: so.galleryId } });
  if (!gallery) return NextResponse.json({ ok: false, error: "Gallery missing" }, { status: 404, headers: CORS });

  const isFull = so.photoIds.length === (await prisma.photo.count({ where: { galleryId: so.galleryId } }));

  const order = await prisma.order.upsert({
    where: { galleryId: so.galleryId },
    update: {
      amount: so.totalCents / 100,
      paymentMethod: parsed.data.paymentMethod === "POS" ? "STRIPE_TERMINAL" : "CASH",
      cashPin: parsed.data.paymentMethod === "CASH" ? parsed.data.staffPin : null,
      status: "COMPLETED",
    },
    create: {
      galleryId: so.galleryId,
      customerId: so.customerId,
      amount: so.totalCents / 100,
      paymentMethod: parsed.data.paymentMethod === "POS" ? "STRIPE_TERMINAL" : "CASH",
      cashPin: parsed.data.paymentMethod === "CASH" ? parsed.data.staffPin : null,
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

  if ((parsed.data.printCopies || 0) > 0) {
    await queuePrintJob({
      orderId: order.id,
      photoIds: so.photoIds,
      printSize: parsed.data.printSize,
      copies: parsed.data.printCopies,
    });
  }

  const change =
    parsed.data.paymentMethod === "CASH" && parsed.data.receivedCents
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

  // Queue both the SaleOrder completion and the real Order for cloud sync
  await enqueueSync({ type: "order", action: "update", localId: updated.id, payload: updated, priority: 1 });
  await enqueueSync({ type: "order", action: "update", localId: order.id, payload: { paid: true }, priority: 1 });

  return NextResponse.json(
    { ok: true, saleOrder: updated, orderId: order.id, receiptCode: updated.receiptCode },
    { headers: CORS }
  );
}

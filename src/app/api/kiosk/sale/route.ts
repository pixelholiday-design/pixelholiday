import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { PRICES } from "@/lib/stripe";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { recordCommission } from "@/lib/commissions";
import { awardXP } from "@/lib/gamification/xp";

const schema = z.object({
  galleryId: z.string().min(1),
  photoIds: z.array(z.string().min(1)).min(1),
  paymentMethod: z.enum(["STRIPE_TERMINAL", "CASH"]),
  cashPin: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const staff = await requireStaff();
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { galleryId, photoIds, paymentMethod, cashPin } = parsed.data;
    if (paymentMethod === "CASH" && !cashPin) {
      return NextResponse.json({ ok: false, error: "Cash PIN required" }, { status: 400 });
    }

    const gallery = await prisma.gallery.findUnique({ where: { id: galleryId }, include: { photos: true } });
    if (!gallery) return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });

    const validIds = new Set(gallery.photos.map((p) => p.id));
    const cleanIds = photoIds.filter((id) => validIds.has(id));
    if (cleanIds.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid photos selected" }, { status: 400 });
    }

    const isFull = cleanIds.length === gallery.photos.length;
    const unitPrice = isFull ? PRICES.FULL_GALLERY : PRICES.SINGLE_PHOTO;
    const amount = isFull ? PRICES.FULL_GALLERY : cleanIds.length * PRICES.SINGLE_PHOTO;

    const order = await prisma.order.create({
      data: {
        galleryId,
        customerId: gallery.customerId,
        amount: amount / 100,
        paymentMethod,
        cashPin: paymentMethod === "CASH" ? cashPin : null,
        status: "COMPLETED",
        items: {
          create: cleanIds.map((pid) => ({
            type: isFull ? "FULL_GALLERY" : "SINGLE_PHOTO",
            photoId: pid,
            unitPrice: unitPrice / 100,
          })),
        },
      },
    });

    await prisma.photo.updateMany({ where: { id: { in: cleanIds } }, data: { isPurchased: true } });

    await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        status: isFull ? "PAID" : "PARTIAL_PAID",
        partialPurchase: !isFull,
        purchasedCount: cleanIds.length,
      },
    });

    // Commissions: photographer + kiosk closer (if different)
    await recordCommission({
      userId: gallery.photographerId,
      orderId: order.id,
      type: "PHOTO_SALE",
      amount: order.amount,
    });
    if (staff.id !== gallery.photographerId) {
      await recordCommission({
        userId: staff.id,
        orderId: order.id,
        type: "APPOINTMENT_BOOKING",
        amount: order.amount,
      });
    }

    // Gamification — XP for the photographer based on sale tier, and for the
    // closer if different. Big sales unlock badges via checkAndAwardBadges
    // (called inside awardXP).
    const tier =
      order.amount >= 200 ? "sale_close_200plus" : order.amount >= 100 ? "sale_close_100plus" : "sale_close";
    const photogXp = await awardXP(gallery.photographerId, tier, { orderId: order.id, amount: order.amount });
    let closerXp = null;
    if (staff.id !== gallery.photographerId) {
      closerXp = await awardXP(staff.id, "sale_close", { orderId: order.id });
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      gamification: { photographer: photogXp, closer: closerXp },
    });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    console.error("kiosk/sale error", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { recordCommission, calculateStripeFee } from "@/lib/commissions";
import { awardXP } from "@/lib/gamification/xp";
import { getPrice } from "@/lib/pricing";

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

    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: { photos: true, location: true },
    });
    if (!gallery) return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });

    const validIds = new Set(gallery.photos.map((p) => p.id));
    const cleanIds = photoIds.filter((id) => validIds.has(id));
    if (cleanIds.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid photos selected" }, { status: 400 });
    }

    const isFull = cleanIds.length === gallery.photos.length;
    const locationId = gallery.locationId || null;

    // CRITICAL FIX: Use PricingConfig instead of hardcoded PRICES.
    // This ensures location-specific pricing works at kiosks.
    let unitPriceEur: number;
    let totalAmountEur: number;
    if (isFull) {
      unitPriceEur = await getPrice("full_gallery", locationId);
      totalAmountEur = unitPriceEur;
    } else {
      unitPriceEur = await getPrice("single_photo", locationId);
      totalAmountEur = cleanIds.length * unitPriceEur;
    }

    // Calculate Stripe fee for terminal payments (cash = 0)
    const stripeFee = calculateStripeFee(totalAmountEur, paymentMethod);
    const netAmount = Math.round((totalAmountEur - stripeFee) * 100) / 100;

    // Tax from location
    const taxRate = gallery.location?.taxRate ?? 0;
    const taxAmount = taxRate > 0 ? Math.round(totalAmountEur * taxRate / (1 + taxRate) * 100) / 100 : 0;

    const order = await prisma.order.create({
      data: {
        galleryId,
        customerId: gallery.customerId,
        amount: totalAmountEur,
        stripeFee,
        netAmount,
        taxAmount,
        taxRate,
        paymentMethod,
        cashPin: paymentMethod === "CASH" ? cashPin : null,
        status: "COMPLETED",
        items: {
          create: cleanIds.map((pid) => ({
            type: isFull ? "FULL_GALLERY" : "SINGLE_PHOTO",
            photoId: pid,
            unitPrice: unitPriceEur,
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
    // Commission is now calculated on NET amount (after Stripe fees)
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

    // Cash register: record the transaction
    if (paymentMethod === "CASH") {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reg = await prisma.cashRegister.findFirst({
          where: { locationId: gallery.locationId, date: today, status: "OPEN" },
        });
        if (reg) {
          await prisma.cashTransaction.create({
            data: {
              cashRegisterId: reg.id,
              orderId: order.id,
              type: "SALE",
              amount: totalAmountEur,
              staffId: staff.id,
              staffPin: cashPin || "",
              customerName: null,
              description: `Kiosk sale: ${isFull ? "Full gallery" : `${cleanIds.length} photos`}`,
            },
          });
          const { recomputeRegister } = await import("@/lib/cash");
          await recomputeRegister(reg.id);
        }
      } catch (e) {
        console.warn("Cash register update failed (non-fatal)", e);
      }
    }

    // Gamification — XP for the photographer
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
      amount: totalAmountEur,
      stripeFee,
      netAmount,
      gamification: { photographer: photogXp, closer: closerXp },
    });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    console.error("kiosk/sale error", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

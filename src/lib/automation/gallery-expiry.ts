import { prisma } from "@/lib/db";
import {
  sendGalleryExpiry14,
  sendGalleryExpiry7,
  sendGalleryExpiry48,
  emailGalleryExpired,
} from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { cleanUrl, photoRef } from "@/lib/cloudinary";

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EXPIRY-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function galleryUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/gallery/${token}`;
}

/** Send to email and/or WhatsApp — never pass a phone number to Resend */
async function notifyCustomer(
  customer: { email: string | null; whatsapp: string | null },
  emailFn: ((...args: any[]) => Promise<any>) | null,
  emailArgs: any[],
  whatsAppBody: string,
) {
  try {
    if (customer.email && emailFn) {
      await emailFn(customer.email, ...emailArgs);
    }
    if (customer.whatsapp) {
      await sendWhatsAppMessage(customer.whatsapp, whatsAppBody);
    }
  } catch (e) {
    console.warn("[gallery-expiry] notification error:", e);
  }
}

export async function runGalleryExpiryAutomation() {
  const now = new Date();
  const counts = { warning14: 0, warning7: 0, warning48: 0, expired: 0 };

  // ── 14-day warning ──
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const galleries14 = await prisma.gallery.findMany({
    where: {
      status: { notIn: ["PAID", "EXPIRED", "DIGITAL_PASS"] },
      expiresAt: { lte: in14Days, gt: now },
      expiryWarning14: null,
    },
    include: { customer: true, photos: { where: { isHookImage: true }, take: 1 } },
  });

  for (const g of galleries14) {
    const url = galleryUrl(g.magicLinkToken);
    const coverPhoto = g.photos[0] ? cleanUrl(photoRef(g.photos[0]), 600) : undefined;
    await notifyCustomer(
      g.customer,
      (to: string) => sendGalleryExpiry14(to, {
        customerName: g.customer.name || "Guest",
        galleryUrl: url,
        coverPhotoUrl: coverPhoto,
      }),
      [],
      `📸 Your Fotiqo gallery expires in 14 days! View now: ${url}`,
    );
    await prisma.gallery.update({
      where: { id: g.id },
      data: { expiryWarning14: now },
    });
    counts.warning14++;
  }

  // ── 7-day warning ──
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const galleries7 = await prisma.gallery.findMany({
    where: {
      status: { notIn: ["PAID", "EXPIRED", "DIGITAL_PASS"] },
      expiresAt: { lte: in7Days, gt: now },
      expiryWarning7: null,
      expiryWarning14: { not: null },
    },
    include: { customer: true, photos: { where: { isHookImage: true }, take: 1 } },
  });

  for (const g of galleries7) {
    const url = galleryUrl(g.magicLinkToken);
    const coverPhoto = g.photos[0] ? cleanUrl(photoRef(g.photos[0]), 600) : undefined;
    await notifyCustomer(
      g.customer,
      (to: string) => sendGalleryExpiry7(to, {
        customerName: g.customer.name || "Guest",
        galleryUrl: url,
        coverPhotoUrl: coverPhoto,
      }),
      [],
      `⏰ Only 7 days left to get your photos! View: ${url}`,
    );
    await prisma.gallery.update({
      where: { id: g.id },
      data: { expiryWarning7: now },
    });
    counts.warning7++;
  }

  // ── 48-hour warning + auto-create 20% coupon ──
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const galleries48 = await prisma.gallery.findMany({
    where: {
      status: { notIn: ["PAID", "EXPIRED", "DIGITAL_PASS"] },
      expiresAt: { lte: in48Hours, gt: now },
      expiryWarning48: null,
      expiryWarning7: { not: null },
    },
    include: { customer: true, photos: { where: { isHookImage: true }, take: 1 } },
  });

  for (const g of galleries48) {
    const code = generateCouponCode();
    await prisma.coupon.create({
      data: {
        code,
        type: "PERCENTAGE",
        value: 20,
        maxUses: 1,
        expiresAt: g.expiresAt,
        isActive: true,
        // FIX: Tie coupon to this specific gallery so it can't be used on other galleries
        galleryId: g.id,
      },
    });

    const url = galleryUrl(g.magicLinkToken);
    const coverPhoto = g.photos[0] ? cleanUrl(photoRef(g.photos[0]), 600) : undefined;
    await notifyCustomer(
      g.customer,
      (to: string) => sendGalleryExpiry48(to, {
        customerName: g.customer.name || "Guest",
        galleryUrl: url,
        discountCode: code,
        discountPercent: 20,
        coverPhotoUrl: coverPhoto,
      }),
      [],
      `🎁 Last 48 hours! Get 20% off with code ${code}: ${url}`,
    );
    await prisma.gallery.update({
      where: { id: g.id },
      data: { expiryWarning48: now },
    });
    counts.warning48++;
  }

  // ── Mark expired galleries ──
  const expiredResult = await prisma.gallery.updateMany({
    where: {
      status: { notIn: ["PAID", "EXPIRED", "DIGITAL_PASS"] },
      expiresAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });
  counts.expired = expiredResult.count;

  // Send expiry notification for galleries that just expired and haven't been notified
  const justExpired = await prisma.gallery.findMany({
    where: {
      status: "EXPIRED",
      expiryFinalSent: null,
    },
    include: { customer: true },
  });

  for (const g of justExpired) {
    await notifyCustomer(
      g.customer,
      emailGalleryExpired,
      [],
      `Your Fotiqo gallery has expired. Contact us if you'd like to restore it.`,
    );
    await prisma.gallery.update({
      where: { id: g.id },
      data: { expiryFinalSent: now },
    });
  }

  return counts;
}

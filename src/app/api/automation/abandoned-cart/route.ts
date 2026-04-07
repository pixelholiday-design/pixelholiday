import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppAbandonedCart } from "@/lib/whatsapp";
import { emailAbandonedCart } from "@/lib/email";

export async function POST() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const candidates = await prisma.gallery.findMany({
    where: {
      status: "PREVIEW_ECOM",
      order: null,
      customer: { lastViewedAt: { lte: threeDaysAgo }, cartAbandoned: false },
    },
    include: { customer: true },
  });

  for (const g of candidates) {
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${g.magicLinkToken}`;
    const code = "WELCOME15";
    if (g.customer.whatsapp) await sendWhatsAppAbandonedCart(g.customer.whatsapp, link, code);
    if (g.customer.email) await emailAbandonedCart(g.customer.email, link, code);
    await prisma.customer.update({
      where: { id: g.customerId },
      data: { cartAbandoned: true, cartAbandonedAt: new Date() },
    });
    await prisma.gallery.update({ where: { id: g.id }, data: { discountPercent: 0.15 } });
  }
  return NextResponse.json({ triggered: candidates.length });
}

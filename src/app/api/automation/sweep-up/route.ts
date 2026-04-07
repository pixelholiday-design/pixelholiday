import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppSweepUp } from "@/lib/whatsapp";
import { emailSweepUp } from "@/lib/email";

export async function POST() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const candidates = await prisma.gallery.findMany({
    where: {
      partialPurchase: true,
      sweepUpSentAt: null,
      createdAt: { lte: sevenDaysAgo },
    },
    include: { customer: true },
  });

  for (const g of candidates) {
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${g.magicLinkToken}`;
    if (g.customer.whatsapp) await sendWhatsAppSweepUp(g.customer.whatsapp, link, 50);
    if (g.customer.email) await emailSweepUp(g.customer.email, link, 50);
    await prisma.gallery.update({
      where: { id: g.id },
      data: { sweepUpSentAt: new Date(), discountPercent: 0.5 },
    });
  }
  return NextResponse.json({ triggered: candidates.length });
}

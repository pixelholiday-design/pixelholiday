import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

/**
 * POST /api/hotel/checkout
 * Called when guest checks out. Triggers sleeping money sequence for unpurchased galleries.
 */
export async function POST(req: Request) {
  try {
    const { roomNumber, locationId } = await req.json();

    if (!roomNumber || !locationId) {
      return NextResponse.json({ error: "roomNumber and locationId required" }, { status: 400 });
    }

    // Find the most recent customer for this room at this location
    const customer = await prisma.customer.findFirst({
      where: { roomNumber, locationId },
      orderBy: { createdAt: "desc" },
    });

    if (!customer) {
      return NextResponse.json({ error: "No customer found for this room" }, { status: 404 });
    }

    // Find unpurchased galleries
    const unpurchasedGalleries = await prisma.gallery.findMany({
      where: {
        customerId: customer.id,
        status: { in: ["HOOK_ONLY", "PREVIEW_ECOM", "PARTIAL_PAID"] },
      },
      include: { photos: { select: { id: true } } },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Trigger sleeping money sequence for each unpurchased gallery
    if (unpurchasedGalleries.length > 0 && customer.whatsapp) {
      const galleryLinks = unpurchasedGalleries
        .map((g) => `${appUrl}/gallery/${g.magicLinkToken}`)
        .join("\n");

      await sendWhatsAppMessage(
        customer.whatsapp,
        `Thank you for staying with us! Don't forget your holiday photos. View & purchase here:\n${galleryLinks}`
      );

      // Mark galleries for sweep-up automation
      for (const g of unpurchasedGalleries) {
        if (!g.sweepUpSentAt) {
          await prisma.gallery.update({
            where: { id: g.id },
            data: { discountPercent: 0.15 },
          });
        }
      }
    }

    return NextResponse.json({
      customerId: customer.id,
      unpurchasedGalleries: unpurchasedGalleries.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Checkout failed" }, { status: 500 });
  }
}

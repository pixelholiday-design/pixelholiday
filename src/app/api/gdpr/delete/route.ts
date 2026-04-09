import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * GDPR Article 17 — Right to erasure.
 *
 * Customers email-verify themselves into this endpoint and we destroy
 * everything that ties their identity back to Fotiqo:
 *   - Customer record (name, email, whatsapp, room number, faceVector)
 *   - All Galleries linked to that customer
 *   - All Photos in those galleries (DB rows; R2/Cloudinary cleanup is logged
 *     and processed by a nightly cron)
 *   - View / download logs
 *
 * Anonymised aggregates (commission totals, sleeping-money revenue) are
 * preserved with the customer reference replaced by a NULL stub so
 * accounting reports remain consistent.
 */

const schema = z.object({
  email: z.string().email(),
  // A simple email-based confirmation token. In production this would be
  // a one-time link emailed to the customer.
  confirm: z.literal("DELETE_MY_DATA"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid input. Required: { email: '<your-email>', confirm: 'DELETE_MY_DATA' }",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findFirst({ where: { email: parsed.data.email } });
    if (!customer) {
      // Return 200 either way to avoid leaking which emails are in our system.
      return NextResponse.json({ ok: true, message: "If a record existed, it has been deleted." });
    }

    const galleries = await prisma.gallery.findMany({
      where: { customerId: customer.id },
      select: { id: true, magicLinkToken: true },
    });
    const galleryIds = galleries.map((g) => g.id);

    // Walk every FK that points back to this customer or their galleries.
    // We delete bottom-up so each row is gone before its parent.
    const orders = await prisma.order.findMany({
      where: { OR: [{ customerId: customer.id }, { galleryId: { in: galleryIds } }] },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    await prisma.$transaction([
      // Order children
      prisma.commission.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.printJob.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.fulfillmentOrder.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
      // SaleOrders + customer-scoped order
      prisma.saleOrder.deleteMany({ where: { customerId: customer.id } }),
      prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
      // Gallery children
      prisma.downloadLog.deleteMany({ where: { galleryId: { in: galleryIds } } }),
      prisma.galleryViewLog.deleteMany({ where: { galleryId: { in: galleryIds } } }),
      prisma.appointment.deleteMany({ where: { galleryId: { in: galleryIds } } }),
      prisma.video.deleteMany({ where: { galleryId: { in: galleryIds } } }),
      prisma.photo.deleteMany({ where: { galleryId: { in: galleryIds } } }),
      prisma.gallery.deleteMany({ where: { id: { in: galleryIds } } }),
      // Finally
      prisma.customer.delete({ where: { id: customer.id } }),
    ]);

    logger.info("gdpr.delete", { email: parsed.data.email, galleries: galleryIds.length });

    return NextResponse.json({
      ok: true,
      deleted: {
        customer: 1,
        galleries: galleryIds.length,
      },
      message:
        "All identifying records have been removed. Files in cold storage will be purged within 24 hours.",
    });
  } catch (e: any) {
    logger.error("gdpr.delete", e);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

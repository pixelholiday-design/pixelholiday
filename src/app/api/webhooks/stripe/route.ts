import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { recordCommission } from "@/lib/commissions";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") || "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const raw = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  // Idempotency — skip already processed events
  try {
    await prisma.processedWebhookEvent.create({ data: { id: event.id, source: "stripe" } });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const galleryId = session.metadata?.galleryId;
    if (galleryId) {
      try {
        const gallery = await prisma.gallery.update({
          where: { id: galleryId },
          data: { status: "PAID" },
          include: { customer: true, photos: true, photographer: true },
        });
        const amount = (session.amount_total || 0) / 100;
        // Order has @unique on galleryId — upsert so re-runs and seeded test data don't collide
        const order = await prisma.order.upsert({
          where: { galleryId },
          update: {
            amount,
            paymentMethod: "STRIPE_ONLINE",
            stripeSessionId: session.id,
            status: "COMPLETED",
          },
          create: {
            galleryId,
            customerId: gallery.customerId,
            amount,
            paymentMethod: "STRIPE_ONLINE",
            stripeSessionId: session.id,
            status: "COMPLETED",
          },
        });

        // Photographer 10% (helper is itself idempotent on orderId)
        await recordCommission({
          userId: gallery.photographerId,
          orderId: order.id,
          type: "PHOTO_SALE",
          amount: order.amount,
        });

        // Delivery email
        if (process.env.RESEND_API_KEY && gallery.customer.email) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: process.env.FROM_EMAIL || "hello@pixelholiday.local",
              to: gallery.customer.email,
              subject: "✨ Your PixelHoliday memories are ready!",
              html: `<p>Your gallery is unlocked. <a href="${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.magicLinkToken}">View now</a></p>`,
            });
          } catch (e) {
            console.warn("Resend failed", e);
          }
        } else {
          console.log(`[Email MOCK → ${gallery.customer.email}] Gallery PAID, link: /gallery/${gallery.magicLinkToken}`);
        }
      } catch (e: any) {
        console.error("stripe webhook handler error", e);
        return NextResponse.json({ error: e?.message || "handler failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { recordCommission, calculateStripeFee } from "@/lib/commissions";

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

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    const failureMessage = pi.last_payment_error?.message || "Unknown failure";
    console.error(`[Stripe] payment_intent.payment_failed — id: ${pi.id}, reason: ${failureMessage}`);
    try {
      await prisma.order.updateMany({
        where: { stripeSessionId: pi.id, status: "PENDING" },
        data: { status: "FAILED" },
      });
    } catch (e) {
      console.warn("[Stripe] Could not update order on payment failure", e);
    }
  }

  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object;
    console.error(
      `[Stripe] charge.dispute.created — dispute: ${dispute.id}, charge: ${dispute.charge}, amount: ${dispute.amount}, reason: ${dispute.reason}`
    );
    try {
      await prisma.aIGrowthLog.create({
        data: {
          type: "PRICING_OPTIMIZATION",
          description: `Stripe dispute created — charge ${dispute.charge}, reason: ${dispute.reason}`,
          result: `Dispute ID: ${dispute.id}, Amount: ${dispute.amount / 100} ${dispute.currency?.toUpperCase()}`,
          dataSnapshot: { disputeId: dispute.id, chargeId: dispute.charge, reason: dispute.reason, amount: dispute.amount },
        },
      });
    } catch (e) {
      console.warn("[Stripe] Could not log dispute to AIGrowthLog", e);
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Handle gift card purchase fulfillment
    // NOTE: Gift card purchase = DEFERRED REVENUE, not income
    if (session.metadata?.type === "GIFT_CARD") {
      try {
        const { purchaseGiftCard } = await import("@/lib/gift-cards");
        await purchaseGiftCard({
          amount: parseFloat(session.metadata.amount),
          currency: session.metadata.currency || "EUR",
          purchasedBy: session.metadata.purchasedBy || "anonymous",
          stripeSessionId: session.id,
        });
      } catch (e: any) {
        console.error("[Stripe] Gift card creation error:", e.message);
      }
    }

    // Handle shop order fulfillment
    const shopOrderId = session.metadata?.shopOrderId;
    if (shopOrderId) {
      try {
        const { fulfillOrder } = await import("@/lib/fulfillment/index");
        await fulfillOrder(shopOrderId).catch((e: Error) =>
          console.error("[Stripe] Shop order fulfillment error:", e.message)
        );
      } catch (e: any) {
        console.error("[Stripe] Failed to import/run fulfillOrder:", e.message);
      }
    }

    // Handle package booking payment (Bokun-style instant booking)
    const packageBookingId = session.metadata?.packageBookingId;
    if (packageBookingId) {
      try {
        const { recordPackageBookingCommission } = await import("@/lib/commissions");

        const pkgBooking = await prisma.packageBooking.update({
          where: { id: packageBookingId },
          data: {
            stripeSessionId: session.id,
            stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
            isPaid: true,
            paidAt: new Date(),
            status: "PAID",
          },
        });

        // Calculate and record commission
        if (pkgBooking.assignedPhotographerId) {
          await recordPackageBookingCommission({
            bookingId: packageBookingId,
            photographerId: pkgBooking.assignedPhotographerId,
            totalPrice: pkgBooking.totalPrice,
            paymentMethod: "STRIPE_ONLINE",
          });
        }

        // Send confirmation email
        if (process.env.RESEND_API_KEY && pkgBooking.customerEmail) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pixelholiday.vercel.app";
            await resend.emails.send({
              from: process.env.FROM_EMAIL || "hello@pixelvo.local",
              to: pkgBooking.customerEmail,
              subject: `Booking Confirmed! ${pkgBooking.confirmationCode}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #0C1829;">Booking Confirmed!</h1>
                  <p>Your confirmation code: <strong style="font-size: 24px; letter-spacing: 2px;">${pkgBooking.confirmationCode}</strong></p>
                  <p><strong>Date:</strong> ${pkgBooking.sessionDate.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  <p><strong>Time:</strong> ${pkgBooking.sessionStartTime}</p>
                  <p><strong>Amount Paid:</strong> ${pkgBooking.currency} ${pkgBooking.totalPrice.toFixed(2)}</p>
                  <p><a href="${baseUrl}/book/confirmation/${pkgBooking.id}" style="display: inline-block; padding: 12px 24px; background: #E8593C; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Booking Details</a></p>
                </div>
              `,
            });
          } catch (e) {
            console.warn("[Stripe] Package booking email failed:", e);
          }
        }
      } catch (e: any) {
        console.error("[Stripe] Package booking payment error:", e.message);
      }
    }

    // Handle marketplace booking payment
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      try {
        const amount = (session.amount_total || 0) / 100;
        const { recordMarketplaceCommission } = await import("@/lib/commissions");

        const booking = await prisma.marketplaceBooking.update({
          where: { id: bookingId },
          data: {
            stripeSessionId: session.id,
            stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
            isPaid: true,
            paidAt: new Date(),
            status: "DEPOSIT_PAID",
            payoutStatus: "PENDING", // Funds held until session completed
          },
        });

        // Calculate and record marketplace commission
        await recordMarketplaceCommission({
          bookingId,
          photographerId: booking.photographerId,
          totalPrice: booking.totalPrice,
          paymentMethod: "STRIPE_ONLINE",
        });
      } catch (e: any) {
        console.error("[Stripe] Marketplace booking payment error:", e.message);
      }
    }

    const galleryId = session.metadata?.galleryId;
    if (galleryId) {
      try {
        const gallery = await prisma.gallery.update({
          where: { id: galleryId },
          data: { status: "PAID" },
          include: { customer: true, photos: true, photographer: true, location: true },
        });
        const grossAmount = (session.amount_total || 0) / 100;
        const stripeFee = calculateStripeFee(grossAmount, "STRIPE_ONLINE");
        const netAmount = Math.round((grossAmount - stripeFee) * 100) / 100;

        // Determine tax from location
        const taxRate = gallery.location?.taxRate ?? 0;
        const taxAmount = taxRate > 0 ? Math.round(grossAmount * taxRate / (1 + taxRate) * 100) / 100 : 0;

        // Order has @unique on galleryId — upsert so re-runs and seeded test data don't collide
        const order = await prisma.order.upsert({
          where: { galleryId },
          update: {
            amount: grossAmount,
            stripeFee,
            netAmount,
            taxAmount,
            taxRate,
            paymentMethod: "STRIPE_ONLINE",
            stripeSessionId: session.id,
            status: "COMPLETED",
          },
          create: {
            galleryId,
            customerId: gallery.customerId,
            amount: grossAmount,
            stripeFee,
            netAmount,
            taxAmount,
            taxRate,
            paymentMethod: "STRIPE_ONLINE",
            stripeSessionId: session.id,
            status: "COMPLETED",
          },
        });

        // Photographer commission — calculated on NET amount (after Stripe fees)
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
              from: process.env.FROM_EMAIL || "hello@pixelvo.local",
              to: gallery.customer.email,
              subject: "Your Pixelvo memories are ready!",
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

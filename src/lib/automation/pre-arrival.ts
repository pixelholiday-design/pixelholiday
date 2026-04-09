/**
 * Pre-Arrival Automation — Module 11
 *
 * 1. 2 hours after check-in: send Digital Pass offer
 * 2. Day before checkout: send reminder to collect photos
 *
 * Designed to be called from /api/automation/cron or a scheduled job.
 */
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DIGITAL_PASS_PRICE = 150; // EUR

/**
 * Send Digital Pass offer to guests who checked in ~2 hours ago.
 * Skips customers who already have a Digital Pass or were already sent the offer.
 */
export async function sendDigitalPassOffers() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

  const customers = await prisma.customer.findMany({
    where: {
      checkInDate: { gte: threeHoursAgo, lte: twoHoursAgo },
      hasDigitalPass: false,
      preArrivalOfferSentAt: null,
      whatsapp: { not: null },
    },
    include: { galleries: { select: { id: true } } },
  });

  const results: { customerId: string; sent: boolean }[] = [];

  for (const customer of customers) {
    if (!customer.whatsapp) continue;

    const passLink = `${APP_URL}/pass/purchase?customerId=${customer.id}`;

    await sendWhatsAppMessage(
      customer.whatsapp,
      `Enjoy unlimited photos during your stay! Digital Pass from \u20AC${DIGITAL_PASS_PRICE}. Buy now: ${passLink}`
    );

    await prisma.customer.update({
      where: { id: customer.id },
      data: { preArrivalOfferSentAt: new Date() },
    });

    results.push({ customerId: customer.id, sent: true });
  }

  return { processed: results.length, results };
}

/**
 * Send checkout reminder to guests whose checkout is tomorrow.
 * Reminds them to collect/purchase their photos before leaving.
 */
export async function sendCheckoutReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const customers = await prisma.customer.findMany({
    where: {
      checkOutDate: { gte: tomorrow, lt: dayAfter },
      checkoutReminderSentAt: null,
      whatsapp: { not: null },
    },
    include: {
      galleries: {
        where: { status: { in: ["HOOK_ONLY", "PREVIEW_ECOM", "PARTIAL_PAID"] } },
        select: { magicLinkToken: true },
      },
    },
  });

  const results: { customerId: string; sent: boolean }[] = [];

  for (const customer of customers) {
    if (!customer.whatsapp || customer.galleries.length === 0) continue;

    const galleryLink = `${APP_URL}/gallery/${customer.galleries[0].magicLinkToken}`;

    await sendWhatsAppMessage(
      customer.whatsapp,
      `Your holiday ends tomorrow! Don't forget to collect your photos: ${galleryLink}`
    );

    await prisma.customer.update({
      where: { id: customer.id },
      data: { checkoutReminderSentAt: new Date() },
    });

    results.push({ customerId: customer.id, sent: true });
  }

  return { processed: results.length, results };
}

/**
 * Run all pre-arrival automations. Called by cron endpoint.
 */
export async function runPreArrivalAutomation() {
  const offers = await sendDigitalPassOffers();
  const reminders = await sendCheckoutReminders();
  return { digitalPassOffers: offers, checkoutReminders: reminders };
}

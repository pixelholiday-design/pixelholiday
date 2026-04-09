/**
 * Email templates via Resend. In dev (no API key), logs to console.
 */
import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.FROM_EMAIL || "noreply@fotiqo.com";
const resend = KEY ? new Resend(KEY) : null;

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[Email MOCK → ${to}] ${subject}`);
    return { mocked: true };
  }
  return resend.emails.send({ from: FROM, to, subject, html });
}

export async function emailPaymentReceipt(to: string, amount: number, link: string) {
  return send(to, "Your Fotiqo receipt", `<p>Thank you! Total: €${amount}</p><p><a href="${link}">View gallery</a></p>`);
}
export async function emailGalleryLink(to: string, link: string) {
  return send(to, "Your photos are ready", `<p>Tap to view: <a href="${link}">${link}</a></p>`);
}
export async function emailAbandonedCart(to: string, link: string, code: string) {
  return send(to, "Missing your holiday? 15% off", `<p>Get your memories now: <a href="${link}">${link}</a></p><p>Use code: <strong>${code}</strong></p>`);
}
export async function emailSweepUp(to: string, link: string, percent: number) {
  return send(to, `${percent}% off your remaining photos`, `<p>Unlock the rest: <a href="${link}">${link}</a></p>`);
}

/* ── Gallery expiry sequence ─────────────────────── */
export async function emailExpiryWarning14(to: string, galleryLink: string) {
  return send(
    to,
    "Your gallery expires in 14 days",
    `<p>Your holiday photos will be removed in 14 days.</p><p>View and download them now: <a href="${galleryLink}">${galleryLink}</a></p>`,
  );
}

export async function emailExpiryWarning7(to: string, galleryLink: string) {
  return send(
    to,
    "Only 7 days left to grab your photos",
    `<p>Time is running out! Your photo gallery expires in just 7 days.</p><p>Don't lose your memories: <a href="${galleryLink}">${galleryLink}</a></p>`,
  );
}

export async function emailExpiryWarning48(to: string, galleryLink: string, couponCode: string) {
  return send(
    to,
    "48 hours left - here's 20% off",
    `<p>Your gallery expires in 48 hours! Use code <strong>${couponCode}</strong> for 20% off before it's gone.</p><p><a href="${galleryLink}">${galleryLink}</a></p>`,
  );
}

export async function emailGalleryExpired(to: string) {
  return send(
    to,
    "Your gallery has expired",
    `<p>Your photo gallery has expired and is no longer available. Contact us if you'd like to discuss options.</p>`,
  );
}

/* ── Rich HTML templates (email-templates/) ───────── */
import { galleryDeliveryEmail } from "./email-templates/gallery-delivery";
import { galleryExpiry14Email } from "./email-templates/gallery-expiry-14";
import { galleryExpiry7Email } from "./email-templates/gallery-expiry-7";
import { galleryExpiry48Email } from "./email-templates/gallery-expiry-48";
import { orderConfirmationEmail } from "./email-templates/order-confirmation";
import { welcomeEmail } from "./email-templates/welcome";
import { bookingConfirmationEmail } from "./email-templates/booking-confirmation";
import { reviewRequestEmail } from "./email-templates/review-request";
import { hotelWelcomeEmail } from "./email-templates/hotel-welcome";
import { digitalPassOfferEmail } from "./email-templates/digital-pass-offer";
import { sleepingMoneyEmail } from "./email-templates/sleeping-money";

export async function sendGalleryDelivery(to: string, params: Parameters<typeof galleryDeliveryEmail>[0]) {
  const { subject, html } = galleryDeliveryEmail(params);
  return send(to, subject, html);
}

export async function sendGalleryExpiry14(to: string, params: Parameters<typeof galleryExpiry14Email>[0]) {
  const { subject, html } = galleryExpiry14Email(params);
  return send(to, subject, html);
}

export async function sendGalleryExpiry7(to: string, params: Parameters<typeof galleryExpiry7Email>[0]) {
  const { subject, html } = galleryExpiry7Email(params);
  return send(to, subject, html);
}

export async function sendGalleryExpiry48(to: string, params: Parameters<typeof galleryExpiry48Email>[0]) {
  const { subject, html } = galleryExpiry48Email(params);
  return send(to, subject, html);
}

export async function sendOrderConfirmation(to: string, params: Parameters<typeof orderConfirmationEmail>[0]) {
  const { subject, html } = orderConfirmationEmail(params);
  return send(to, subject, html);
}

export async function sendWelcome(to: string, params: Parameters<typeof welcomeEmail>[0]) {
  const { subject, html } = welcomeEmail(params);
  return send(to, subject, html);
}

export async function sendBookingConfirmation(to: string, params: Parameters<typeof bookingConfirmationEmail>[0]) {
  const { subject, html } = bookingConfirmationEmail(params);
  return send(to, subject, html);
}

export async function sendReviewRequest(to: string, params: Parameters<typeof reviewRequestEmail>[0]) {
  const { subject, html } = reviewRequestEmail(params);
  return send(to, subject, html);
}

export async function sendHotelWelcome(to: string, params: Parameters<typeof hotelWelcomeEmail>[0]) {
  const { subject, html } = hotelWelcomeEmail(params);
  return send(to, subject, html);
}

export async function sendDigitalPassOffer(to: string, params: Parameters<typeof digitalPassOfferEmail>[0]) {
  const { subject, html } = digitalPassOfferEmail(params);
  return send(to, subject, html);
}

export async function sendSleepingMoney(to: string, params: Parameters<typeof sleepingMoneyEmail>[0]) {
  const { subject, html } = sleepingMoneyEmail(params);
  return send(to, subject, html);
}

/**
 * Email templates via Resend. In dev (no API key), logs to console.
 */
import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.FROM_EMAIL || "noreply@pixelholiday.com";
const resend = KEY ? new Resend(KEY) : null;

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[Email MOCK → ${to}] ${subject}`);
    return { mocked: true };
  }
  return resend.emails.send({ from: FROM, to, subject, html });
}

export async function emailPaymentReceipt(to: string, amount: number, link: string) {
  return send(to, "Your PixelHoliday receipt", `<p>Thank you! Total: €${amount}</p><p><a href="${link}">View gallery</a></p>`);
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

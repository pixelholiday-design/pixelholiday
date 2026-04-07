/**
 * WhatsApp Cloud API client. In dev, logs to console (mock).
 * Production: uses Meta Graph API.
 */
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendWhatsAppMessage(to: string, body: string) {
  if (!TOKEN || !PHONE_ID) {
    console.log(`[WhatsApp MOCK → ${to}] ${body}`);
    return { mocked: true };
  }
  const res = await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
  });
  return res.json();
}

export async function sendWhatsAppHookLink(to: string, link: string) {
  return sendWhatsAppMessage(
    to,
    `✨ Your PixelHoliday memory is ready! Tap to view your sneak peek and book a viewing: ${link}`
  );
}

export async function notifyPhotographerNewBooking(photographerName: string, time: Date) {
  console.log(`[Push MOCK → ${photographerName}] New appointment at ${time.toISOString()}`);
}

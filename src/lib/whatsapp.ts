/**
 * WhatsApp Cloud API client. In dev, logs to console (mock).
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
  return sendWhatsAppMessage(to, `✨ Your Pixelvo memory is ready! Tap to view: ${link}`);
}
export async function sendWhatsAppGalleryDelivery(to: string, link: string) {
  return sendWhatsAppMessage(to, `📸 Your photos are unlocked! Download: ${link}`);
}
export async function sendWhatsAppBookingConfirmation(to: string, time: Date) {
  return sendWhatsAppMessage(to, `✅ Booking confirmed for ${time.toLocaleString()}`);
}
export async function sendWhatsAppDiscountOffer(to: string, link: string, percent: number, code: string) {
  return sendWhatsAppMessage(to, `🎁 ${percent}% off your photos! Use code ${code}: ${link}`);
}
export async function sendWhatsAppSweepUp(to: string, link: string, percent: number) {
  return sendWhatsAppMessage(to, `⏰ Last chance! ${percent}% off remaining photos: ${link}`);
}
export async function sendWhatsAppAbandonedCart(to: string, link: string, code: string) {
  return sendWhatsAppMessage(to, `Missing the Tunisian sun? Get your memories now at 15% off! Code ${code}: ${link}`);
}

export async function sendWhatsAppReply(to: string, body: string) {
  return sendWhatsAppMessage(to, body);
}

export async function sendWhatsAppHelpMenu(to: string) {
  return sendWhatsAppMessage(
    to,
    `Welcome to Pixelvo! Reply with:\n📸 "photos" - View your gallery\n📅 "book" - Book a photo session\n❓ "help" - See this menu again`
  );
}

export async function notifyPhotographerNewBooking(photographerName: string, time: Date) {
  console.log(`[Push MOCK → ${photographerName}] New appointment at ${time.toISOString()}`);
}

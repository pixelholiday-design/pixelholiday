import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendWhatsAppReply,
  sendWhatsAppHelpMenu,
} from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("[WhatsApp Webhook]", JSON.stringify(body).slice(0, 200));

  try {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from; // sender phone number
      const text = (message.text?.body || "").toLowerCase().trim();

      console.log(`[WhatsApp Inbound] From: ${from}, Text: "${text}"`);

      // Route by keyword
      if (text === "help" || text === "?") {
        await sendWhatsAppHelpMenu(from);
      } else if (
        text.includes("book") ||
        text.includes("photo") ||
        text.includes("gallery")
      ) {
        // Look up customer by phone and send their gallery link
        const customer = await prisma.customer.findFirst({
          where: { whatsapp: { contains: from.slice(-9) } },
          include: {
            galleries: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });

        if (customer?.galleries?.[0]) {
          const gallery = customer.galleries[0];
          const link = `${process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com"}/gallery/${gallery.magicLinkToken}`;
          await sendWhatsAppReply(
            from,
            `📸 Here's your latest gallery: ${link}`
          );
        } else {
          await sendWhatsAppReply(
            from,
            `We couldn't find a gallery linked to this number. Please visit our kiosk or book a session at ${process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com"}/book`
          );
        }
      } else {
        // Default: send help menu
        await sendWhatsAppHelpMenu(from);
      }
    }
  } catch (err) {
    console.error("[WhatsApp Webhook] Error processing inbound:", err);
  }

  return NextResponse.json({ ok: true });
}

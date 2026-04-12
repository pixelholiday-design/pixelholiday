import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Validate webhook secret
    const webhookSecret = req.headers.get("x-email-webhook-secret");
    if (!webhookSecret || webhookSecret !== process.env.EMAIL_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }

    const { to, from, fromName, subject, bodyHtml, bodyText, attachments } = await req.json();

    if (!to || !from) {
      return NextResponse.json({ error: "Missing required fields: to, from" }, { status: 400 });
    }

    // Look up FotiqoEmail by the "to" address
    const fotiqoEmail = await prisma.fotiqoEmail.findUnique({
      where: { emailAddress: to },
    });

    if (!fotiqoEmail) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    if (!fotiqoEmail.isActive) {
      return NextResponse.json({ error: "Recipient email is inactive" }, { status: 410 });
    }

    // Create inbound email message
    await prisma.emailMessage.create({
      data: {
        userId: fotiqoEmail.userId,
        fotiqoEmailId: fotiqoEmail.id,
        direction: "INBOUND",
        fromAddress: from,
        fromName: fromName || null,
        toAddress: to,
        subject: subject || "(no subject)",
        bodyHtml: bodyHtml || null,
        bodyText: bodyText || null,
        attachments: attachments || null,
        isRead: false,
        folder: "INBOX",
        receivedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Email webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}

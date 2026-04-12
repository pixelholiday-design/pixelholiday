import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  try {
    const { to, cc, subject, bodyHtml, bodyText, inReplyTo, threadId } = await req.json();

    if (!to || !subject) {
      return NextResponse.json({ error: "Missing required fields: to, subject" }, { status: 400 });
    }

    // Find user's FotiqoEmail for fromAddress
    const fotiqoEmail = await prisma.fotiqoEmail.findFirst({
      where: { userId: user.id, isActive: true, isPrimary: true },
    });
    if (!fotiqoEmail) {
      return NextResponse.json({ error: "No Fotiqo email found. Set up your email first." }, { status: 404 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    const now = new Date();

    const message = await prisma.emailMessage.create({
      data: {
        userId: user.id,
        fotiqoEmailId: fotiqoEmail.id,
        direction: "OUTBOUND",
        fromAddress: fotiqoEmail.emailAddress,
        fromName: dbUser?.name || null,
        toAddress: to,
        ccAddresses: cc || null,
        subject,
        bodyHtml: bodyHtml || null,
        bodyText: bodyText || null,
        isRead: true,
        folder: "SENT",
        inReplyTo: inReplyTo || null,
        threadId: threadId || null,
        sentAt: now,
        receivedAt: now,
      },
    });

    // Send via Resend
    if (resend) {
      const signature = await prisma.emailSignature.findUnique({ where: { userId: user.id } });
      const fullHtml = signature?.signatureHtml
        ? `${bodyHtml || ""}<br/><br/>${signature.signatureHtml}`
        : bodyHtml || bodyText || "";

      await resend.emails.send({
        from: `${dbUser?.name || "Fotiqo"} <${fotiqoEmail.emailAddress}>`,
        to: [to],
        ...(cc ? { cc: Array.isArray(cc) ? cc : [cc] } : {}),
        subject,
        html: fullHtml,
        ...(bodyText ? { text: bodyText } : {}),
        replyTo: fotiqoEmail.emailAddress,
      });
    } else {
      console.log(`[Email MOCK → ${to}] ${subject}`);
    }

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}

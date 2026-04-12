import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  try {
    const { to, cc, subject, bodyHtml, bodyText, inReplyTo, threadId } = await req.json();

    // Find user's FotiqoEmail
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

    const draft = await prisma.emailMessage.create({
      data: {
        userId: user.id,
        fotiqoEmailId: fotiqoEmail.id,
        direction: "OUTBOUND",
        fromAddress: fotiqoEmail.emailAddress,
        fromName: dbUser?.name || null,
        toAddress: to || "",
        ccAddresses: cc || null,
        subject: subject || "",
        bodyHtml: bodyHtml || null,
        bodyText: bodyText || null,
        isDraft: true,
        isRead: true,
        folder: "DRAFTS",
        inReplyTo: inReplyTo || null,
        threadId: threadId || null,
      },
    });

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error("Draft create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create draft" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  try {
    const { id, to, cc, subject, bodyHtml, bodyText, inReplyTo, threadId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing draft id" }, { status: 400 });
    }

    // Verify ownership and that it's a draft
    const existing = await prisma.emailMessage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!existing.isDraft) {
      return NextResponse.json({ error: "Message is not a draft" }, { status: 400 });
    }

    const updated = await prisma.emailMessage.update({
      where: { id },
      data: {
        toAddress: to !== undefined ? to : undefined,
        ccAddresses: cc !== undefined ? cc : undefined,
        subject: subject !== undefined ? subject : undefined,
        bodyHtml: bodyHtml !== undefined ? bodyHtml : undefined,
        bodyText: bodyText !== undefined ? bodyText : undefined,
        inReplyTo: inReplyTo !== undefined ? inReplyTo : undefined,
        threadId: threadId !== undefined ? threadId : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Draft update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update draft" }, { status: 500 });
  }
}

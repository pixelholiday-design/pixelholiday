import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAiResponse } from "@/lib/support/chatbot";
import { z } from "zod";

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1),
  chatId: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  page: z.string().optional(),
  product: z.string().optional(),
});

/** POST /api/support/chat — Send message (start new chat or continue) */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const data = parsed.data;

  const session = await getServerSession(authOptions).catch(() => null);
  const userId = (session?.user as any)?.id || null;
  const userRole = (session?.user as any)?.role || "VISITOR";

  // Find or create chat
  let chat;
  if (data.chatId) {
    chat = await prisma.supportChat.findUnique({ where: { id: data.chatId } });
  }
  if (!chat) {
    chat = await prisma.supportChat.create({
      data: {
        sessionId: data.sessionId,
        userId,
        visitorName: data.name || session?.user?.name || null,
        visitorEmail: data.email || session?.user?.email || null,
        userRole,
        page: data.page,
        product: data.product,
        status: "ACTIVE",
      },
    });
  }

  // Save user message
  await prisma.supportMessage.create({
    data: { chatId: chat.id, sender: "USER", content: data.message },
  });

  // Get AI response (with error handling)
  let aiResponse;
  try {
    aiResponse = await getAiResponse(data.message, {
      page: data.page,
      userRole,
      userName: data.name || session?.user?.name || undefined,
    });
  } catch (e) {
    console.error("[Support Chat] AI response error:", e);
    aiResponse = {
      content: "Thanks for your message! I'm here to help. Could you tell me more about what you need assistance with?",
      contentType: "TEXT" as const,
      shouldEscalate: false,
    };
  }

  // Save AI response
  await prisma.supportMessage.create({
    data: {
      chatId: chat.id,
      sender: "AI_BOT",
      content: aiResponse.content,
      contentType: aiResponse.contentType,
      metadata: aiResponse.metadata || undefined,
    },
  });

  // Escalate if needed
  if (aiResponse.shouldEscalate) {
    await prisma.supportChat.update({
      where: { id: chat.id },
      data: { status: "WAITING_FOR_ADMIN", escalatedToHuman: true },
    });
  } else {
    await prisma.supportChat.update({
      where: { id: chat.id },
      data: { aiHandled: true },
    });
  }

  return NextResponse.json({
    chatId: chat.id,
    response: {
      content: aiResponse.content,
      contentType: aiResponse.contentType,
      sender: "AI_BOT",
      metadata: aiResponse.metadata,
    },
  });
}

/** GET /api/support/chat — Admin: list chats */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const chats = await prisma.supportChat.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  const stats = {
    active: await prisma.supportChat.count({ where: { status: "ACTIVE" } }),
    waiting: await prisma.supportChat.count({ where: { status: "WAITING_FOR_ADMIN" } }),
    resolved: await prisma.supportChat.count({ where: { status: "RESOLVED" } }),
  };

  return NextResponse.json({ chats, stats });
}

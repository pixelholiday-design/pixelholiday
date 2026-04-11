import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

/** POST /api/support/chat -- Send message (start new chat or continue) */
export async function POST(req: Request) {
  try {
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

    // Get AI response with full error isolation
    let responseContent = "Thanks for your message! How can I help you today?";
    let shouldEscalate = false;
    try {
      const { getAiResponse } = await import("@/lib/support/chatbot");
      const aiResponse = await getAiResponse(data.message, {
        page: data.page,
        userRole,
        userName: data.name || session?.user?.name || undefined,
      });
      responseContent = aiResponse.content;
      shouldEscalate = !!aiResponse.shouldEscalate;

      if (shouldEscalate) {
        await prisma.supportChat.update({
          where: { id: chat.id },
          data: { status: "WAITING_FOR_ADMIN", escalatedToHuman: true },
        });
      }
    } catch (e) {
      console.error("[Support Chat] AI error:", e);
    }

    // Save bot response
    await prisma.supportMessage.create({
      data: { chatId: chat.id, sender: "AI_BOT", content: responseContent, contentType: "TEXT" },
    });

    return NextResponse.json({
      chatId: chat.id,
      response: { content: responseContent, contentType: "TEXT", sender: "AI_BOT", shouldEscalate },
    });
  } catch (e: any) {
    console.error("[Support Chat] Fatal error:", e);
    return NextResponse.json({
      chatId: null,
      response: { content: "Hi! Thanks for reaching out. How can I help you today?", contentType: "TEXT", sender: "AI_BOT", shouldEscalate: false },
    });
  }
}

/** GET /api/support/chat -- Admin: list chats */
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
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { messages: true } } },
  });

  const stats = {
    active: await prisma.supportChat.count({ where: { status: "ACTIVE" } }),
    waiting: await prisma.supportChat.count({ where: { status: "WAITING_FOR_ADMIN" } }),
    resolved: await prisma.supportChat.count({ where: { status: "RESOLVED" } }),
  };

  return NextResponse.json({ chats, stats });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Check for API key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === "placeholder") {
    return NextResponse.json({
      response: "The Fotiqo Agent is not configured yet. Please add your GEMINI_API_KEY to environment variables.",
      agentType: "unconfigured",
    });
  }

  // Determine agent type
  let agentType = "photographer";
  let org: any = null;
  try {
    org = await prisma.organization.findUnique({ where: { id: orgId } });
  } catch {
    // org table may not exist
  }

  if (org) {
    if (role === "CEO" && org.type === "HEADQUARTERS") {
      agentType = "admin";
    } else if ((role === "CEO" || role === "OPERATIONS_MANAGER") && org.type === "VENUE_COMPANY") {
      agentType = "company";
    }
  }

  // Load business context
  let contextStr = "";

  if (agentType === "photographer") {
    let galleries = 0, bookings = 0, profile: any = null, orders = 0;
    try { galleries = await prisma.gallery.count({ where: { location: { orgId } } }); } catch { /* */ }
    try { bookings = await prisma.appointment.count({ where: { gallery: { location: { orgId } }, status: { in: ["PENDING", "CONFIRMED"] } } }); } catch { /* */ }
    try { profile = await prisma.photographerProfile.findFirst({ where: { userId } }); } catch { /* */ }
    try { orders = await prisma.order.count({ where: { gallery: { location: { orgId } }, status: "COMPLETED" } }); } catch { /* */ }
    contextStr = `Business data: ${galleries} galleries, ${bookings} pending bookings, ${orders} completed orders.`;
    if (profile) contextStr += ` Portfolio: ${profile.portfolioSlug || "not set"}.`;
  } else if (agentType === "company") {
    let destinations = 0, staffCount = 0, shifts = 0;
    try { destinations = await prisma.destination.count({ where: { organizationId: orgId } }); } catch { /* */ }
    try { staffCount = await prisma.destinationStaff.count({ where: { destination: { organizationId: orgId } } }); } catch { /* */ }
    try { shifts = await prisma.shift.count({ where: { user: { orgId }, date: { gte: new Date() } } }); } catch { /* */ }
    contextStr = `Business data: ${destinations} destinations, ${staffCount} staff members, ${shifts} upcoming shifts.`;
  } else {
    let totalOrgs = 0, totalUsers = 0, totalGalleries = 0;
    try { totalOrgs = await prisma.organization.count(); } catch { /* */ }
    try { totalUsers = await prisma.user.count(); } catch { /* */ }
    try { totalGalleries = await prisma.gallery.count(); } catch { /* */ }
    contextStr = `Platform data: ${totalOrgs} organizations, ${totalUsers} users, ${totalGalleries} galleries.`;
  }

  // Build system prompt
  const userName = (session.user as any).name || "there";
  const companyName = org?.name || "your company";

  let systemPrompt = "";
  if (agentType === "photographer") {
    systemPrompt = `You are the Fotiqo Agent, a personal AI business assistant for photographer ${userName}. You help with marketing, social media, client management, SEO, email campaigns, and image editing suggestions. Be concise, actionable, and encouraging. Use the photographer's business data to give personalized advice.\n\n${contextStr}`;
  } else if (agentType === "company") {
    systemPrompt = `You are the Fotiqo Agent for ${companyName}, a venue photography company. You help the CEO manage operations: staff scheduling, revenue analysis, destination performance, cash management, equipment monitoring. Be data-driven and concise.\n\n${contextStr}`;
  } else {
    systemPrompt = `You are the Fotiqo Agent for the Fotiqo platform itself. You help the CEO grow the business toward €10M ARR. You provide insights on user growth, revenue, partnerships, product development, marketing, and competitive analysis. Be strategic, data-driven, and actionable.\n\n${contextStr}`;
  }

  // Load/save conversation
  let conversation: any = null;
  try {
    conversation = await prisma.agentConversation.findFirst({
      where: { userId, organizationId: orgId },
      orderBy: { updatedAt: "desc" },
    });
  } catch { /* */ }

  const prevMessages = conversation ? (conversation.messages as any[]).slice(-20) : [];
  const conversationMessages = [
    ...prevMessages.map((m: any) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  // Call Gemini API
  try {
    // Build Gemini-compatible messages: system prompt as first user context + conversation
    const geminiContents = [
      { role: "user", parts: [{ text: `[System instructions]\n${systemPrompt}\n\n[User message]\n${conversationMessages[conversationMessages.length - 1].content}` }] },
    ];
    // Add prior conversation context (skip last message, already included above)
    if (conversationMessages.length > 1) {
      const prior = conversationMessages.slice(0, -1);
      geminiContents.unshift(
        ...prior.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }))
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: { maxOutputTokens: 2048 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[Agent] Gemini API error:", errText);
      return NextResponse.json({ error: "AI service error", details: errText }, { status: 502 });
    }

    const data = await geminiRes.json();
    const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";

    // Save conversation
    const allMessages = [
      ...prevMessages,
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "assistant", content: assistantContent, timestamp: new Date().toISOString() },
    ];

    try {
      if (conversation) {
        await prisma.agentConversation.update({
          where: { id: conversation.id },
          data: { messages: allMessages, updatedAt: new Date() },
        });
      } else {
        await prisma.agentConversation.create({
          data: { userId, organizationId: orgId, messages: allMessages },
        });
      }
    } catch { /* conversation save failed, non-critical */ }

    return NextResponse.json({ response: assistantContent, agentType });
  } catch (err: any) {
    console.error("[Agent] Chat error:", err);
    return NextResponse.json({ error: "Failed to contact AI service" }, { status: 500 });
  }
}

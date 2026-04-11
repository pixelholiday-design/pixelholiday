import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper: call Gemini API (fallback to null if no key)
async function callGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      },
    );
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// ── METRICS ─────────────────────────────────────
async function getMetrics() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenueAgg, orgCount, photographerCount, venueCount, subscribersByTier] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED", createdAt: { gte: monthStart } },
      }),
      prisma.organization.count(),
      prisma.user.count({ where: { role: "PHOTOGRAPHER" } }),
      prisma.organization.count({ where: { type: "FRANCHISE" } }),
      prisma.organization.groupBy({
        by: ["subscriptionTier"],
        _count: true,
      }),
    ]);

  const tierBreakdown: Record<string, number> = {};
  for (const t of subscribersByTier) {
    tierBreakdown[t.subscriptionTier] = t._count;
  }

  return {
    revenueThisMonth: revenueAgg._sum.amount ?? 0,
    activeSubscribers: orgCount,
    tierBreakdown,
    activeVenues: venueCount,
    marketplacePhotographers: photographerCount,
    revenueGoal: 10_000_000,
  };
}

// ── BRIEFING ────────────────────────────────────
async function getBriefing() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const [pendingApps, recentOrders, inactiveUsers, topPhotographers, openChats] =
    await Promise.all([
      prisma.jobApplication.count({ where: { status: "RECEIVED" } }).catch(() => 0),
      prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo }, status: "COMPLETED" } }),
      prisma.user.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
      prisma.user.findMany({
        where: { role: "PHOTOGRAPHER" },
        orderBy: { rating: "desc" },
        take: 3,
        select: { name: true, rating: true },
      }),
      prisma.supportChat.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    ]);

  const context = `Fotiqo resort photography SaaS platform stats:
- ${pendingApps} pending job applications
- ${recentOrders} completed orders in last 7 days
- ${inactiveUsers} users registered 30+ days ago (potential churn)
- Top photographers: ${topPhotographers.map((p) => `${p.name} (${p.rating})`).join(", ") || "none"}
- ${openChats} open support chats
Provide 5-6 actionable business insights as a daily briefing for the CEO.`;

  const aiText = await callGemini(context);

  if (aiText) {
    return { source: "gemini", text: aiText };
  }

  // Rule-based fallback
  const bullets: string[] = [];
  if (pendingApps > 0) bullets.push(`${pendingApps} job applications awaiting review.`);
  if (recentOrders === 0) bullets.push("No completed orders in the last 7 days -- investigate.");
  else bullets.push(`${recentOrders} orders completed this week.`);
  if (openChats > 0) bullets.push(`${openChats} support chats need attention.`);
  if (topPhotographers.length > 0)
    bullets.push(`Top performer: ${topPhotographers[0].name} (rating ${topPhotographers[0].rating}).`);
  bullets.push("Consider running an abandoned-cart campaign for idle galleries.");
  bullets.push("Seasonal opportunity: summer is approaching -- plan waterpark promotions.");

  return { source: "rule-based", text: bullets.join("\n") };
}

// ── GENERATE CONTENT ────────────────────────────
async function generateContent(type: string, audience: string, prompt: string) {
  const systemPrompts: Record<string, string> = {
    email: `Write a professional marketing email for Fotiqo resort photography platform. Target audience: ${audience}. Topic: ${prompt}. Include subject line, body, and CTA.`,
    social: `Write a social media post for Fotiqo resort photography platform. Target audience: ${audience}. Topic: ${prompt}. Keep it engaging and under 280 characters for Twitter, or a short paragraph for Instagram/LinkedIn.`,
    blog: `Write a blog post outline (title + 5 sections with brief descriptions) for Fotiqo resort photography platform. Target audience: ${audience}. Topic: ${prompt}.`,
    partnership: `Write a partnership outreach email from Fotiqo (resort photography SaaS) to a potential partner. Target: ${audience}. Context: ${prompt}. Be professional and highlight mutual benefits.`,
  };

  const geminiPrompt = systemPrompts[type] || systemPrompts.email;
  const aiText = await callGemini(geminiPrompt);

  if (aiText) return { source: "gemini", content: aiText };

  return {
    source: "placeholder",
    content: `[AI content generation requires a Gemini API key]\n\nType: ${type}\nAudience: ${audience}\nTopic: ${prompt}\n\nConnect your GEMINI_API_KEY environment variable to generate real content.`,
  };
}

// ── COMPETITOR ───────────────────────────────────
async function getCompetitorInsights(competitor: string) {
  const prompt = `You are a competitive intelligence analyst for Fotiqo, a resort photography SaaS platform.
Analyze ${competitor} (a photo delivery/gallery platform). Provide:
1. Their latest known features and pricing
2. Their strengths and weaknesses vs Fotiqo
3. Three features Fotiqo should build to compete
Be concise and actionable.`;

  const aiText = await callGemini(prompt);
  if (aiText) return { source: "gemini", competitor, text: aiText };

  return {
    source: "unavailable",
    competitor,
    text: "Connect Gemini API to enable AI competitor insights.",
  };
}

// ── CUSTOMER INSIGHTS ───────────────────────────
async function getCustomerInsights() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [suggestions, supportChats, inactiveOrgs] = await Promise.all([
    prisma.suggestion
      .findMany({
        orderBy: { upvotes: "desc" },
        take: 10,
        select: { content: true, category: true, upvotes: true, status: true },
      })
      .catch(() => []),
    prisma.supportChat
      .findMany({
        where: { status: { in: ["ACTIVE", "WAITING_FOR_ADMIN"] } },
        take: 10,
        include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
      })
      .catch(() => []),
    prisma.organization
      .findMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
        select: { id: true, name: true, subscriptionTier: true, createdAt: true },
        take: 10,
        orderBy: { createdAt: "asc" },
      })
      .catch(() => []),
  ]);

  return {
    topRequests: suggestions.map((s) => ({
      content: s.content,
      category: s.category,
      upvotes: s.upvotes,
      status: s.status,
    })),
    openSupport: supportChats.map((c) => ({
      id: c.id,
      status: c.status,
      lastMessage: c.messages[0]?.content?.slice(0, 100) || "No messages",
      channel: c.channel,
    })),
    churnRisk: inactiveOrgs.map((o) => ({
      id: o.id,
      name: o.name,
      tier: o.subscriptionTier,
      signupDate: o.createdAt,
    })),
  };
}

// ── ROUTE HANDLER ────────────────────────────────
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "metrics";

  try {
    switch (action) {
      case "metrics":
        return NextResponse.json(await getMetrics());
      case "briefing":
        return NextResponse.json(await getBriefing());
      case "insights":
        return NextResponse.json(await getCustomerInsights());
      case "competitor": {
        const competitor = req.nextUrl.searchParams.get("competitor") || "Pixieset";
        return NextResponse.json(await getCompetitorInsights(competitor));
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    console.error("[ai-command]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  if (action === "generate") {
    try {
      const { type, audience, prompt } = await req.json();
      const result = await generateContent(type || "email", audience || "general", prompt || "");
      return NextResponse.json(result);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

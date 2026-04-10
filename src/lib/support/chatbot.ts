/**
 * AI chatbot for Fotiqo support. Uses Gemini when available,
 * falls back to keyword matching against help articles.
 */
import { prisma } from "@/lib/db";

type ChatbotResponse = {
  content: string;
  contentType: "TEXT" | "ARTICLE" | "ACTION_BUTTONS";
  metadata?: any;
  shouldEscalate?: boolean;
};

const QUICK_PATTERNS: [RegExp, string][] = [
  [/upload|how.*(add|put).*(photo|image)/i, "uploading-photos"],
  [/pric(e|ing)|cost|how much|commission/i, "pricing-explained"],
  [/cancel|delete.*(account|profile)/i, "cancellation-policy"],
  [/custom domain|own domain|connect domain/i, "connect-custom-domain"],
  [/password|can.t (log|sign).?in|reset/i, "reset-password"],
  [/watermark|remove watermark|logo on photo/i, "watermark-settings"],
  [/download|can.t download|save photo/i, "download-photos"],
  [/print|order print|wall art|canvas/i, "ordering-prints"],
  [/refund|money back/i, "refund-policy"],
  [/gallery.*create|first gallery|new gallery/i, "creating-first-gallery"],
  [/website.*set|portfolio|theme/i, "setting-up-website"],
  [/book(ing)?.*package|session.*type/i, "creating-booking-packages"],
  [/stripe|payment.*setup|accept.*payment/i, "connecting-stripe"],
  [/seo|google|search engine/i, "seo-settings"],
];

export async function getAiResponse(
  message: string,
  context: { page?: string; userRole?: string; userName?: string },
): Promise<ChatbotResponse> {
  // 1. Check quick patterns for article match
  for (const [pattern, slug] of QUICK_PATTERNS) {
    if (pattern.test(message)) {
      const article = await prisma.helpArticle.findUnique({ where: { slug } });
      if (article) {
        return {
          content: `Here's what I found: **${article.title}**\n\n${article.summary}\n\n[Read full article](/help/${article.category.toLowerCase()}/${article.slug})`,
          contentType: "ARTICLE",
          metadata: { articleSlug: slug, articleTitle: article.title },
        };
      }
    }
  }

  // 2. Search articles by keywords
  const words = message.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (words.length > 0) {
    const articles = await prisma.helpArticle.findMany({
      where: {
        isPublished: true,
        OR: words.map((w) => ({
          OR: [
            { title: { contains: w, mode: "insensitive" as any } },
            { summary: { contains: w, mode: "insensitive" as any } },
            { tags: { has: w } },
          ],
        })),
      },
      take: 3,
    });
    if (articles.length > 0) {
      const links = articles.map((a) => `- [${a.title}](/help/${a.category.toLowerCase()}/${a.slug})`).join("\n");
      return {
        content: `I found some articles that might help:\n\n${links}\n\nDoes this answer your question?`,
        contentType: "TEXT",
      };
    }
  }

  // 3. Try Gemini AI
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const systemPrompt = `You are Fotiqo's support assistant. Fotiqo is an all-in-one photography platform (galleries, website builder, store with 187 products, booking, marketplace, 10 languages). The user is on page "${context.page || "unknown"}" and their role is "${context.userRole || "visitor"}". Answer concisely in 2-3 sentences. Be warm and helpful. If unsure, say "Let me connect you with our team for more help."`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser: " + message }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 300 },
          }),
        },
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const shouldEscalate = text.toLowerCase().includes("connect you with our team");
        return { content: text, contentType: "TEXT", shouldEscalate };
      }
    } catch (e) {
      console.warn("[Chatbot] Gemini failed:", e);
    }
  }

  // 4. Fallback
  return {
    content: "I'm not sure about that, but I'd love to help! Let me connect you with our support team who can assist you directly.",
    contentType: "TEXT",
    shouldEscalate: true,
  };
}

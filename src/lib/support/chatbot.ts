/**
 * AI chatbot for Fotiqo support. Uses Gemini when available,
 * falls back to keyword matching against help articles,
 * then to hardcoded rule-based responses.
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
  [/gallery.*create|first gallery|new gallery|create.*gallery|share.*gallery/i, "creating-first-gallery"],
  [/website.*set|portfolio|theme/i, "setting-up-website"],
  [/book(ing)?.*package|session.*type/i, "creating-booking-packages"],
  [/stripe|payment.*setup|accept.*payment/i, "connecting-stripe"],
  [/seo|google|search engine/i, "seo-settings"],
  [/store|shop|product|sell.*online|online.*store/i, "setting-up-store"],
  [/technical|bug|error|broken|not working|issue/i, "troubleshooting"],
  [/billing|invoice|charge|subscription|plan/i, "billing-overview"],
];

/**
 * Hardcoded fallback responses when DB articles are unavailable.
 * Keyed by topic slug to match QUICK_PATTERNS.
 */
const FALLBACK_RESPONSES: Record<string, string> = {
  "uploading-photos":
    "To upload photos, go to your dashboard and click 'Upload'. You can drag and drop up to 100+ photos at once. We support JPG, RAW, and video files. Need more help? Visit /help for detailed guides.",
  "pricing-explained":
    "Fotiqo offers flexible pricing tiers: Starter (solo photographer), Professional (small team), Business (multi-location), and Enterprise (franchise). A 2% commission applies to sales. Visit our pricing page for full details.",
  "cancellation-policy":
    "You can cancel your account anytime from Settings > Account. Your data will be retained for 30 days after cancellation. Contact support if you need help with this process.",
  "connect-custom-domain":
    "To connect a custom domain, go to Settings > Domain, enter your domain name, and update your DNS records as shown. Changes typically take 24-48 hours to propagate.",
  "reset-password":
    "To reset your password, click 'Forgot Password' on the login page. You'll receive an email with a reset link. If you're not receiving the email, check your spam folder or contact support.",
  "watermark-settings":
    "Watermark settings are in your dashboard under Settings > Branding. You can upload a custom logo, adjust opacity, size, and position. Watermarks are applied server-side for security.",
  "download-photos":
    "Once photos are purchased, download buttons appear on each photo and a 'Download All (ZIP)' button is available. If downloads aren't working, try clearing your browser cache.",
  "ordering-prints":
    "We offer printed albums, canvas prints, and wall art. Browse available products in the Store section. Prints are produced by professional labs and shipped directly to customers.",
  "refund-policy":
    "Refunds can be processed within 14 days of purchase for digital products. Contact our support team with your order details and we'll assist you promptly.",
  "creating-first-gallery":
    "To create a gallery: 1) Go to your dashboard, 2) Click 'New Gallery', 3) Upload your photos, 4) Set a hook image, 5) Share the magic link with your client. Galleries can be set to preview, paid, or digital pass modes.",
  "setting-up-website":
    "Set up your portfolio website from Dashboard > Website. Choose a theme, add your best work, customize colors and fonts, and optionally connect a custom domain. SEO settings are built in.",
  "creating-booking-packages":
    "Create booking packages from Dashboard > Bookings > Packages. Set your session types, duration, pricing, and availability. Clients can book directly from your portfolio site.",
  "connecting-stripe":
    "Connect Stripe from Settings > Payments. Click 'Connect Stripe Account' and follow the setup flow. Once connected, payments from gallery sales and bookings are processed automatically.",
  "seo-settings":
    "SEO settings are in Dashboard > Website > SEO. Set your page titles, meta descriptions, and keywords. Our AI can also help optimize your content for search engines.",
  "setting-up-store":
    "Set up your online store from Dashboard > Store. Add products (prints, albums, digital packages), set pricing, and enable it on your client galleries. Stripe must be connected first.",
  "troubleshooting":
    "For technical issues, try these steps: 1) Clear your browser cache, 2) Try a different browser, 3) Check your internet connection. If the issue persists, describe the problem and I can help further.",
  "billing-overview":
    "View your billing details in Settings > Billing. You can see your current plan, invoices, and payment history. To change plans, click 'Upgrade' or 'Change Plan'.",
};

/** Hardcoded rule-based fallback patterns for common intents (no DB needed) */
const RULE_PATTERNS: [RegExp, string][] = [
  [/\b(hi|hello|hey|good\s*(morning|afternoon|evening))\b/i,
    "Hi there! I'm Fotiqo's assistant. I can help with galleries, your store, billing, or technical issues. What do you need help with?"],
  [/\b(thanks?|thank you|thx)\b/i,
    "You're welcome! Is there anything else I can help you with?"],
  [/\b(bye|goodbye|see you)\b/i,
    "Goodbye! Feel free to come back anytime you need help."],
  [/speak.*(agent|person|human|support)|talk.*(agent|person|human|support)|agent|human|person|support\s*team/i,
    "I'll connect you with our support team right away. A team member will be with you shortly."],
  [/get(ting)?\s*started|how.*start|begin|new\s*here/i,
    "Welcome to Fotiqo! To get started: 1) Complete your profile in Settings, 2) Create your first gallery, 3) Set up payments via Stripe, 4) Share your gallery links with clients. Check out /help for detailed guides on each step."],
];

export async function getAiResponse(
  message: string,
  context: { page?: string; userRole?: string; userName?: string },
): Promise<ChatbotResponse> {
  // 1. Check quick patterns for article match
  for (const [pattern, slug] of QUICK_PATTERNS) {
    if (pattern.test(message)) {
      // Try DB article first
      try {
        const article = await prisma.helpArticle.findUnique({ where: { slug } });
        if (article) {
          return {
            content: `Here's what I found: **${article.title}**\n\n${article.summary}\n\n[Read full article](/help/${article.category.toLowerCase()}/${article.slug})`,
            contentType: "ARTICLE",
            metadata: { articleSlug: slug, articleTitle: article.title },
          };
        }
      } catch {
        // DB query failed, fall through to hardcoded
      }

      // Use hardcoded fallback for this topic
      const fallback = FALLBACK_RESPONSES[slug];
      if (fallback) {
        return {
          content: fallback,
          contentType: "TEXT",
        };
      }
    }
  }

  // 2. Search articles by keywords (with DB error handling)
  const words = message.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (words.length > 0) {
    try {
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
    } catch {
      // DB unavailable, continue to rule-based
    }
  }

  // 3. Rule-based pattern matching (no DB needed)
  for (const [pattern, response] of RULE_PATTERNS) {
    if (pattern.test(message)) {
      const shouldEscalate = response.includes("connect you with our support team");
      return { content: response, contentType: "TEXT", shouldEscalate };
    }
  }

  // 4. Try Gemini AI
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

  // 5. Final fallback
  return {
    content: "I'm not sure about that, but I'd love to help! Let me connect you with our support team who can assist you directly.",
    contentType: "TEXT",
    shouldEscalate: true,
  };
}

/**
 * AI-powered suggestion evaluator.
 * Uses Gemini API when available, falls back to rule-based scoring.
 */

export type SuggestionEvaluation = {
  category: string;
  impactScore: number;
  feasibilityScore: number;
  priorityScore: number;
  isDuplicate: boolean;
  canAutoImplement: boolean;
  autoImplementType: string;
  responseToUser: string;
  summary: string;
};

const GEMINI_KEY = process.env.GEMINI_API_KEY;

export async function evaluateSuggestion(input: {
  content: string;
  page?: string;
  product?: string;
  userRole?: string;
}): Promise<SuggestionEvaluation> {
  if (GEMINI_KEY) {
    try {
      return await evaluateWithGemini(input);
    } catch (e) {
      console.warn("[Suggestion AI] Gemini failed, using fallback:", e);
    }
  }
  return evaluateWithRules(input);
}

async function evaluateWithGemini(input: {
  content: string;
  page?: string;
  product?: string;
  userRole?: string;
}): Promise<SuggestionEvaluation> {
  const systemPrompt = `You evaluate user suggestions for Fotiqo, an all-in-one photography platform (galleries, website builder, store with 187 products, booking, kiosk POS, marketplace, 10 languages, video reels, face recognition).

The user is on page "${input.page || "unknown"}" in the "${input.product || "general"}" area. Their role: ${input.userRole || "visitor"}.

Evaluate their suggestion and respond with ONLY valid JSON (no markdown):
{
  "category": "FEATURE|UI_UX|PRICING|BUG|CONTENT|PERFORMANCE|SECURITY|INTEGRATION|OTHER",
  "impactScore": <1-10>,
  "feasibilityScore": <1-10>,
  "isDuplicate": false,
  "canAutoImplement": <true if it's a simple config/setting change>,
  "autoImplementType": "CONFIG_CHANGE|TEXT_CHANGE|PRICING_CHANGE|SETTING_TOGGLE|NONE",
  "responseToUser": "<friendly 1-2 sentence response>",
  "summary": "<one-line summary>"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\nSuggestion: " + input.content }] },
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
      }),
    },
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Gemini response");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    category: parsed.category || "FEATURE",
    impactScore: Math.min(10, Math.max(1, parsed.impactScore || 5)),
    feasibilityScore: Math.min(10, Math.max(1, parsed.feasibilityScore || 5)),
    priorityScore: (parsed.impactScore || 5) * (parsed.feasibilityScore || 5),
    isDuplicate: parsed.isDuplicate || false,
    canAutoImplement: parsed.canAutoImplement || false,
    autoImplementType: parsed.autoImplementType || "NONE",
    responseToUser: parsed.responseToUser || "Thanks for your suggestion!",
    summary: parsed.summary || input.content.slice(0, 100),
  };
}

function evaluateWithRules(input: {
  content: string;
  page?: string;
  product?: string;
  userRole?: string;
}): SuggestionEvaluation {
  const text = input.content.toLowerCase();
  let category = "FEATURE";
  let impact = 5;
  let feasibility = 5;
  let response = "Thanks for your suggestion! We've added it to our review queue.";

  if (text.match(/bug|broken|doesn.t work|error|crash/)) {
    category = "BUG"; impact = 9; feasibility = 7;
    response = "Thanks for reporting this! Our team will investigate right away.";
  } else if (text.match(/slow|loading|speed|performance|lag/)) {
    category = "PERFORMANCE"; impact = 8; feasibility = 5;
    response = "We take performance seriously. We'll look into this!";
  } else if (text.match(/price|cheaper|expensive|discount|cost|free/)) {
    category = "PRICING"; impact = 7; feasibility = 4;
    response = "Great pricing feedback! We'll review this with our team.";
  } else if (text.match(/dark mode|color|font|design|layout|theme/)) {
    category = "UI_UX"; impact = 6; feasibility = 5;
    response = "Love the design suggestion! We'll consider this for our next update.";
  } else if (text.match(/translate|language|rtl|arabic|french/)) {
    category = "CONTENT"; impact = 5; feasibility = 7;
    response = "Thanks! We support 10 languages and are always looking to improve translations.";
  } else if (text.match(/security|password|hack|vulnerable|ssl/)) {
    category = "SECURITY"; impact = 9; feasibility = 6;
    response = "Security is our top priority. We'll review this immediately.";
  } else if (text.match(/integrat|connect|api|plugin|zapier|lightroom/)) {
    category = "INTEGRATION"; impact = 6; feasibility = 4;
    response = "Integration ideas are valuable! We'll evaluate this for our roadmap.";
  } else {
    response = "Great idea! We've logged it for our product team to review.";
  }

  return {
    category,
    impactScore: impact,
    feasibilityScore: feasibility,
    priorityScore: impact * feasibility,
    isDuplicate: false,
    canAutoImplement: false,
    autoImplementType: "NONE",
    responseToUser: response,
    summary: input.content.slice(0, 120),
  };
}

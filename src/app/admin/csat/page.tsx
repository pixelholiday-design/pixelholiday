import { prisma } from "@/lib/db";
import { Star, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CSATPage() {
  const surveys = await prisma.cSATSurvey.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const chatRatings = await prisma.supportChat.findMany({ where: { csatScore: { not: null } }, select: { csatScore: true, csatFeedback: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 50 });

  const allScores = [...surveys.map((s) => s.score), ...chatRatings.map((c) => c.csatScore!).filter(Boolean)];
  const avgScore = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : "N/A";
  const npsScores = surveys.filter((s) => s.npsScore !== null).map((s) => s.npsScore!);
  const promoters = npsScores.filter((s) => s >= 9).length;
  const detractors = npsScores.filter((s) => s <= 6).length;
  const nps = npsScores.length > 0 ? Math.round(((promoters - detractors) / npsScores.length) * 100) : null;

  const byTrigger = surveys.reduce((acc, s) => { acc[s.trigger] = (acc[s.trigger] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-3xl text-navy-900 mb-2">Customer Satisfaction</h1>
      <p className="text-navy-500 text-sm mb-8">CSAT scores, NPS, and feedback from customers and staff</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-5 text-center">
          <Star className="h-6 w-6 text-gold-400 mx-auto mb-2" />
          <div className="font-display text-3xl text-navy-900">{avgScore}</div>
          <div className="text-xs text-navy-400">Avg CSAT (1-5)</div>
        </div>
        <div className="card p-5 text-center">
          <TrendingUp className="h-6 w-6 text-brand-500 mx-auto mb-2" />
          <div className="font-display text-3xl text-navy-900">{nps !== null ? (nps > 0 ? "+" : "") + nps : "N/A"}</div>
          <div className="text-xs text-navy-400">NPS Score</div>
        </div>
        <div className="card p-5 text-center">
          <ThumbsUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="font-display text-3xl text-navy-900">{allScores.filter((s) => s >= 4).length}</div>
          <div className="text-xs text-navy-400">Happy (4-5)</div>
        </div>
        <div className="card p-5 text-center">
          <ThumbsDown className="h-6 w-6 text-coral-500 mx-auto mb-2" />
          <div className="font-display text-3xl text-navy-900">{allScores.filter((s) => s <= 2).length}</div>
          <div className="text-xs text-navy-400">Unhappy (1-2)</div>
        </div>
      </div>

      {/* By trigger */}
      {Object.keys(byTrigger).length > 0 && (
        <div className="card p-5 mb-8">
          <h2 className="font-display text-lg text-navy-900 mb-3">By Trigger</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(byTrigger).map(([trigger, count]) => (
              <div key={trigger} className="bg-cream-50 rounded-xl p-3 text-center">
                <div className="font-display text-xl text-navy-900">{count}</div>
                <div className="text-xs text-navy-400">{trigger.replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent feedback */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 bg-cream-50 border-b border-cream-200">
          <h2 className="font-semibold text-navy-900 text-sm">Recent Feedback</h2>
        </div>
        {allScores.length === 0 ? (
          <div className="p-8 text-center text-navy-400">No feedback collected yet.</div>
        ) : (
          <div className="divide-y divide-cream-100">
            {surveys.slice(0, 20).map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < s.score ? "fill-gold-400 text-gold-400" : "text-cream-300"}`} />
                    ))}
                  </div>
                  {s.feedback && <p className="text-sm text-navy-600 mt-1">{s.feedback}</p>}
                </div>
                <div className="text-xs text-navy-400">{s.trigger} &middot; {new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

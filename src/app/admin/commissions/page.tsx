import { prisma } from "@/lib/db";
import { Trophy, TrendingDown, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const commissions = await prisma.commission.findMany({
    include: { user: true, order: true },
    orderBy: { id: "desc" },
    take: 200,
  });

  type Row = { userId: string; name: string; email: string; total: number; rows: number };
  const map = new Map<string, Row>();
  const byType: Record<string, number> = {};

  for (const c of commissions) {
    const r = map.get(c.userId) || { userId: c.userId, name: c.user.name, email: c.user.email, total: 0, rows: 0 };
    r.total += c.amount;
    r.rows += 1;
    map.set(c.userId, r);
    byType[c.type] = (byType[c.type] || 0) + c.amount;
  }
  const ranked = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const totalAll = ranked.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Business</div>
        <h1 className="heading text-4xl mt-1">Commissions</h1>
        <p className="text-navy-400 mt-1">All-time leaderboard and breakdown by source.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
            <Trophy className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Highest earner</div>
          <div className="font-display text-2xl text-navy-900 truncate">{top?.name || "—"}</div>
          <div className="text-xs text-navy-400">€{(top?.total || 0).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Lowest earner</div>
          <div className="font-display text-2xl text-navy-900 truncate">{bottom?.name || "—"}</div>
          <div className="text-xs text-navy-400">€{(bottom?.total || 0).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-navy-800/10 text-navy-700 flex items-center justify-center">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Total paid out</div>
          <div className="font-display text-3xl text-navy-900">€{totalAll.toFixed(0)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Leaderboard</h2>
        </div>
        {ranked.length === 0 ? (
          <div className="p-12 text-center text-navy-400 text-sm">No commissions yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Photographer</th>
                <th className="px-6 py-3">Records</th>
                <th className="px-6 py-3 text-right">Total earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {ranked.map((r, i) => {
                const tone =
                  r.userId === top?.userId
                    ? "bg-green-50/50"
                    : r.userId === bottom?.userId && ranked.length > 1
                    ? "bg-coral-50/40"
                    : "";
                return (
                  <tr key={r.userId} className={`hover:bg-cream-100/60 ${tone}`}>
                    <td className="px-6 py-3 text-navy-400 font-semibold">#{i + 1}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-navy-900">{r.name}</div>
                      <div className="text-xs text-navy-400">{r.email}</div>
                    </td>
                    <td className="px-6 py-3 text-navy-600">{r.rows}</td>
                    <td className="px-6 py-3 text-right font-display text-xl text-navy-900">€{r.total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-6">
        <h2 className="heading text-lg mb-4">By commission type</h2>
        <div className="space-y-3">
          {Object.entries(byType).map(([k, v]) => {
            const pct = totalAll > 0 ? (v / totalAll) * 100 : 0;
            return (
              <div key={k}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-navy-600">{k.replace(/_/g, " ")}</span>
                  <span className="font-semibold text-navy-900">€{v.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div className="h-full bg-coral-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {Object.keys(byType).length === 0 && (
            <div className="text-sm text-navy-400">No data.</div>
          )}
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [pettyCash, commissions, rentSum, staffSum] = await Promise.all([
    prisma.cashExpense.findMany({
      where: { createdAt: { gte: monthStart } },
      include: { cashRegister: { include: { location: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.commission.aggregate({
      _sum: { amount: true },
      where: { month: monthStart.toISOString().slice(0, 7) },
    }),
    prisma.location.aggregate({ _sum: { rentCost: true } }),
    prisma.user.aggregate({ _sum: { salary: true } }),
  ]);

  const pettyTotal = pettyCash.reduce((s, e) => s + e.amount, 0);
  const commissionsTotal = commissions._sum.amount || 0;
  const rent = rentSum._sum.rentCost || 0;
  const salaries = staffSum._sum.salary || 0;
  const total = pettyTotal + commissionsTotal + rent + salaries;

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Finance · Expenses</div>
        <h1 className="heading text-4xl mt-1">Expenses</h1>
        <p className="text-navy-400 mt-1">Operating costs: commissions, salaries, rent, petty cash.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat label="Commissions" value={`€${commissionsTotal.toFixed(0)}`} />
        <Stat label="Salaries (monthly)" value={`€${salaries.toFixed(0)}`} />
        <Stat label="Rent (monthly)" value={`€${rent.toFixed(0)}`} />
        <Stat label="Petty cash MTD" value={`€${pettyTotal.toFixed(0)}`} accent="coral" />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="heading text-lg">Total monthly burn</h2>
          <div className="font-display text-3xl text-coral-600">€{total.toFixed(0)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Petty cash ledger ({pettyCash.length})</h2>
        </div>
        {pettyCash.length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-sm">No petty-cash expenses this month.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {pettyCash.map((e) => (
                <tr key={e.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 text-xs text-navy-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-navy-700">{e.cashRegister.location.name}</td>
                  <td className="px-6 py-3 text-navy-700">{e.reason}</td>
                  <td className="px-6 py-3 text-right font-semibold text-coral-600">-€{e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: any) {
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className={`font-display text-3xl ${accent === "coral" ? "text-coral-600" : "text-navy-900"}`}>{value}</div>
    </div>
  );
}

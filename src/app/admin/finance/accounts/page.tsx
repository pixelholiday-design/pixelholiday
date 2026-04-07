import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const registers = await prisma.cashRegister.findMany({
    where: { date: today },
    include: { location: true },
  });
  const openRegisters = await prisma.cashRegister.findMany({
    where: { status: "OPEN" },
    include: { location: true },
  });

  const cashOnHand = openRegisters.reduce((s, r) => s + r.expectedBalance, 0);
  // Placeholder bank balance — real integration would plug into an accounting
  // ledger or a bank API (Plaid, GoCardless) here.
  const bankBalance = 12500;

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Finance · Accounts</div>
        <h1 className="heading text-4xl mt-1">Accounts</h1>
        <p className="text-navy-400 mt-1">Cash floats across every active register plus the operating bank account.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card">
          <div className="label-xs">Cash on hand</div>
          <div className="font-display text-3xl text-navy-900">€{cashOnHand.toFixed(0)}</div>
          <div className="text-xs text-navy-400 mt-1">{openRegisters.length} open register(s)</div>
        </div>
        <div className="stat-card">
          <div className="label-xs">Operating bank</div>
          <div className="font-display text-3xl text-navy-900">€{bankBalance.toFixed(0)}</div>
          <div className="text-xs text-navy-400 mt-1">Placeholder — connect bank API</div>
        </div>
        <div className="stat-card">
          <div className="label-xs">Total liquid</div>
          <div className="font-display text-3xl text-green-600">€{(cashOnHand + bankBalance).toFixed(0)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Today's registers</h2>
        </div>
        {registers.length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-sm">No registers opened today.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Opening</th>
                <th className="px-6 py-3">Expected</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {registers.map((r) => (
                <tr key={r.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 font-medium text-navy-900">{r.location.name}</td>
                  <td className="px-6 py-3 text-navy-600">€{r.openingBalance.toFixed(2)}</td>
                  <td className="px-6 py-3 text-navy-900 font-semibold">€{r.expectedBalance.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

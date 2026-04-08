import Link from "next/link";
import { prisma } from "@/lib/db";
import { Wallet, TrendingUp, TrendingDown, Receipt, Building2, FileText, Percent } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [revenueAgg, expenseAgg, commissionAgg, rentSum] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: monthStart }, status: "COMPLETED" },
    }),
    prisma.cashExpense.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.commission.aggregate({
      _sum: { amount: true },
      where: { month: monthStart.toISOString().slice(0, 7) },
    }),
    prisma.location.aggregate({ _sum: { rentCost: true } }),
  ]);

  const revenue = revenueAgg._sum.amount || 0;
  const pettyCash = expenseAgg._sum.amount || 0;
  const commissions = commissionAgg._sum.amount || 0;
  const rent = rentSum._sum.rentCost || 0;
  const expenses = pettyCash + commissions + rent;
  const profit = revenue - expenses;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const sections = [
    { href: "/admin/finance/revenue",  label: "Revenue",   icon: TrendingUp, sub: `€${revenue.toFixed(0)} MTD` },
    { href: "/admin/finance/expenses", label: "Expenses",  icon: TrendingDown, sub: `€${expenses.toFixed(0)} MTD` },
    { href: "/admin/finance/budget",   label: "Budget",    icon: Wallet, sub: "vs plan" },
    { href: "/admin/finance/invoices", label: "Invoices",  icon: FileText, sub: "B2B + vendors" },
    { href: "/admin/finance/accounts", label: "Accounts",  icon: Building2, sub: "Bank + cash" },
    { href: "/admin/finance/tax",      label: "Tax report",icon: Percent, sub: "VAT + corporate" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Business</div>
        <h1 className="heading text-4xl mt-1">Finance</h1>
        <p className="text-navy-400 mt-1">Month-to-date revenue, expenses, profit, and downstream reports.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat label="Revenue MTD" value={`€${revenue.toFixed(0)}`} icon={<TrendingUp className="h-4 w-4" />} accent="green" />
        <Stat label="Expenses MTD" value={`€${expenses.toFixed(0)}`} icon={<TrendingDown className="h-4 w-4" />} accent="coral" />
        <Stat label="Profit" value={`€${profit.toFixed(0)}`} icon={<Wallet className="h-4 w-4" />} accent={profit >= 0 ? "green" : "coral"} />
        <Stat label="Margin" value={`${margin.toFixed(0)}%`} icon={<Percent className="h-4 w-4" />} accent="gold" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="card p-6 hover:shadow-lift transition">
              <div className="h-10 w-10 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <div className="heading text-xl">{s.label}</div>
              <div className="text-sm text-navy-400 mt-1">{s.sub}</div>
            </Link>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="heading text-lg mb-3 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-coral-500" /> Expense breakdown (MTD)
        </h2>
        <Row label="Commissions paid out" value={commissions} total={expenses || 1} color="bg-coral-500" />
        <Row label="Petty cash" value={pettyCash} total={expenses || 1} color="bg-gold-500" />
        <Row label="Rent (all locations)" value={rent} total={expenses || 1} color="bg-navy-700" />
      </div>
    </div>
  );
}

function Stat({ label, value, icon, accent }: any) {
  const tint =
    accent === "coral" ? "bg-coral-500/10 text-coral-600" :
    accent === "gold" ? "bg-gold-500/10 text-gold-600" :
    accent === "green" ? "bg-green-500/10 text-green-600" :
    "bg-navy-800/10 text-navy-700";
  return (
    <div className="stat-card">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
    </div>
  );
}

function Row({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-navy-600">{label}</span>
        <span className="font-semibold text-navy-900">€{value.toFixed(0)}</span>
      </div>
      <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

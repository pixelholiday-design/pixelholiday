import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VAT_RATE = 0.19; // Tunisia standard rate
const CORPORATE_RATE = 0.25;

export default async function TaxPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const quarterStart = new Date(monthStart);
  quarterStart.setMonth(Math.floor(monthStart.getMonth() / 3) * 3);

  const [orders, expenses, salaries] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: quarterStart }, status: "COMPLETED" },
    }),
    prisma.cashExpense.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: quarterStart } },
    }),
    prisma.user.aggregate({ _sum: { salary: true } }),
  ]);

  const grossRevenue = orders._sum.amount || 0;
  // VAT we collected is baked into each order price. Back-calculate:
  const vatCollected = (grossRevenue * VAT_RATE) / (1 + VAT_RATE);
  const netRevenue = grossRevenue - vatCollected;

  const totalExpenses = (expenses._sum.amount || 0) + (salaries._sum.salary || 0) * 3; // quarterly
  const taxableProfit = Math.max(0, netRevenue - totalExpenses);
  const corporateTax = taxableProfit * CORPORATE_RATE;

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Finance · Tax</div>
        <h1 className="heading text-4xl mt-1">Tax report</h1>
        <p className="text-navy-400 mt-1">
          Quarter-to-date — VAT (19%) + corporate tax (25%). Export for your accountant below.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat label="Gross revenue QTD" value={`€${grossRevenue.toFixed(0)}`} />
        <Stat label="VAT collected" value={`€${vatCollected.toFixed(0)}`} accent="coral" sub="payable" />
        <Stat label="Net revenue" value={`€${netRevenue.toFixed(0)}`} accent="green" />
        <Stat label="Corporate tax (est.)" value={`€${corporateTax.toFixed(0)}`} accent="coral" sub="on profit" />
      </div>

      <div className="card p-6">
        <h2 className="heading text-lg mb-3">Calculation breakdown</h2>
        <Row label="Gross revenue (VAT-inclusive)" value={grossRevenue} />
        <Row label="VAT collected (19% extracted)" value={-vatCollected} />
        <Row label="Net revenue" value={netRevenue} bold />
        <Row label="Total expenses (QTD)" value={-totalExpenses} />
        <Row label="Taxable profit" value={taxableProfit} bold />
        <Row label="Corporate tax (25%)" value={-corporateTax} />
        <Row label="Net profit after tax" value={taxableProfit - corporateTax} bold positive />
      </div>

      <div className="card p-6 text-sm text-navy-500">
        <p>
          <strong>Disclaimer:</strong> this is an automated estimate using Tunisian standard rates.
          Speak to a qualified accountant before filing.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, sub }: any) {
  const c =
    accent === "coral" ? "text-coral-600" :
    accent === "green" ? "text-green-600" :
    "text-navy-900";
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className={`font-display text-3xl ${c}`}>{value}</div>
      {sub && <div className="text-xs text-navy-400 mt-1">{sub}</div>}
    </div>
  );
}

function Row({ label, value, bold, positive }: { label: string; value: number; bold?: boolean; positive?: boolean }) {
  const color = positive ? "text-green-600" : value < 0 ? "text-coral-600" : "text-navy-900";
  return (
    <div className={`flex items-center justify-between py-2 ${bold ? "border-t border-cream-300 mt-2 pt-3" : ""}`}>
      <span className={bold ? "font-semibold text-navy-900" : "text-navy-600"}>{label}</span>
      <span className={`font-display ${bold ? "text-xl" : "text-sm"} ${color}`}>
        {value < 0 ? "-" : ""}€{Math.abs(value).toFixed(0)}
      </span>
    </div>
  );
}

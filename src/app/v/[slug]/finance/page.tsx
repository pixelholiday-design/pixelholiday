"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, DollarSign, TrendingUp, TrendingDown,
  BarChart3, ShoppingBag, CreditCard, Banknote,
} from "lucide-react";

type FinanceData = {
  pnl: {
    grossRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: string;
  };
  revenue: {
    resortSales: { total: number; count: number };
    sleepingMoney: { total: number; count: number };
  };
  costs: {
    stripeFees: number;
    photographerCommissions: number;
    cashExpenses: number;
  };
  byPaymentMethod: {
    method: string;
    revenue: number;
    count: number;
  }[];
};

type RecentOrder = {
  method: string;
  revenue: number;
  count: number;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function FinancePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#0EA5A5");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [dashRes, finRes] = await Promise.all([
        fetch(`/api/v/${slug}/dashboard`),
        fetch("/api/admin/finance?period=month"),
      ]);
      if (!dashRes.ok) { router.push(`/v/${slug}`); return; }
      const dashData = await dashRes.json();

      setPrimaryColor(dashData.org?.brandPrimaryColor || "#0EA5A5");
      setCompanyName(dashData.org?.brandName || dashData.org?.name || "Company");

      if (finRes.ok) {
        const finData = await finRes.json();
        setFinance(finData);
      }
    } catch {
      router.push(`/v/${slug}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  const revenue = finance?.pnl?.grossRevenue ?? 0;
  const costs = finance?.pnl?.totalCosts ?? 0;
  const profit = finance?.pnl?.netProfit ?? 0;
  const marginStr = finance?.pnl?.profitMargin ?? "0%";
  const marginNum = parseFloat(marginStr);

  const paymentMethods = finance?.byPaymentMethod || [];

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link href={`/v/${slug}/dashboard`} className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3 w-3" /> Back to {companyName}
          </Link>
          <div>
            <h1 className="font-display text-2xl text-navy-900">Finance</h1>
            <p className="text-sm text-navy-400">Month-to-date financial overview</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: "Revenue MTD", value: formatCurrency(revenue), color: "text-emerald-600" },
            { icon: TrendingDown, label: "Expenses MTD", value: formatCurrency(costs), color: "text-red-500" },
            { icon: TrendingUp, label: "Profit", value: formatCurrency(profit), color: profit >= 0 ? "text-emerald-600" : "text-red-500" },
            { icon: BarChart3, label: "Margin", value: marginStr, color: marginNum >= 0 ? "text-emerald-600" : "text-red-500" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-5">
                <Icon className="h-5 w-5 mb-2" style={{ color: primaryColor }} />
                <div className={`font-display text-xl ${s.color}`}>{s.value}</div>
                <div className="text-xs text-navy-400">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Revenue Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Streams */}
          <div className="card p-5">
            <h2 className="font-display text-lg text-navy-900 mb-4">Revenue Streams</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" style={{ color: primaryColor }} />
                  <span className="text-sm text-navy-700">Resort Sales</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-navy-900">
                    {formatCurrency(finance?.revenue?.resortSales?.total ?? 0)}
                  </span>
                  <span className="text-xs text-navy-400 ml-2">
                    ({finance?.revenue?.resortSales?.count ?? 0} orders)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" style={{ color: primaryColor }} />
                  <span className="text-sm text-navy-700">Sleeping Money</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-navy-900">
                    {formatCurrency(finance?.revenue?.sleepingMoney?.total ?? 0)}
                  </span>
                  <span className="text-xs text-navy-400 ml-2">
                    ({finance?.revenue?.sleepingMoney?.count ?? 0} orders)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className="card p-5">
            <h2 className="font-display text-lg text-navy-900 mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-navy-400" />
                  <span className="text-sm text-navy-700">Stripe Fees</span>
                </div>
                <span className="text-sm font-medium text-navy-900">
                  {formatCurrency(finance?.costs?.stripeFees ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-navy-400" />
                  <span className="text-sm text-navy-700">Photographer Commissions</span>
                </div>
                <span className="text-sm font-medium text-navy-900">
                  {formatCurrency(finance?.costs?.photographerCommissions ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-navy-400" />
                  <span className="text-sm text-navy-700">Cash Expenses</span>
                </div>
                <span className="text-sm font-medium text-navy-900">
                  {formatCurrency(finance?.costs?.cashExpenses ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity by Payment Method */}
        <div className="card p-5">
          <h2 className="font-display text-lg text-navy-900 mb-4">Sales by Payment Method</h2>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-10 w-10 text-navy-300 mx-auto mb-3" />
              <p className="text-sm text-navy-400">No sales recorded this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.method} className="flex items-center justify-between py-2 border-b border-cream-200 last:border-0">
                  <div className="flex items-center gap-2">
                    {pm.method === "CASH" ? (
                      <Banknote className="h-4 w-4" style={{ color: primaryColor }} />
                    ) : (
                      <CreditCard className="h-4 w-4" style={{ color: primaryColor }} />
                    )}
                    <span className="text-sm text-navy-700">{pm.method.replace(/_/g, " ")}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-navy-900">{formatCurrency(pm.revenue)}</span>
                    <span className="text-xs text-navy-400 ml-2">({pm.count} transactions)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

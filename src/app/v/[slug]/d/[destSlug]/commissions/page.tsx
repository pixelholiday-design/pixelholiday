"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, DollarSign, Loader2, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight,
} from "lucide-react";

type OrgInfo = {
  id: string;
  name: string;
  brandName: string | null;
  brandPrimaryColor: string | null;
};

type Destination = {
  id: string;
  name: string;
  slug: string;
  venueType: string;
};

type CommissionSummary = {
  user: { id: string; name: string; email: string };
  total: number;
  paid: number;
  unpaid: number;
  types: Record<string, number>;
};

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function navigateMonth(month: string, direction: number): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1 + direction);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function DestinationCommissionsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const destSlug = params.destSlug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [summary, setSummary] = useState<CommissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth);

  const primaryColor = org?.brandPrimaryColor || "#0EA5A5";

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, commRes] = await Promise.all([
          fetch(`/api/v/${slug}/dashboard`),
          fetch(`/api/admin/commissions?month=${month}`),
        ]);
        if (!dashRes.ok) { router.push(`/v/${slug}`); return; }
        const dashData = await dashRes.json();
        const commData = commRes.ok ? await commRes.json() : { summary: [] };

        setOrg(dashData.org);
        const dest = (dashData.destinations || []).find(
          (d: Destination) => d.slug === destSlug
        );
        setDestination(dest || null);
        setSummary(commData.summary || []);
      } catch {
        router.push(`/v/${slug}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, destSlug, month, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  const totalOwed = summary.reduce((sum, s) => sum + s.total, 0);
  const totalPaid = summary.reduce((sum, s) => sum + s.paid, 0);
  const totalUnpaid = summary.reduce((sum, s) => sum + s.unpaid, 0);

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/v/${slug}/d/${destSlug}`}
            className="text-xs text-navy-400 hover:text-brand-500 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to {destination?.name || "Destination"}
          </Link>
          <h1 className="font-display text-2xl text-navy-900">Commissions</h1>
          {destination && (
            <p className="text-sm text-navy-400">{destination.name}</p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setMonth((m) => navigateMonth(m, -1))}
            className="p-2 rounded-xl hover:bg-cream-200 text-navy-600 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-display text-lg text-navy-900">
            {formatMonth(month)}
          </span>
          <button
            onClick={() => setMonth((m) => navigateMonth(m, 1))}
            className="p-2 rounded-xl hover:bg-cream-200 text-navy-600 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <DollarSign className="h-4 w-4 mb-1" style={{ color: primaryColor }} />
            <div className="font-display text-2xl text-navy-900">
              EUR {totalOwed.toFixed(2)}
            </div>
            <div className="text-xs text-navy-400">Total owed</div>
          </div>
          <div className="card p-5">
            <CheckCircle2 className="h-4 w-4 mb-1 text-green-500" />
            <div className="font-display text-2xl text-navy-900">
              EUR {totalPaid.toFixed(2)}
            </div>
            <div className="text-xs text-navy-400">Total paid</div>
          </div>
          <div className="card p-5">
            <AlertCircle className="h-4 w-4 mb-1 text-amber-500" />
            <div className="font-display text-2xl text-navy-900">
              EUR {totalUnpaid.toFixed(2)}
            </div>
            <div className="text-xs text-navy-400">This month unpaid</div>
          </div>
        </div>

        {/* Commission table */}
        {summary.length === 0 ? (
          <div className="card p-10 text-center">
            <DollarSign className="h-12 w-12 text-navy-300 mx-auto mb-4" />
            <h3 className="font-display text-lg text-navy-900 mb-2">
              No commissions yet
            </h3>
            <p className="text-sm text-navy-400 max-w-md mx-auto">
              Commissions will appear here when staff make sales at this destination.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="text-left text-xs font-medium text-navy-500 px-5 py-3">
                    Staff
                  </th>
                  <th className="text-right text-xs font-medium text-navy-500 px-5 py-3">
                    Amount
                  </th>
                  <th className="text-right text-xs font-medium text-navy-500 px-5 py-3">
                    Paid
                  </th>
                  <th className="text-right text-xs font-medium text-navy-500 px-5 py-3">
                    Unpaid
                  </th>
                  <th className="text-center text-xs font-medium text-navy-500 px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.map((item) => (
                  <tr
                    key={item.user.id}
                    className="border-b border-cream-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: primaryColor }}
                        >
                          {item.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-navy-900">
                            {item.user.name}
                          </div>
                          <div className="text-xs text-navy-400">
                            {item.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-navy-900 font-medium">
                      EUR {item.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-green-600">
                      EUR {item.paid.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-amber-600">
                      EUR {item.unpaid.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {item.unpaid === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          <AlertCircle className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

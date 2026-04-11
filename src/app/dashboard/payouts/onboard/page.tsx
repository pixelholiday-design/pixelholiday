"use client";

import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, Clock, ExternalLink, AlertCircle } from "lucide-react";

type PayoutStatus = {
  connected: boolean;
  status?: {
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    dbStatus: string;
    currentlyDue: string[];
  };
};

export default function PayoutsOnboardPage() {
  const [data, setData] = useState<PayoutStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/payouts/status")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function startOnboarding() {
    setOnboarding(true);
    try {
      const res = await fetch("/api/dashboard/payouts/onboard", { method: "POST" });
      const d = await res.json();
      if (d.url) window.location.href = d.url;
    } catch {
      setOnboarding(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-200 rounded w-1/3" />
          <div className="h-40 bg-cream-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const isActive = data?.status?.payoutsEnabled;
  const isPending = data?.connected && !isActive;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Banknote className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Payouts</h1>
          <p className="text-navy-500 text-sm">Receive payments directly to your bank account</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-cream-200 p-8">
        {isActive ? (
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-900 mb-2">Payouts Active</h2>
            <p className="text-navy-500 mb-6">
              Your payout account is connected and active. Earnings will be transferred automatically.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Charges enabled
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Payouts enabled
              </span>
            </div>
          </div>
        ) : isPending ? (
          <div className="text-center">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-900 mb-2">Verification Pending</h2>
            <p className="text-navy-500 mb-6">
              Your account is being verified. This usually takes 1-2 business days.
            </p>
            {data?.status?.currentlyDue && data.status.currentlyDue.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center gap-2 text-yellow-700 font-medium text-sm mb-2">
                  <AlertCircle className="h-4 w-4" /> Action Required
                </div>
                <p className="text-sm text-yellow-600 mb-3">Additional information is needed:</p>
                <button
                  onClick={startOnboarding}
                  disabled={onboarding}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  {onboarding ? "Redirecting..." : "Complete Verification"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Banknote className="h-16 w-16 text-navy-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-900 mb-2">Set Up Payouts</h2>
            <p className="text-navy-500 mb-6">
              Connect your bank account to receive earnings from photo sales, gallery purchases, and mini sessions.
            </p>
            <button
              onClick={startOnboarding}
              disabled={onboarding}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              {onboarding ? "Redirecting to Stripe..." : "Connect Bank Account"}
            </button>
            <p className="text-xs text-navy-400 mt-4">Powered by Stripe. Your financial data is secure.</p>
          </div>
        )}
      </div>
    </div>
  );
}

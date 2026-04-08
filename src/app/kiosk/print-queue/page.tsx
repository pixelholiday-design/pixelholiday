"use client";
import { useEffect, useState } from "react";
import { Printer, Loader2, Check, RefreshCw } from "lucide-react";

export default function PrintQueuePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/print-jobs").then((r) => r.json());
    setJobs(r.jobs || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  async function mark(id: string) {
    setBusy(id);
    await fetch("/api/admin/print-jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(null);
    load();
  }

  return (
    <div className="min-h-screen bg-cream-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <div className="label-xs">Print queue</div>
            <h1 className="heading text-4xl mt-1">Pending prints</h1>
            <p className="text-navy-400 mt-1">Mark each job as printed once delivered to the customer.</p>
          </div>
          <button onClick={load} className="btn-secondary">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </header>

        {loading ? (
          <div className="card p-12 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-navy-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-16 text-center">
            <Printer className="h-8 w-8 text-coral-500 mx-auto mb-3" />
            <div className="font-display text-xl text-navy-900">No pending prints</div>
            <div className="text-sm text-navy-400 mt-1">All caught up.</div>
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((j) => (
              <li key={j.id} className="card p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center">
                  <Printer className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-navy-900">
                    {j.order?.customer?.name || "Customer"} · {j.printSize} × {j.copies}
                  </div>
                  <div className="text-xs text-navy-400">
                    {j.photoIds.length} photos · {new Date(j.createdAt).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => mark(j.id)} disabled={busy === j.id} className="btn-primary">
                  {busy === j.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Mark printed
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Plus, Receipt, Loader2 } from "lucide-react";
import Modal, { Field, inputCls } from "@/components/admin/Modal";

const CATEGORIES = [
  "RENT",
  "SALARY",
  "EQUIPMENT",
  "TRAVEL",
  "ACCOMMODATION",
  "SUPPLIES",
  "MARKETING",
  "INSURANCE",
  "LICENSE",
  "UTILITIES",
  "OTHER",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[] | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (filterCat) params.set("category", filterCat);
    const [e, l] = await Promise.all([
      fetch(`/api/admin/expenses?${params}`).then((r) => r.json()).catch(() => ({ expenses: [] })),
      fetch("/api/admin/locations").then((r) => r.json()).catch(() => ({ locations: [] })),
    ]);
    setExpenses(e.expenses || []);
    setLocations(l.locations || []);
  }
  useEffect(() => {
    load();
  }, [filterCat]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    (body as any).recurring = fd.get("recurring") === "on";
    const res = await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (res.ok) {
      setAddOpen(false);
      load();
    } else alert("Failed to save expense");
  }

  const total = (expenses || []).reduce((s, e) => s + e.amount, 0);
  const byCat = (expenses || []).reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Finance · Expenses</div>
          <h1 className="heading text-4xl mt-1">Expenses</h1>
          <p className="text-navy-400 mt-1">Log operating costs, filter by category, export to finance.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white font-medium text-sm hover:bg-brand-800 min-h-[44px]"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat label="Total logged" value={`€${total.toFixed(0)}`} accent="coral" />
        <Stat label="Rent" value={`€${(byCat.RENT || 0).toFixed(0)}`} />
        <Stat label="Salaries" value={`€${(byCat.SALARY || 0).toFixed(0)}`} />
        <Stat label="Supplies" value={`€${(byCat.SUPPLIES || 0).toFixed(0)}`} />
      </div>

      <div className="flex gap-2">
        <select className={`${inputCls} max-w-xs`} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg flex items-center gap-2">
            <Receipt className="h-4 w-4 text-navy-500" /> Ledger ({expenses?.length ?? 0})
          </h2>
        </div>
        {expenses === null ? (
          <div className="p-12 text-center text-navy-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-sm">No expenses logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Paid by</th>
                  <th className="px-6 py-3">Recurring</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/70">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-cream-100/60">
                    <td className="px-6 py-3 text-xs text-navy-500">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex rounded-full bg-cream-200 text-navy-700 text-xs font-medium px-2.5 py-1">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-navy-700">{e.description || "—"}</td>
                    <td className="px-6 py-3 text-navy-500 text-xs">{e.paidBy || "—"}</td>
                    <td className="px-6 py-3 text-xs text-navy-500">{e.recurring ? "Monthly" : "—"}</td>
                    <td className="px-6 py-3 text-right font-semibold text-coral-600">-€{e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Expense">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category" required>
              <select name="category" required className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Amount (€)" required>
              <input name="amount" type="number" step="0.01" required className={inputCls} />
            </Field>
            <Field label="Date" required>
              <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} />
            </Field>
            <Field label="Location">
              <select name="locationId" className={inputCls}>
                <option value="">All / HQ</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Paid by">
              <input name="paidBy" placeholder="Company account / Petty cash / Manager card" className={inputCls} />
            </Field>
            <Field label="Receipt URL">
              <input name="receiptUrl" className={inputCls} />
            </Field>
          </div>
          <Field label="Description">
            <textarea name="description" rows={2} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input type="checkbox" name="recurring" /> Recurring (monthly)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg text-sm text-navy-600 hover:bg-cream-100 min-h-[44px]">
              Cancel
            </button>
            <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 disabled:opacity-50 min-h-[44px]">
              {submitting ? "Saving…" : "Save Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "coral" }) {
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className={`font-display text-3xl ${accent === "coral" ? "text-coral-600" : "text-navy-900"}`}>{value}</div>
    </div>
  );
}

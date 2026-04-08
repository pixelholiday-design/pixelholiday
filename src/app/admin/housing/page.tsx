"use client";
import { useEffect, useState } from "react";
import { Home, Loader2, Plus, Receipt } from "lucide-react";
import Modal, { Field, inputCls } from "@/components/admin/Modal";

const HOUSING_TYPES = ["APARTMENT", "SHARED_ROOM", "HOTEL_ROOM", "STUDIO"];
const EXPENSE_TYPES = ["RENT", "UTILITIES", "REPAIR", "DEPOSIT", "FURNITURE", "CLEANING"];
const PAID_BY = ["COMPANY", "STAFF", "SHARED"];

export default function HousingPage() {
  const [housing, setHousing] = useState<any[] | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [expenseFor, setExpenseFor] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [h, s] = await Promise.all([
      fetch("/api/admin/housing").then((r) => r.json()).catch(() => ({ housing: [] })),
      fetch("/api/admin/staff").then((r) => r.json()).catch(() => ({ staff: [] })),
    ]);
    setHousing(h.housing || []);
    setStaff(s.staff || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    (body as any).utilitiesIncluded = fd.get("utilitiesIncluded") === "on";
    (body as any).wifiIncluded = fd.get("wifiIncluded") === "on";
    const res = await fetch("/api/admin/housing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (res.ok) {
      setAddOpen(false);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save");
    }
  }

  async function handleExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!expenseFor) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = { action: "expense", housingId: expenseFor.id, ...Object.fromEntries(fd.entries()) };
    const res = await fetch("/api/admin/housing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (res.ok) {
      setExpenseFor(null);
      load();
    } else alert("Failed to add expense");
  }

  const total = (housing || []).reduce((s, h) => s + (h.monthlyCost || 0), 0);
  const expiringSoon = (housing || []).filter(
    (h) => h.contractEnd && new Date(h.contractEnd).getTime() - Date.now() < 60 * 24 * 3600 * 1000
  ).length;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Team</div>
          <h1 className="heading text-4xl mt-1">Staff Housing</h1>
          <p className="text-navy-400 mt-1">Apartments, monthly cost, and documentation per staff member.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white font-medium text-sm hover:bg-brand-800 min-h-[44px]"
        >
          <Plus className="h-4 w-4" /> Add Housing
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Stat label="Total monthly cost" value={`€${total.toLocaleString()}`} />
        <Stat label="Active housings" value={`${housing?.length ?? 0}`} />
        <Stat label="Contracts ending <60d" value={`${expiringSoon}`} accent={expiringSoon ? "coral" : "navy"} />
      </div>

      <div className="card overflow-hidden">
        {housing === null ? (
          <div className="p-12 text-center text-navy-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : housing.length === 0 ? (
          <div className="p-16 text-center">
            <Home className="h-8 w-8 text-coral-500 mx-auto mb-2" />
            <div className="font-display text-xl text-navy-900">No housing records</div>
            <div className="text-sm text-navy-400 mt-1">Add housing to assign it to seasonal staff.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                  <th className="px-6 py-3">Staff</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Monthly</th>
                  <th className="px-6 py-3">Contract</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/70">
                {housing.map((h) => (
                  <tr key={h.id} className="hover:bg-cream-100/60">
                    <td className="px-6 py-3 font-medium text-navy-900">
                      {h.user?.name}
                      <div className="text-xs text-navy-400">{h.user?.role}</div>
                    </td>
                    <td className="px-6 py-3 text-navy-600">
                      {h.propertyName || "—"}
                      <div className="text-xs text-navy-400">{h.address}</div>
                    </td>
                    <td className="px-6 py-3 text-navy-600">{h.type || "—"}</td>
                    <td className="px-6 py-3 text-navy-600">€{h.monthlyCost?.toFixed(0)}</td>
                    <td className="px-6 py-3 text-xs text-navy-500">
                      {h.contractStart ? new Date(h.contractStart).toLocaleDateString() : "—"}
                      {" → "}
                      {h.contractEnd ? new Date(h.contractEnd).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setExpenseFor(h)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                      >
                        <Receipt className="h-3 w-3" /> Log expense
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Housing Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Housing" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Assigned staff" required>
              <select name="userId" required className={inputCls}>
                <option value="">Select staff…</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                ))}
              </select>
            </Field>
            <Field label="Property name">
              <input name="propertyName" placeholder="Staff Apartment Block A" className={inputCls} />
            </Field>
            <Field label="Address" required>
              <input name="address" required className={inputCls} />
            </Field>
            <Field label="Type">
              <select name="type" className={inputCls}>
                {HOUSING_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </Field>
            <Field label="Capacity">
              <input name="capacity" type="number" defaultValue={1} className={inputCls} />
            </Field>
            <Field label="Monthly rent (€)" required>
              <input name="monthlyCost" type="number" step="0.01" required className={inputCls} />
            </Field>
            <Field label="Deposit (€)">
              <input name="deposit" type="number" step="0.01" className={inputCls} />
            </Field>
            <Field label="Distance to resort">
              <input name="distanceToResort" placeholder="5 min walk" className={inputCls} />
            </Field>
            <Field label="Contract start">
              <input name="contractStart" type="date" className={inputCls} />
            </Field>
            <Field label="Contract end">
              <input name="contractEnd" type="date" className={inputCls} />
            </Field>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" name="utilitiesIncluded" /> Utilities included
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" name="wifiIncluded" /> WiFi included
            </label>
          </div>
          <Field label="Notes">
            <textarea name="notes" rows={2} className={inputCls} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg text-sm text-navy-600 hover:bg-cream-100 min-h-[44px]">
              Cancel
            </button>
            <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 disabled:opacity-50 min-h-[44px]">
              {submitting ? "Saving…" : "Save Housing"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal open={!!expenseFor} onClose={() => setExpenseFor(null)} title={`Housing Expense — ${expenseFor?.user?.name}`}>
        <form onSubmit={handleExpense} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type" required>
              <select name="type" required className={inputCls}>
                {EXPENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Amount (€)" required>
              <input name="amount" type="number" step="0.01" required className={inputCls} />
            </Field>
            <Field label="Date" required>
              <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} />
            </Field>
            <Field label="Paid by">
              <select name="paidBy" className={inputCls}>
                {PAID_BY.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Receipt URL">
            <input name="receipt" className={inputCls} />
          </Field>
          <Field label="Notes">
            <textarea name="notes" rows={2} className={inputCls} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setExpenseFor(null)} className="px-4 py-2 rounded-lg text-sm text-navy-600 hover:bg-cream-100 min-h-[44px]">
              Cancel
            </button>
            <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 disabled:opacity-50 min-h-[44px]">
              {submitting ? "Saving…" : "Log Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "coral" | "navy" }) {
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className={`font-display text-3xl ${accent === "coral" ? "text-coral-600" : "text-navy-900"}`}>{value}</div>
    </div>
  );
}

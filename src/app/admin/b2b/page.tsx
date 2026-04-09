"use client";
import { useEffect, useState } from "react";
import { Handshake, Plus, TrendingUp, Check, ImageIcon } from "lucide-react";

function ROICalculator({ photos, monthlyRent, discountPercent }: { photos: number; monthlyRent: number; discountPercent: number }) {
  const photoValue = photos * 50;
  const discountValue = monthlyRent * (discountPercent / 100);
  const net = discountValue - photoValue;
  return (
    <div className="bg-cream-100 rounded-xl p-4 text-sm space-y-1">
      <div className="text-navy-500">Est. photo value (€50/photo): <span className="font-semibold text-navy-900">€{photoValue.toFixed(2)}</span></div>
      <div className="text-navy-500">Rent discount value: <span className="font-semibold text-navy-900">€{discountValue.toFixed(2)}</span></div>
      <div className="text-navy-500">Net benefit: <span className={`font-bold ${net >= 0 ? "text-green-600" : "text-coral-600"}`}>€{net.toFixed(2)}</span></div>
    </div>
  );
}

export default function B2BPortal() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [form, setForm] = useState({ locationId: "", locationName: "", month: "2026-04", photoCount: 10, photoIds: "", rentDiscountPercent: 12, monthlyRent: 5000, notes: "", delivered: false });
  const [reportMonth, setReportMonth] = useState("2026-04");

  async function load() {
    const r = await fetch("/api/b2b/delivery").then((x) => x.json());
    setDeliveries(r.deliveries || []);
  }
  async function loadReport() {
    const r = await fetch(`/api/b2b/report?month=${reportMonth}`).then((x) => x.json());
    setReport(r);
  }
  useEffect(() => { load(); loadReport(); /* eslint-disable-next-line */ }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/b2b/delivery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, photoIds: form.photoIds.split(",").map((s) => s.trim()).filter(Boolean) }) });
    load(); loadReport();
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="label-xs">Module 22</div>
        <h1 className="heading text-4xl mt-1">B2B Media Barter</h1>
        <p className="text-navy-400 mt-1">Track free promotional photos delivered to partner hotels for rent discounts.</p>
      </header>

      <form onSubmit={create} className="card p-6 space-y-4">
        <h2 className="heading text-xl flex items-center gap-2"><Plus className="h-4 w-4" /> Record Delivery</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="Location ID" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} required />
          <input className="input" placeholder="Location name" value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })} />
          <input className="input" placeholder="Month YYYY-MM" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
          <input type="number" className="input" placeholder="Photo count" value={form.photoCount} onChange={(e) => setForm({ ...form, photoCount: Number(e.target.value) })} />
          <input className="input" placeholder="Photo IDs (comma-separated)" value={form.photoIds} onChange={(e) => setForm({ ...form, photoIds: e.target.value })} />
          <input type="number" className="input" placeholder="Rent discount %" value={form.rentDiscountPercent} onChange={(e) => setForm({ ...form, rentDiscountPercent: Number(e.target.value) })} />
          <input type="number" className="input" placeholder="Monthly rent €" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })} />
          <input className="input" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input type="checkbox" checked={form.delivered} onChange={(e) => setForm({ ...form, delivered: e.target.checked })} className="accent-coral-500" />
          Mark as delivered
        </label>
        <ROICalculator photos={form.photoCount} monthlyRent={form.monthlyRent} discountPercent={form.rentDiscountPercent} />
        <button className="btn-primary">Record Delivery</button>
      </form>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading text-xl flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Monthly Report</h2>
          <input className="input w-40" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} onBlur={loadReport} />
        </div>
        {report && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card"><div className="label-xs">Photos Delivered</div><div className="font-display text-2xl text-navy-900">{report.summary.totalPhotos}</div></div>
            <div className="stat-card"><div className="label-xs">Photo Value</div><div className="font-display text-2xl text-navy-900">€{report.summary.totalEstPhotoValue}</div></div>
            <div className="stat-card"><div className="label-xs">Discount Value</div><div className="font-display text-2xl text-navy-900">€{report.summary.totalDiscountValue}</div></div>
            <div className="stat-card"><div className="label-xs">ROI</div><div className="font-display text-2xl text-navy-900">{report.summary.roi}</div></div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="heading text-xl mb-4">All Deliveries</h2>
        {deliveries.length === 0 ? (
          <div className="text-center py-10 text-navy-400">
            <Handshake className="h-8 w-8 mx-auto text-navy-300 mb-3" />
            <div>No deliveries recorded yet.</div>
          </div>
        ) : (
          <div className="divide-y divide-cream-300/60">
            {deliveries.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-navy-900">{d.locationName || d.locationId}</div>
                  <div className="text-sm text-navy-400">{d.month} · {d.photoCount} photos · {d.rentDiscountPercent}% off rent</div>
                </div>
                {d.deliveredAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                    <Check className="h-3 w-3" /> Delivered
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

function ROICalculator({ photos, monthlyRent, discountPercent }: { photos: number; monthlyRent: number; discountPercent: number }) {
  const photoValue = photos * 50;
  const discountValue = monthlyRent * (discountPercent / 100);
  const net = discountValue - photoValue;
  return (
    <div className="bg-gray-50 p-3 rounded text-xs">
      <div>Est. photo value (€50/photo): <b>€{photoValue.toFixed(2)}</b></div>
      <div>Rent discount value: <b>€{discountValue.toFixed(2)}</b></div>
      <div>Net benefit: <b className={net >= 0 ? "text-green-600" : "text-red-600"}>€{net.toFixed(2)}</b></div>
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">B2B Media Barter Portal</h1>

      <form onSubmit={create} className="bg-white p-6 rounded-xl shadow mb-6 grid md:grid-cols-2 gap-3">
        <input className="border p-2 rounded" placeholder="Location ID" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Location name" value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Month YYYY-MM" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
        <input type="number" className="border p-2 rounded" placeholder="Photo count" value={form.photoCount} onChange={(e) => setForm({ ...form, photoCount: Number(e.target.value) })} />
        <input className="border p-2 rounded" placeholder="Photo IDs (comma-separated, selection workflow)" value={form.photoIds} onChange={(e) => setForm({ ...form, photoIds: e.target.value })} />
        <input type="number" className="border p-2 rounded" placeholder="Rent discount %" value={form.rentDiscountPercent} onChange={(e) => setForm({ ...form, rentDiscountPercent: Number(e.target.value) })} />
        <input type="number" className="border p-2 rounded" placeholder="Monthly rent €" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })} />
        <input className="border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.delivered} onChange={(e) => setForm({ ...form, delivered: e.target.checked })} /> Mark as delivered</label>
        <button className="bg-orange-600 text-white px-4 py-2 rounded col-span-2">Record Delivery</button>
        <div className="col-span-2"><ROICalculator photos={form.photoCount} monthlyRent={form.monthlyRent} discountPercent={form.rentDiscountPercent} /></div>
      </form>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Monthly Report</h2>
        <input className="border p-2 rounded mb-3" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} onBlur={loadReport} />
        {report && (
          <div className="text-sm">
            <div>Photos delivered: <b>{report.summary.totalPhotos}</b></div>
            <div>Total est. photo value: <b>€{report.summary.totalEstPhotoValue}</b></div>
            <div>Total discount value: <b>€{report.summary.totalDiscountValue}</b></div>
            <div>ROI ratio: <b>{report.summary.roi}</b></div>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-2">All Deliveries</h2>
      <div className="space-y-2">
        {deliveries.map((d) => (
          <div key={d.id} className="bg-white p-3 rounded shadow text-sm">
            <b>{d.locationName || d.locationId}</b> — {d.month} — {d.photoCount} photos — {d.rentDiscountPercent}% off rent
            {d.deliveredAt && <span className="ml-2 text-green-600">✓ Delivered</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

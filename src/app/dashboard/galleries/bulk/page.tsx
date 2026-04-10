"use client";
import { useState } from "react";
import { Upload, Download, Check, Loader2, AlertTriangle, FileSpreadsheet, ArrowRight } from "lucide-react";

type GalleryRow = { name: string; clientName: string; clientEmail: string; eventDate: string; expiryDays: number };
type Result = { name: string; magicLinkToken: string; galleryId: string; clientName: string };

export default function BulkGalleriesPage() {
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);

  function downloadTemplate() {
    const csv = "gallery_name,client_name,client_email,event_date,expiry_days\nSmith Family,John Smith,john@example.com,2026-05-15,30\nJohnson Wedding,Sarah Johnson,sarah@example.com,2026-05-20,60";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "fotiqo-bulk-galleries-template.csv"; a.click();
  }

  function parseCSV(text: string) {
    const lines = text.trim().split("\n");
    if (lines.length < 2) { setErrors(["CSV must have a header row and at least one data row."]); return; }
    const header = lines[0].toLowerCase().replace(/\s+/g, "_");
    if (!header.includes("gallery_name") || !header.includes("client_name")) {
      setErrors(["CSV must include gallery_name and client_name columns."]); return;
    }
    const parsed: GalleryRow[] = [];
    const errs: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 2) { errs.push(`Row ${i + 1}: not enough columns`); continue; }
      parsed.push({
        name: cols[0] || `Gallery ${i}`,
        clientName: cols[1] || "Guest",
        clientEmail: cols[2] || "",
        eventDate: cols[3] || "",
        expiryDays: parseInt(cols[4]) || 30,
      });
    }
    setRows(parsed);
    setErrors(errs);
  }

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  }

  async function createAll() {
    setCreating(true);
    try {
      const res = await fetch("/api/galleries/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleries: rows }),
      }).then((r) => r.json());
      setResults(res.galleries || []);
    } catch { setErrors(["Network error. Please try again."]); }
    setCreating(false);
  }

  if (results) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3"><Check className="h-7 w-7 text-green-600" /></div>
          <h1 className="font-display text-3xl text-navy-900">{results.length} galleries created!</h1>
        </div>
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto] gap-4 px-5 py-3 bg-cream-50 border-b border-cream-200 text-xs font-semibold text-navy-500 uppercase tracking-wide">
            <div>Gallery</div><div>Client</div><div>Link</div>
          </div>
          {results.map((r) => (
            <div key={r.galleryId} className="grid grid-cols-[1fr,auto,auto] gap-4 px-5 py-3 border-b border-cream-100 text-sm">
              <div className="font-semibold text-navy-900">{r.name}</div>
              <div className="text-navy-500">{r.clientName}</div>
              <a href={`/gallery/${r.magicLinkToken}`} target="_blank" rel="noreferrer" className="text-brand-500 hover:text-brand-700 text-xs">View gallery</a>
            </div>
          ))}
        </div>
        <button onClick={() => { setResults(null); setRows([]); }} className="btn-secondary mt-4">Create more</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="font-display text-3xl text-navy-900 mb-2">Bulk Gallery Creation</h1>
      <p className="text-navy-500 text-sm mb-8">Create multiple galleries at once from a CSV file. Perfect for school portraits, sports events, or mini sessions.</p>

      {/* Step 1: Download template */}
      <div className="card p-6 mb-6">
        <h2 className="font-display text-lg text-navy-900 mb-2">1. Download CSV template</h2>
        <p className="text-sm text-navy-500 mb-4">Columns: gallery_name, client_name, client_email, event_date, expiry_days</p>
        <button onClick={downloadTemplate} className="btn-secondary"><Download className="h-4 w-4" /> Download template</button>
      </div>

      {/* Step 2: Upload CSV */}
      <div className="card p-6 mb-6">
        <h2 className="font-display text-lg text-navy-900 mb-2">2. Upload your CSV</h2>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-cream-300 rounded-xl p-8 cursor-pointer hover:border-brand-300 transition">
          <FileSpreadsheet className="h-10 w-10 text-navy-300 mb-2" />
          <span className="text-sm text-navy-500">Click to select CSV file or drag and drop</span>
          <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      {errors.length > 0 && (
        <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-6">
          {errors.map((e, i) => <p key={i} className="text-sm text-coral-700 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {e}</p>)}
        </div>
      )}

      {/* Step 3: Preview + Create */}
      {rows.length > 0 && (
        <div className="card overflow-hidden mb-6">
          <div className="px-5 py-3 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-navy-900">{rows.length} galleries to create</span>
            <button onClick={createAll} disabled={creating} className="btn-primary">
              {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <>Create all <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {rows.map((r, i) => (
              <div key={i} className="px-5 py-3 border-b border-cream-100 flex items-center justify-between text-sm">
                <div><span className="font-semibold text-navy-900">{r.name}</span> <span className="text-navy-400">&middot; {r.clientName}</span></div>
                <div className="text-xs text-navy-400">{r.clientEmail || "No email"} &middot; {r.expiryDays}d</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

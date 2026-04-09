"use client";
import { useEffect, useState } from "react";
import {
  Mail, Download, Send, Search, MapPin, Loader2,
  Users, BarChart3, Clock, FileText,
} from "lucide-react";

type Location = { id: string; name: string };
type CustomerEmail = { name: string; email: string; locationId: string | null; createdAt: string };
type Campaign = {
  id: string; name: string; template: string; subject: string;
  sentCount: number; openCount: number; clickCount: number; sentAt: string | null;
};

const TEMPLATES = [
  { id: "gallery_ready", label: "Gallery Ready Notification" },
  { id: "limited_offer_25", label: "25% Off Limited Offer" },
  { id: "anniversary_reminder", label: "Anniversary Reminder" },
];

export default function MarketingPage() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [customers, setCustomers] = useState<CustomerEmail[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filterLoc, setFilterLoc] = useState("");
  const [search, setSearch] = useState("");

  // Campaign form
  const [selTemplate, setSelTemplate] = useState("gallery_ready");
  const [campLocId, setCampLocId] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [locRes, custRes, campRes] = await Promise.all([
        fetch("/api/admin/locations").then((r) => r.json()),
        fetch("/api/marketing/export-emails").then((r) => r.text()),
        fetch("/api/admin/marketing-campaigns").then((r) => r.json()).catch(() => ({ campaigns: [] })),
      ]);

      setLocations(locRes.locations || []);

      // Parse CSV
      const lines = custRes.split("\n").slice(1); // skip header
      const parsed = lines
        .filter((l: string) => l.trim())
        .map((line: string) => {
          const parts = line.match(/"([^"]*)"/g)?.map((s: string) => s.replace(/"/g, "")) || [];
          return {
            name: parts[0] || "",
            email: parts[1] || "",
            locationId: parts[2] || null,
            createdAt: parts[3] || "",
          };
        });
      setCustomers(parsed);
      setCampaigns(campRes.campaigns || []);
    } catch (e) {
      console.error("Failed to load marketing data", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const filtered = customers.filter((c) => {
    if (filterLoc && c.locationId !== filterLoc) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.email.toLowerCase().includes(q) || (c.name || "").toLowerCase().includes(q);
    }
    return true;
  });

  // Stats
  const totalEmails = customers.length;
  const byLocation = locations.map((l) => ({
    ...l,
    count: customers.filter((c) => c.locationId === l.name || c.locationId === l.id).length,
  }));

  async function handleSendCampaign() {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/marketing/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selTemplate,
          ...(campLocId ? { locationId: campLocId } : {}),
          ...(customSubject ? { subject: customSubject } : {}),
          ...(customBody ? { customBody } : {}),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSendResult(`Campaign sent to ${data.sentCount} recipients`);
        loadData();
      } else {
        setSendResult(`Error: ${data.error}`);
      }
    } catch {
      setSendResult("Failed to send campaign");
    }
    setSending(false);
  }

  function handleExportCSV() {
    const qs = filterLoc ? `?locationId=${filterLoc}` : "";
    window.open(`/api/marketing/export-emails${qs}`, "_blank");
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Growth</div>
        <h1 className="heading text-4xl mt-1">Email Marketing</h1>
        <p className="text-navy-400 mt-1">Collect, manage, and send campaigns to your customer email list.</p>
      </header>

      {loading ? (
        <div className="p-12 text-center text-navy-400 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-coral-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-coral-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{totalEmails}</div>
                  <div className="text-xs text-navy-400">Total Emails</div>
                </div>
              </div>
            </div>
            <div className="card px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{locations.length}</div>
                  <div className="text-xs text-navy-400">Locations</div>
                </div>
              </div>
            </div>
            <div className="card px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                  <Send className="h-5 w-5 text-gold-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{campaigns.length}</div>
                  <div className="text-xs text-navy-400">Campaigns Sent</div>
                </div>
              </div>
            </div>
            <div className="card px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-navy-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">
                    {campaigns.reduce((s, c) => s + c.sentCount, 0)}
                  </div>
                  <div className="text-xs text-navy-400">Emails Delivered</div>
                </div>
              </div>
            </div>
          </div>

          {/* Location breakdown */}
          {byLocation.filter((l) => l.count > 0).length > 0 && (
            <div className="card px-6 py-4">
              <h2 className="heading text-lg flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-coral-500" /> Emails by Location
              </h2>
              <div className="flex flex-wrap gap-3">
                {byLocation
                  .filter((l) => l.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map((l) => (
                    <div key={l.id} className="bg-cream-50 rounded-lg px-4 py-2 text-sm">
                      <span className="font-medium text-navy-700">{l.name}</span>
                      <span className="ml-2 text-coral-600 font-bold">{l.count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Email list */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-300/70 flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="heading text-lg flex items-center gap-2">
                <Mail className="h-4 w-4 text-coral-500" /> Email List
              </h2>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-navy-400" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input pl-9 text-sm w-48"
                  />
                </div>
                <select
                  className="input text-sm"
                  value={filterLoc}
                  onChange={(e) => setFilterLoc(e.target.value)}
                >
                  <option value="">All locations</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleExportCSV}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70 sticky top-0">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-300/70">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-navy-400">
                        No emails found
                      </td>
                    </tr>
                  ) : (
                    filtered.slice(0, 100).map((c, i) => (
                      <tr key={i} className="hover:bg-cream-100/60">
                        <td className="px-6 py-3 text-navy-700">{c.name || "-"}</td>
                        <td className="px-6 py-3 font-medium text-navy-900">{c.email}</td>
                        <td className="px-6 py-3 text-navy-500">{c.locationId || "-"}</td>
                        <td className="px-6 py-3 text-navy-400">{c.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 100 && (
              <div className="px-6 py-2 text-xs text-navy-400 border-t border-cream-200">
                Showing 100 of {filtered.length} results. Export CSV for full list.
              </div>
            )}
          </div>

          {/* Send campaign */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-300/70">
              <h2 className="heading text-lg flex items-center gap-2">
                <Send className="h-4 w-4 text-coral-500" /> Send Campaign
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Template</label>
                  <select
                    className="input w-full"
                    value={selTemplate}
                    onChange={(e) => setSelTemplate(e.target.value)}
                  >
                    {TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Location filter</label>
                  <select
                    className="input w-full"
                    value={campLocId}
                    onChange={(e) => setCampLocId(e.target.value)}
                  >
                    <option value="">All locations</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Custom subject (optional)</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Leave blank to use template default"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Custom body HTML (optional)</label>
                <textarea
                  className="input w-full h-24 resize-y"
                  placeholder="Leave blank to use template default"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSendCampaign}
                  disabled={sending}
                  className="btn-primary flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? "Sending..." : "Send Campaign"}
                </button>
                {sendResult && (
                  <span className={`text-sm ${sendResult.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                    {sendResult}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Campaign history */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-300/70">
              <h2 className="heading text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-coral-500" /> Campaign History
              </h2>
            </div>
            {campaigns.length === 0 ? (
              <div className="px-6 py-8 text-center text-navy-400">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No campaigns sent yet
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                    <th className="px-6 py-3">Campaign</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3 text-right">Sent</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-300/70">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-cream-100/60">
                      <td className="px-6 py-3 font-medium text-navy-700">{c.name}</td>
                      <td className="px-6 py-3 text-navy-500 truncate max-w-xs">{c.subject}</td>
                      <td className="px-6 py-3 text-right font-bold text-coral-600">{c.sentCount}</td>
                      <td className="px-6 py-3 text-navy-400">
                        {c.sentAt ? new Date(c.sentAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

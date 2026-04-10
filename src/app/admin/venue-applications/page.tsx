"use client";
import { useEffect, useState } from "react";
import { Building, Check, Clock, Eye, X, Loader2, Mail, Phone, Globe, MapPin } from "lucide-react";

type App = { id: string; companyName: string; contactName: string; email: string; phone: string; venueType: string; venueCount: string; country: string; city: string | null; estimatedRevenue: string | null; currentSetup: string | null; websiteUrl: string | null; message: string | null; status: string; createdAt: string };
const COLORS: Record<string, string> = { NEW: "bg-blue-100 text-blue-700", REVIEWING: "bg-purple-100 text-purple-700", APPROVED: "bg-green-100 text-green-700", DEMO_SCHEDULED: "bg-gold-100 text-gold-700", ONBOARDING: "bg-brand-100 text-brand-700", ACTIVE: "bg-green-100 text-green-700", DECLINED: "bg-cream-200 text-navy-500" };

export default function VenueApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, reviewing: 0, approved: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/venue-applications").then((r) => r.json()).then((d) => { setApps(d.applications || []); setStats(d.stats || {}); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="font-display text-3xl text-navy-900 mb-2">Venue Applications</h1>
      <p className="text-navy-500 text-sm mb-8">Applications from hotels, water parks, zoos, and attractions</p>

      <div className="grid grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-brand-500" },
          { label: "New", value: stats.new, color: "text-blue-500" },
          { label: "Reviewing", value: stats.reviewing, color: "text-purple-500" },
          { label: "Approved", value: stats.approved, color: "text-green-500" },
          { label: "Active", value: stats.active, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4"><div className={`font-display text-2xl ${s.color}`}>{s.value}</div><div className="text-xs text-navy-400">{s.label}</div></div>
        ))}
      </div>

      {loading ? <div className="text-center py-16"><Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-400" /></div> : apps.length === 0 ? (
        <div className="text-center py-16"><Building className="h-12 w-12 mx-auto text-navy-300 mb-3" /><p className="text-navy-500">No applications yet.</p></div>
      ) : (
        <div className="card overflow-hidden">
          {apps.map((a) => (
            <div key={a.id} className="px-5 py-4 border-b border-cream-100 hover:bg-cream-50 transition">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-navy-900">{a.companyName}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${COLORS[a.status] || "bg-cream-200 text-navy-500"}`}>{a.status.replace("_", " ")}</span>
                  <span className="text-xs text-navy-400">{a.venueType}</span>
                </div>
                <span className="text-xs text-navy-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-navy-500">
                <span>{a.contactName}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{a.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.country}{a.city ? `, ${a.city}` : ""}</span>
                <span>{a.venueCount} location{a.venueCount === "1" ? "" : "s"}</span>
                {a.estimatedRevenue && <span>{a.estimatedRevenue}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

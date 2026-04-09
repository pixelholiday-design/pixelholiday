"use client";
import { useEffect, useState } from "react";
import { Settings, User, Globe, Palette, Mail, Save, Loader2 } from "lucide-react";

export default function DashboardSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setProfile(d.user || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-12 text-navy-400">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-6 w-6 text-brand-500" />
        <div>
          <h1 className="font-display text-3xl text-navy-900">Settings</h1>
          <p className="text-navy-500 text-sm mt-0.5">Manage your studio profile and preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile section */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-navy-400" /> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label-xs block mb-1.5">Display name</label>
              <input className="input" defaultValue={profile?.name || ""} placeholder="Your name" />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Email</label>
              <input className="input bg-cream-100 text-navy-400" defaultValue={profile?.email || ""} disabled />
            </div>
          </div>
        </div>

        {/* Branding section */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-navy-400" /> Branding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label-xs block mb-1.5">Business name</label>
              <input className="input" placeholder="Your Photography Studio" />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Tagline</label>
              <input className="input" placeholder="Capturing moments that matter" />
            </div>
          </div>
        </div>

        {/* Website section */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-navy-400" /> Website
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label-xs block mb-1.5">Custom domain</label>
              <input className="input" placeholder="photos.yourdomain.com" />
              <p className="text-xs text-navy-400 mt-1">Point a CNAME record to fotiqo.com</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-navy-400" /> Notifications
          </h2>
          <div className="space-y-3">
            {[
              "New booking notification",
              "New inquiry notification",
              "Gallery viewed by client",
              "Order completed",
              "New review received",
            ].map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-navy-300 text-brand-500 focus:ring-brand-400" />
                <span className="text-sm text-navy-700">{item}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="btn-primary !py-3 w-full sm:w-auto sm:px-8">
          <Save className="h-4 w-4" /> Save changes
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Calendar, Clock, Users, MapPin, Mail, Phone, User, Check, Loader2, Sparkles } from "lucide-react";

type Location = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  locationType: string | null;
};

const SESSION_TYPES = [
  { key: "STANDARD", label: "Standard session", desc: "30 min, ~20 photos" },
  { key: "SUNSET", label: "Sunset session", desc: "Golden hour, 45 min" },
  { key: "FAMILY", label: "Family portrait", desc: "Up to 8 people" },
  { key: "ROMANTIC", label: "Romantic / couple", desc: "Private, intimate" },
  { key: "VIP", label: "VIP concierge", desc: "Luxury, 60 min, premium edit" },
  { key: "GROUP", label: "Group / celebration", desc: "Parties, anniversaries" },
];

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export default function BookForm({ locations }: { locations: Location[] }) {
  const [locationName, setLocationName] = useState(locations[0]?.name || "");
  const [sessionType, setSessionType] = useState("STANDARD");
  const [preferredDate, setPreferredDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [preferredTime, setPreferredTime] = useState("17:00");
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; confirmationCode?: string; error?: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName || !preferredDate || !preferredTime) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/bookings/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "WEBSITE",
          customerName,
          customerEmail: customerEmail || undefined,
          customerPhone,
          sessionType,
          preferredDate,
          preferredTime,
          partySize,
          locationName,
          specialRequests,
        }),
      }).then((r) => r.json());

      if (res?.ok) {
        setResult({ ok: true, confirmationCode: res.confirmationCode });
      } else {
        setResult({ ok: false, error: res?.error || "Booking failed. Please try again." });
      }
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="text-center py-6 animate-fade-in">
        <div className="h-16 w-16 mx-auto rounded-full bg-green-500/15 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" strokeWidth={2} />
        </div>
        <h2 className="font-display text-2xl text-navy-900 mb-2">Booking confirmed</h2>
        <p className="text-navy-400 mb-4">We&apos;ll confirm the photographer within the hour.</p>
        <div className="inline-block rounded-xl bg-cream-200 px-6 py-3 font-mono text-lg text-navy-900">
          {result.confirmationCode}
        </div>
        <p className="text-xs text-navy-400 mt-3">Your confirmation code — save it for reference.</p>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setCustomerName("");
            setCustomerEmail("");
            setCustomerPhone("");
            setSpecialRequests("");
          }}
          className="mt-6 text-sm text-brand-600 hover:text-brand-700"
        >
          Book another session →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Location */}
      <div>
        <label className="label-xs block mb-1.5 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> Location
        </label>
        <select
          className="input"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          required
        >
          {locations.length === 0 && <option value="">No locations available</option>}
          {locations.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
              {l.city ? ` · ${l.city}` : ""}
              {l.country ? ` · ${l.country}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Session type */}
      <div>
        <label className="label-xs block mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} /> Session type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SESSION_TYPES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSessionType(s.key)}
              className={`text-left rounded-xl border p-3 transition ${
                sessionType === s.key
                  ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                  : "border-cream-300 bg-white hover:border-brand-200"
              }`}
            >
              <div className="text-sm font-medium text-navy-900">{s.label}</div>
              <div className="text-[11px] text-navy-400 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Date + time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs block mb-1.5 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} /> Date
          </label>
          <input
            type="date"
            className="input"
            value={preferredDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setPreferredDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-xs block mb-1.5 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> Time
          </label>
          <select
            className="input"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            required
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Party size */}
      <div>
        <label className="label-xs block mb-1.5 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" strokeWidth={1.5} /> Party size
        </label>
        <input
          type="number"
          className="input"
          min={1}
          max={50}
          value={partySize}
          onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
        />
      </div>

      {/* Customer info */}
      <div className="pt-2 border-t border-cream-300">
        <div className="label-xs mb-3">Your details</div>

        <div className="space-y-3">
          <div>
            <label className="label-xs block mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" strokeWidth={1.5} /> Full name
            </label>
            <input
              type="text"
              className="input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Maria García"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs block mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} /> Email
              </label>
              <input
                type="email"
                className="input"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label-xs block mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} /> Phone
              </label>
              <input
                type="tel"
                className="input"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+34 612 345 678"
              />
            </div>
          </div>
          <div>
            <label className="label-xs block mb-1.5">Special requests (optional)</label>
            <textarea
              className="input min-h-[80px]"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Anniversary, kids' ages, preferred backdrop, accessibility notes…"
            />
          </div>
        </div>
      </div>

      {result?.error && (
        <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2.5 text-sm text-coral-700">
          {result.error}
        </div>
      )}

      <button type="submit" disabled={submitting || !customerName} className="btn-primary w-full !py-3">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
          </>
        ) : (
          <>Reserve session</>
        )}
      </button>

      <p className="text-[11px] text-navy-400 text-center">
        By submitting, you agree to our terms and privacy policy.
      </p>
    </form>
  );
}

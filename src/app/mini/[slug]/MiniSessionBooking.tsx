"use client";

import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

type Slot = { time: string; iso: string; available: boolean };

interface Props {
  sessionId: string;
  slug: string;
  slots: Slot[];
  price: number;
  currency: string;
}

export default function MiniSessionBooking({ sessionId, slug, slots, price, currency }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleBook() {
    if (!selectedSlot || !form.name || !form.email) return;
    setBooking(true);
    setError("");
    try {
      const res = await fetch(`/api/mini-sessions/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          slotTime: selectedSlot,
          clientName: form.name,
          clientEmail: form.email,
          clientPhone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBooking(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy-900 mb-2">Booked!</h2>
        <p className="text-navy-500">Check your email for confirmation details.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-semibold text-navy-800 mb-3">Select a Time Slot</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
        {slots.map((slot) => (
          <button
            key={slot.iso}
            disabled={!slot.available}
            onClick={() => setSelectedSlot(slot.iso)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              !slot.available
                ? "bg-cream-100 text-navy-300 cursor-not-allowed line-through"
                : selectedSlot === slot.iso
                  ? "bg-brand-500 text-white shadow-md"
                  : "bg-cream-50 text-navy-700 hover:bg-brand-50 hover:text-brand-700 border border-cream-200"
            }`}
          >
            <Clock className="h-3 w-3 inline-block mr-1" />
            {slot.time}
          </button>
        ))}
      </div>

      {selectedSlot && (
        <div className="space-y-4">
          <h2 className="font-semibold text-navy-800">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2.5 rounded-lg border border-cream-300 text-sm"
            />
            <input
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2.5 rounded-lg border border-cream-300 text-sm"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="px-3 py-2.5 rounded-lg border border-cream-300 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleBook}
            disabled={booking || !form.name || !form.email}
            className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {booking ? "Booking..." : `Book — ${currency === "EUR" ? "€" : "$"}${price}`}
          </button>
        </div>
      )}
    </div>
  );
}

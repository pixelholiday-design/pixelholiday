"use client";
import { useState } from "react";
import { Check, Loader2, CalendarCheck } from "lucide-react";

const slots = ["10:00", "11:30", "14:00", "15:30", "17:00", "18:30"];

export default function BookingTimePicker({ token }: { token: string }) {
  const [time, setTime] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function book() {
    if (!time) return;
    setBusy(true);
    const d = new Date();
    const [h, m] = time.split(":").map(Number);
    // Push to tomorrow if the slot already passed today
    if (h * 60 + m < d.getHours() * 60 + d.getMinutes()) {
      d.setDate(d.getDate() + 1);
    }
    d.setHours(h, m, 0, 0);
    const r = await fetch(`/api/gallery/${token}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledTime: d.toISOString() }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center animate-fade-in">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white mb-3">
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
        <div className="font-display text-xl text-navy-900">See you at {time}</div>
        <p className="text-sm text-navy-500 mt-1">Your photographer has been notified.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="label-xs mb-2">Choose a time</div>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setTime(s)}
            className={`rounded-xl py-3 text-sm font-semibold transition ${
              time === s
                ? "bg-navy-800 text-white shadow-card"
                : "bg-cream-100 text-navy-700 hover:bg-cream-200 border border-cream-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <button disabled={!time || busy} onClick={book} className="btn-primary w-full !py-3 mt-5">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Booking…
          </>
        ) : (
          <>
            <CalendarCheck className="h-4 w-4" /> {time ? `Book ${time}` : "Pick a time"}
          </>
        )}
      </button>
    </div>
  );
}

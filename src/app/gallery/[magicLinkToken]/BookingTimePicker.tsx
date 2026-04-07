"use client";
import { useState } from "react";

const slots = ["10:00", "11:30", "14:00", "15:30", "17:00", "18:30"];

export default function BookingTimePicker({ token }: { token: string }) {
  const [time, setTime] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function book() {
    if (!time) return;
    setBusy(true);
    const today = new Date();
    const [h, m] = time.split(":").map(Number);
    today.setHours(h, m, 0, 0);
    const r = await fetch(`/api/gallery/${token}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledTime: today.toISOString() }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) setDone(true);
  }

  if (done) return <p className="text-green-700 font-medium">✅ Booked! See you at {time}.</p>;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((s) => (
          <button key={s} onClick={() => setTime(s)} className={`rounded-lg py-2 text-sm font-medium ${time === s ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"}`}>
            {s}
          </button>
        ))}
      </div>
      <button disabled={!time || busy} onClick={book} className="mt-4 w-full bg-amber-500 text-white rounded-lg py-3 font-semibold hover:bg-amber-600 disabled:opacity-50">
        {busy ? "Booking..." : time ? `Book ${time}` : "Pick a time"}
      </button>
    </div>
  );
}

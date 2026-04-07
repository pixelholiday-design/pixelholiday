"use client";
import { useState } from "react";

export default function BookFromQR({ params }: { params: { qrCodeId: string } }) {
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [photographerId, setPhotographerId] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    const r = await fetch("/api/booking/qr-prebook", {
      method: "POST",
      body: JSON.stringify({ qrCodeId: params.qrCodeId, scheduledTime: time, name, whatsapp, photographerId }),
    });
    if (r.ok) setDone(true);
  }
  if (done) return <div className="p-8 text-center text-2xl">✅ Booking confirmed! See you soon.</div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Book Your Photo Session</h1>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        <input className="w-full border p-2 rounded" type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Request specific photographer (optional)" value={photographerId} onChange={(e) => setPhotographerId(e.target.value)} />
        <button onClick={submit} className="w-full bg-rose-600 text-white py-3 rounded font-semibold">Confirm Booking</button>
      </div>
    </div>
  );
}

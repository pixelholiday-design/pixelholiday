"use client";
import { useState } from "react";
import { Heart, Check } from "lucide-react";
import { cleanUrl } from "@/lib/cloudinary";

type Photo = { id: string; s3Key_highRes: string; cloudinaryId: string | null; isFavorited: boolean };
type Gallery = { id: string; photos: Photo[]; customer: { name: string | null } };

export default function KioskView({ gallery }: { gallery: Gallery }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [method, setMethod] = useState<"STRIPE_TERMINAL" | "CASH">("STRIPE_TERMINAL");
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function complete() {
    setBusy(true);
    const r = await fetch("/api/kiosk/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ galleryId: gallery.id, photoIds: Array.from(selected), paymentMethod: method, cashPin: method === "CASH" ? pin : undefined }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <Check size={120} className="text-green-400 mb-6" />
        <h1 className="text-5xl font-bold">Sale complete!</h1>
        <p className="text-xl mt-4 text-stone-300">{selected.size} photos unlocked on the customer's phone.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-y-auto">
      <header className="sticky top-0 bg-black/80 backdrop-blur p-6 z-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {gallery.customer.name || "Guest"} ✨</h1>
        <p className="text-stone-400">{selected.size} of {gallery.photos.length} selected</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
        {gallery.photos.map((p) => {
          const active = selected.has(p.id);
          return (
            <button key={p.id} onClick={() => toggle(p.id)} className={`relative rounded-2xl overflow-hidden border-4 transition ${active ? "border-amber-400" : "border-transparent"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cleanUrl(p.cloudinaryId || p.s3Key_highRes, 1600)} alt="" className="w-full h-full object-cover" />
              {active && (
                <div className="absolute top-3 right-3 bg-amber-400 text-black rounded-full p-2">
                  <Check size={18} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <footer className="sticky bottom-0 bg-stone-950 border-t border-stone-800 p-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex gap-2">
          <button onClick={() => setMethod("STRIPE_TERMINAL")} className={`px-4 py-3 rounded-xl font-semibold ${method === "STRIPE_TERMINAL" ? "bg-amber-400 text-black" : "bg-stone-800"}`}>Card</button>
          <button onClick={() => setMethod("CASH")} className={`px-4 py-3 rounded-xl font-semibold ${method === "CASH" ? "bg-amber-400 text-black" : "bg-stone-800"}`}>Cash</button>
        </div>
        {method === "CASH" && (
          <input type="password" placeholder="Staff PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="bg-stone-800 rounded-xl px-4 py-3 text-white" />
        )}
        <button disabled={!selected.size || busy || (method === "CASH" && !pin)} onClick={complete} className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold rounded-xl px-8 py-4 text-lg">
          {busy ? "Processing..." : `Complete sale (${selected.size})`}
        </button>
      </footer>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import SalesCoach from "@/components/kiosk/SalesCoach";
import { Camera, Check, Loader2, RefreshCw, Upload, ListOrdered, Star, Banknote, CreditCard, Printer, LogOut, Aperture } from "lucide-react";
import PinPad from "@/components/kiosk/PinPad";
import Receipt, { ReceiptData } from "@/components/kiosk/Receipt";
import { cleanUrl, photoRef } from "@/lib/cloudinary";

type Staff = { id: string; name: string; role: string };
type SaleOrder = {
  id: string;
  totalCents: number;
  photoIds: string[];
  createdAt: string;
  gallery: any;
};

export default function SalePointPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [tab, setTab] = useState<"sales" | "upload">("sales");
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [active, setActive] = useState<SaleOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [cashAmt, setCashAmt] = useState("");

  // Auto-poll for new orders every 5s
  useEffect(() => {
    if (!staff || tab !== "sales") return;
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [staff, tab]);

  // Auto-lock after 2min idle
  useEffect(() => {
    if (!staff) return;
    let lastActivity = Date.now();
    const onActivity = () => (lastActivity = Date.now());
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity);
    const id = setInterval(() => {
      if (Date.now() - lastActivity > 2 * 60 * 1000) setStaff(null);
    }, 5000);
    return () => {
      clearInterval(id);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [staff]);

  async function load() {
    const r = await fetch("/api/kiosk/sale-orders").then((r) => r.json());
    setOrders(r.orders || []);
  }

  async function confirm(method: "POS" | "CASH") {
    if (!active || !staff) return;
    setBusy(true);
    const received = method === "CASH" ? Math.round(parseFloat(cashAmt || "0") * 100) : undefined;
    const r = await fetch("/api/kiosk/sale-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: active.id,
        paymentMethod: method,
        receivedCents: received,
        staffId: staff.id,
      }),
    }).then((r) => r.json());
    setBusy(false);
    if (r.ok) {
      setReceipt({
        date: new Date().toLocaleString(),
        location: active.gallery?.photographer?.locationId || "Fotiqo",
        photographer: active.gallery?.photographer?.name || staff.name,
        customer: active.gallery?.customer?.name || "Guest",
        items: [{ label: `${active.photoIds.length} photos`, qty: 1, price: active.totalCents / 100 }],
        total: active.totalCents / 100,
        paymentMethod: method === "CASH" ? "Cash" : "POS terminal",
        receiptCode: r.receiptCode,
        galleryUrl: `${window.location.origin}/gallery/${active.gallery?.magicLinkToken}`,
      });
      setActive(null);
      setCashAmt("");
      load();
    }
  }

  // ── PIN screen ──
  if (!staff) {
    return (
      <div className="fixed inset-0 kiosk-mesh flex flex-col items-center justify-center p-8">
        <div className="kiosk-badge mb-6" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>
          <Aperture className="h-3 w-3" /> Sale Point
        </div>
        <PinPad onVerified={(u) => setStaff(u)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 text-white flex flex-col" style={{ background: "#050a12" }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(99, 102, 241, 0.12)" }}>
            <Aperture className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">Sale Point</div>
            <div className="text-xs text-white/40">{staff.name} &middot; {staff.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("sales")} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "sales" ? "text-white" : "text-white/40 hover:text-white/60"}`} style={tab === "sales" ? { background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc" } : {}}>
            <ListOrdered className="h-4 w-4 inline mr-1.5" /> Sales {orders.length > 0 && <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#6366f1", color: "white" }}>{orders.length}</span>}
          </button>
          <button onClick={() => setTab("upload")} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "upload" ? "text-white" : "text-white/40 hover:text-white/60"}`} style={tab === "upload" ? { background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc" } : {}}>
            <Upload className="h-4 w-4 inline mr-1.5" /> Upload
          </button>
          <button onClick={() => setStaff(null)} className="px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 transition" style={{ background: "rgba(255,255,255,0.04)" }}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {receipt && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}>
          <div className="max-h-[90vh] overflow-y-auto">
            <Receipt data={receipt} />
            <button onClick={() => setReceipt(null)} className="kiosk-btn kiosk-btn-ghost text-white mt-4 mx-auto block">
              Close
            </button>
          </div>
        </div>
      )}

      {tab === "sales" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          <aside className="overflow-y-auto" style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="p-4 flex items-center justify-between">
              <span className="text-[11px] text-white/30 uppercase tracking-[0.12em] font-semibold">Pending orders</span>
              <button onClick={load} className="text-white/30 hover:text-white/60 transition"><RefreshCw className="h-3.5 w-3.5" /></button>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center text-white/25 text-sm">No pending orders.</div>
            ) : (
              <ul className="px-2">
                {orders.map((o) => (
                  <li key={o.id}>
                    <button
                      onClick={() => setActive(o)}
                      className={`w-full text-left p-4 rounded-xl mb-1 transition ${
                        active?.id === o.id ? "kiosk-card active" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="font-semibold text-white/90">{o.gallery?.customer?.name || "Guest"}</div>
                      <div className="text-xs text-white/40 mt-0.5">{o.photoIds.length} photos &middot; &euro;{(o.totalCents / 100).toFixed(2)}</div>
                      <div className="text-[10px] text-white/20 mt-1">{new Date(o.createdAt).toLocaleTimeString()}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <main className="lg:col-span-2 overflow-y-auto p-6 lg:p-8">
            {!active ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20 gap-3">
                <ListOrdered className="h-10 w-10 opacity-30" />
                <span>Select an order to begin</span>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <div className="kiosk-badge mb-3" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>Confirm sale</div>
                    <h2 className="text-3xl font-bold tracking-tight">{active.gallery?.customer?.name}</h2>
                    <div className="text-white/40 text-sm mt-1">{active.photoIds.length} photos selected</div>
                  </div>
                  <div className="text-5xl font-bold text-indigo-400 tabular-nums">&euro;{(active.totalCents / 100).toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                  {(active.gallery?.photos || []).map((p: any) => (
                    <div key={p.id} className="aspect-square rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cleanUrl(photoRef(p), 800)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <SalesCoach
                    cartItemCount={active.photoIds.length}
                    cartTotal={active.totalCents / 100}
                    locationType="LUXURY"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="kiosk-card p-6">
                    <div className="flex items-center gap-2.5 mb-4 text-white/90">
                      <CreditCard className="h-5 w-5 text-indigo-400" /> <span className="font-semibold">POS terminal</span>
                    </div>
                    <p className="text-white/40 text-sm mb-5">Confirm payment received from card reader.</p>
                    <button disabled={busy} onClick={() => confirm("POS")} className="kiosk-btn kiosk-btn-primary w-full">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm POS payment
                    </button>
                  </div>
                  <div className="kiosk-card p-6">
                    <div className="flex items-center gap-2.5 mb-4 text-white/90">
                      <Banknote className="h-5 w-5 text-emerald-400" /> <span className="font-semibold">Cash</span>
                    </div>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      placeholder="Amount received"
                      value={cashAmt}
                      onChange={(e) => setCashAmt(e.target.value)}
                    />
                    {cashAmt && parseFloat(cashAmt) >= active.totalCents / 100 && (
                      <div className="text-sm text-emerald-400 mt-2 font-medium">
                        Change: &euro;{(parseFloat(cashAmt) - active.totalCents / 100).toFixed(2)}
                      </div>
                    )}
                    <button
                      disabled={busy || !cashAmt || parseFloat(cashAmt) < active.totalCents / 100}
                      onClick={() => confirm("CASH")}
                      className="kiosk-btn kiosk-btn-primary w-full mt-3"
                      style={{ background: "#059669" }}
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm cash
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      )}

      {tab === "upload" && (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="max-w-md anim-slide-up">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: "rgba(99, 102, 241, 0.12)" }}>
              <Upload className="h-6 w-6 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">SD card upload</h2>
            <p className="text-white/40 mb-6">Use the dedicated SD upload kiosk to insert and import photos.</p>
            <a href="/kiosk/sd-upload" className="kiosk-btn kiosk-btn-primary">
              <Upload className="h-4 w-4" /> Open SD upload
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

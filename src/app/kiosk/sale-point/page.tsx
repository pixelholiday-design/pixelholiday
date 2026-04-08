"use client";
import { useEffect, useState } from "react";
import SalesCoach from "@/components/kiosk/SalesCoach";
import { Camera, Check, Loader2, RefreshCw, Upload, ListOrdered, Star, Banknote, CreditCard, Printer, LogOut } from "lucide-react";
import PinPad from "@/components/kiosk/PinPad";
import Receipt, { ReceiptData } from "@/components/kiosk/Receipt";
import { cleanUrl } from "@/lib/cloudinary";

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
        location: active.gallery?.photographer?.locationId || "PixelHoliday",
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
      <div className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center p-8">
        <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-3">Sale point</div>
        <PinPad onVerified={(u) => setStaff(u)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-navy-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-navy-800/70 backdrop-blur p-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-coral-500/15 ring-1 ring-coral-500/30 flex items-center justify-center">
            <Camera className="h-5 w-5 text-coral-400" />
          </div>
          <div>
            <div className="font-display text-xl">Sale point</div>
            <div className="text-xs text-white/50">{staff.name} · {staff.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("sales")} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === "sales" ? "bg-coral-500 text-white" : "bg-white/10 text-white/70"}`}>
            <ListOrdered className="h-4 w-4 inline mr-1" /> Sales {orders.length > 0 && <span className="ml-1 bg-white text-navy-900 rounded-full px-1.5 text-[10px]">{orders.length}</span>}
          </button>
          <button onClick={() => setTab("upload")} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === "upload" ? "bg-coral-500 text-white" : "bg-white/10 text-white/70"}`}>
            <Upload className="h-4 w-4 inline mr-1" /> Upload
          </button>
          <button onClick={() => setStaff(null)} className="px-3 py-2 rounded-xl bg-white/10 text-white/70 text-sm">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {receipt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur z-30 flex items-center justify-center p-6">
          <div className="max-h-[90vh] overflow-y-auto">
            <Receipt data={receipt} />
            <button onClick={() => setReceipt(null)} className="btn-ghost text-white mt-4 mx-auto block">
              Close
            </button>
          </div>
        </div>
      )}

      {tab === "sales" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          <aside className="border-r border-white/5 overflow-y-auto">
            <div className="p-4 flex items-center justify-between text-xs text-white/40 uppercase tracking-widest">
              Pending orders
              <button onClick={load} className="text-white/60"><RefreshCw className="h-3.5 w-3.5" /></button>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-sm">No pending orders.</div>
            ) : (
              <ul>
                {orders.map((o) => (
                  <li key={o.id}>
                    <button
                      onClick={() => setActive(o)}
                      className={`w-full text-left p-4 border-l-4 transition ${
                        active?.id === o.id ? "border-coral-500 bg-coral-500/10" : "border-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className="font-semibold">{o.gallery?.customer?.name || "Guest"}</div>
                      <div className="text-xs text-white/50">{o.photoIds.length} photos · €{(o.totalCents / 100).toFixed(2)}</div>
                      <div className="text-[10px] text-white/30 mt-1">{new Date(o.createdAt).toLocaleTimeString()}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <main className="lg:col-span-2 overflow-y-auto p-6 lg:p-8">
            {!active ? (
              <div className="h-full flex items-center justify-center text-white/40">
                Select an order to begin
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="text-gold-400 uppercase tracking-widest text-xs font-semibold mb-1">Confirm sale</div>
                    <h2 className="font-display text-3xl">{active.gallery?.customer?.name}</h2>
                    <div className="text-white/50 text-sm">{active.photoIds.length} photos selected</div>
                  </div>
                  <div className="font-display text-5xl text-gold-400">€{(active.totalCents / 100).toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                  {(active.gallery?.photos || []).map((p: any) => (
                    <div key={p.id} className="aspect-square rounded-xl overflow-hidden ring-1 ring-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cleanUrl(p.cloudinaryId || p.s3Key_highRes, 800)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <SalesCoach
                    cartItemCount={active.photoIds.length}
                    cartTotal={active.totalCents / 100}
                    locationType="LUXURY"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card !bg-white/5 !border-white/5 p-5">
                    <div className="flex items-center gap-2 mb-3 text-white">
                      <CreditCard className="h-5 w-5" /> <span className="font-semibold">POS terminal</span>
                    </div>
                    <p className="text-white/50 text-sm mb-4">Confirm payment received from card reader.</p>
                    <button disabled={busy} onClick={() => confirm("POS")} className="btn-primary w-full !py-3">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm POS payment
                    </button>
                  </div>
                  <div className="card !bg-white/5 !border-white/5 p-5">
                    <div className="flex items-center gap-2 mb-3 text-white">
                      <Banknote className="h-5 w-5" /> <span className="font-semibold">Cash</span>
                    </div>
                    <input
                      type="number"
                      className="input !text-navy-900"
                      placeholder="Amount received"
                      value={cashAmt}
                      onChange={(e) => setCashAmt(e.target.value)}
                    />
                    {cashAmt && parseFloat(cashAmt) >= active.totalCents / 100 && (
                      <div className="text-sm text-gold-400 mt-2">
                        Change: €{(parseFloat(cashAmt) - active.totalCents / 100).toFixed(2)}
                      </div>
                    )}
                    <button
                      disabled={busy || !cashAmt || parseFloat(cashAmt) < active.totalCents / 100}
                      onClick={() => confirm("CASH")}
                      className="btn-primary w-full !py-3 mt-3"
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
          <div className="max-w-md">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-500/15 text-coral-300 mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl mb-2">SD card upload</h2>
            <p className="text-white/60 mb-6">Use the dedicated SD upload kiosk to insert and import photos.</p>
            <a href="/kiosk/sd-upload" className="btn-primary inline-flex">
              <Upload className="h-4 w-4" /> Open SD upload
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

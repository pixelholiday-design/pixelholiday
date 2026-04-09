"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  Package,
  RefreshCw,
  RotateCcw,
  Send,
  StickyNote,
  Truck,
  X,
} from "lucide-react";

type ShopOrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size: string | null;
  option: string | null;
  status: string;
  labItemId: string | null;
  product: {
    name: string;
    category: string;
    fulfillmentType: string;
    labProductId: string | null;
    labName: string | null;
  };
};

type ShopOrder = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  shippingPostal: string | null;
  shippingMethod: string | null;
  labOrderId: string | null;
  labName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  pixelvoCommission: number;
  createdAt: string;
  updatedAt: string;
  customer: { name: string | null; email: string | null };
  items: ShopOrderItem[];
};

type Tab = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

const TAB_STATUS_MAP: Record<Tab, string[]> = {
  PENDING: ["PENDING", "PAID"],
  PROCESSING: ["PROCESSING"],
  SHIPPED: ["SHIPPED"],
  DELIVERED: ["DELIVERED"],
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gold-100 text-gold-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-brand-100 text-brand-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  ERROR: "bg-coral-100 text-coral-700",
  CANCELLED: "bg-cream-200 text-navy-500",
};

const LAB_DASHBOARD_URLS: Record<string, string> = {
  PRODIGI: "https://dashboard.prodigi.com/orders",
  PRINTFUL: "https://www.printful.com/dashboard/orders",
};

// Derive a label badge color from lab name
function labBadgeClass(labName: string | null) {
  if (!labName) return "bg-cream-200 text-navy-600";
  const n = labName.toUpperCase();
  if (n.includes("PRODIGI")) return "bg-brand-100 text-brand-700";
  if (n.includes("PRINTFUL")) return "bg-blue-100 text-blue-700";
  if (n.includes("LOCAL") || n.includes("MANUAL")) return "bg-green-100 text-green-700";
  if (n.includes("MOCK")) return "bg-cream-200 text-navy-500";
  return "bg-cream-200 text-navy-600";
}

export default function FulfillmentPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("PENDING");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { number: string; url: string }>>({});
  // Notes state per order
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});
  // Polling state
  const [polling, setPolling] = useState(false);
  const [pollResult, setPollResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/shop-orders");
      const data = await res.json();
      if (data.error) setError(data.error);
      else setOrders(data.orders ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredOrders = orders.filter((o) => TAB_STATUS_MAP[activeTab].includes(o.status));

  function flash(msg: string) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4500);
  }

  async function sendToLab(orderId: string) {
    setProcessing(orderId);
    try {
      const res = await fetch(`/api/admin/shop-orders/fulfill`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.error) {
        flash(`Error: ${data.error}`);
      } else {
        flash(`Order fulfilled. Lab ID: ${data.labOrderId ?? "N/A"}`);
        load();
      }
    } catch (e: any) {
      flash(`Error: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  }

  async function updateOrder(orderId: string, patch: Record<string, unknown>) {
    setProcessing(orderId);
    try {
      const res = await fetch("/api/admin/shop-orders", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: orderId, ...patch }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.error) {
        flash(`Error: ${data.error}`);
      } else {
        flash("Updated!");
        load();
      }
    } catch (e: any) {
      flash(`Error: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  }

  function markShipped(orderId: string) {
    const t = trackingInputs[orderId] ?? { number: "", url: "" };
    updateOrder(orderId, { status: "SHIPPED", trackingNumber: t.number, trackingUrl: t.url });
  }

  function markDelivered(orderId: string) {
    updateOrder(orderId, { status: "DELIVERED" });
  }

  function saveNote(orderId: string) {
    const note = noteInputs[orderId] ?? "";
    updateOrder(orderId, { notes: note });
  }

  async function pollLabStatuses() {
    setPolling(true);
    setPollResult(null);
    try {
      const res = await fetch("/api/shop/poll-status");
      const data = await res.json();
      if (data.error) {
        setPollResult(`Poll error: ${data.error}`);
      } else {
        setPollResult(`Polled ${data.polled} orders · ${data.updated} updated`);
        if ((data.updated ?? 0) > 0) load();
      }
    } catch (e: any) {
      setPollResult(`Poll error: ${e.message}`);
    } finally {
      setPolling(false);
      setTimeout(() => setPollResult(null), 5000);
    }
  }

  const tabs: Tab[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const tabCounts = tabs.map((t) => ({
    key: t,
    label: t,
    count: orders.filter((o) => TAB_STATUS_MAP[t].includes(o.status)).length,
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="label-xs">Store</div>
          <h1 className="heading text-4xl mt-1">Fulfillment</h1>
          <p className="text-navy-400 mt-1">Send print orders to the lab, mark shipped, and track delivery.</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={pollLabStatuses}
            disabled={polling}
            className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-900 transition border border-cream-300 px-3 py-1.5 rounded-full hover:border-navy-300"
          >
            {polling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Poll lab status
          </button>
          <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-900 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link href="/admin/store" className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-900 transition">
            <ArrowLeft className="h-4 w-4" /> Store overview
          </Link>
        </div>
      </header>

      {actionMsg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${actionMsg.startsWith("Error") ? "bg-coral-50 text-coral-700 border border-coral-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {actionMsg}
        </div>
      )}

      {pollResult && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${pollResult.startsWith("Poll error") ? "bg-coral-50 text-coral-700 border border-coral-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
          {pollResult}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabCounts.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === tab.key ? "bg-brand-700 text-white" : "bg-white text-navy-600 hover:bg-cream-200 border border-cream-300"
            }`}
          >
            {tab.label}
            <span className={`rounded-full text-xs px-2 py-0.5 ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-cream-200 text-navy-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-coral-50 border border-coral-200 text-coral-700 rounded-xl p-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-navy-400">
          <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading orders…
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-12 text-center text-navy-400">
          <Package className="h-10 w-10 mx-auto text-navy-200 mb-3" />
          <p>No {activeTab.toLowerCase()} orders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const physicalItems = order.items.filter((i) => i.product.fulfillmentType !== "DIGITAL");
            const trackingInput = trackingInputs[order.id] ?? { number: order.trackingNumber ?? "", url: order.trackingUrl ?? "" };
            const noteOpen = notesOpen[order.id] ?? false;
            const noteVal = noteInputs[order.id] ?? "";

            // Lab dashboard link
            const labDashUrl = order.labName
              ? LAB_DASHBOARD_URLS[order.labName.toUpperCase()] || null
              : null;

            return (
              <div key={order.id} className="card p-6 space-y-4">
                {/* Order header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display text-lg text-navy-900">
                        {order.customer.name || order.customer.email || "Guest"}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-cream-200 text-navy-500"}`}>
                        {order.status}
                      </span>
                      {/* Lab name badge */}
                      {order.labName && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${labBadgeClass(order.labName)}`}>
                          {order.labName}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-navy-400 mt-0.5">
                      Order #{order.id.slice(-8)} · {new Date(order.createdAt).toLocaleDateString()}
                      {" · Updated "}{new Date(order.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-navy-900">€{order.total.toFixed(2)}</div>
                    <div className="text-xs text-navy-400">Commission: €{order.pixelvoCommission.toFixed(2)}</div>
                  </div>
                </div>

                {/* Shipping info */}
                {order.shippingName && (
                  <div className="bg-cream-100 rounded-xl px-4 py-3 text-sm text-navy-700">
                    <Truck className="h-4 w-4 inline mr-1.5 text-navy-400" />
                    <span className="font-semibold">{order.shippingName}</span>
                    {" · "}{order.shippingAddress}, {order.shippingCity}, {order.shippingCountry} {order.shippingPostal}
                    {" · "}<span className="font-medium">{order.shippingMethod}</span>
                  </div>
                )}

                {/* Lab order ID */}
                {order.labOrderId && (
                  <div className="text-xs text-navy-500 flex items-center gap-2">
                    <span>Lab order:</span>
                    <span className="font-mono font-semibold text-navy-900">{order.labOrderId}</span>
                    {order.labName && <span className="text-navy-400">· {order.labName}</span>}
                    {labDashUrl && (
                      <a
                        href={labDashUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Dashboard
                      </a>
                    )}
                  </div>
                )}

                {/* Tracking */}
                {order.trackingNumber && (
                  <div className="text-xs text-navy-500">
                    Tracking: <span className="font-mono font-semibold text-navy-900">{order.trackingNumber}</span>
                    {order.trackingUrl && (
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-700 underline">
                        Track
                      </a>
                    )}
                  </div>
                )}

                {/* Fulfillment timeline */}
                <div className="flex items-center gap-2 text-xs text-navy-400 flex-wrap">
                  <span className={`px-2 py-0.5 rounded ${["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? "text-green-700 font-semibold" : "text-navy-300"}`}>
                    ✓ Placed
                  </span>
                  <span className="text-navy-200">→</span>
                  <span className={`px-2 py-0.5 rounded ${["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? "text-brand-700 font-semibold" : "text-navy-300"}`}>
                    {["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) ? "✓" : "○"} Processing
                  </span>
                  <span className="text-navy-200">→</span>
                  <span className={`px-2 py-0.5 rounded ${["SHIPPED", "DELIVERED"].includes(order.status) ? "text-purple-700 font-semibold" : "text-navy-300"}`}>
                    {["SHIPPED", "DELIVERED"].includes(order.status) ? "✓" : "○"} Shipped
                  </span>
                  <span className="text-navy-200">→</span>
                  <span className={`px-2 py-0.5 rounded ${order.status === "DELIVERED" ? "text-green-700 font-semibold" : "text-navy-300"}`}>
                    {order.status === "DELIVERED" ? "✓" : "○"} Delivered
                  </span>
                </div>

                {/* Items list */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2">Items</div>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.product.fulfillmentType === "DIGITAL" ? "bg-blue-50 text-blue-700" :
                            item.product.fulfillmentType === "AUTO" ? "bg-green-50 text-green-700" :
                            "bg-gold-50 text-gold-700"
                          }`}>
                            {item.product.fulfillmentType}
                          </span>
                          <span className="text-navy-700">{item.product.name}</span>
                          {item.size && <span className="text-navy-400">({item.size})</span>}
                          <span className="text-navy-400">×{item.quantity}</span>
                        </div>
                        <span className="text-navy-700 font-medium">€{item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes section */}
                <div>
                  <button
                    type="button"
                    onClick={() => setNotesOpen((prev) => ({ ...prev, [order.id]: !noteOpen }))}
                    className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-900 transition"
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                    {noteOpen ? "Hide notes" : "Add / view notes"}
                  </button>
                  {noteOpen && (
                    <div className="mt-2 flex gap-2">
                      <textarea
                        rows={2}
                        placeholder="Internal order notes…"
                        value={noteVal}
                        onChange={(e) => setNoteInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        className="flex-1 rounded-lg border border-cream-400 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                      />
                      <button
                        onClick={() => saveNote(order.id)}
                        disabled={processing === order.id}
                        className="self-start inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                      >
                        {processing === order.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-cream-300">
                  {/* Send to lab (PENDING/PAID) */}
                  {["PENDING", "PAID"].includes(order.status) && physicalItems.length > 0 && (
                    <button
                      onClick={() => sendToLab(order.id)}
                      disabled={processing === order.id}
                      className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                    >
                      {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send to Lab
                    </button>
                  )}

                  {/* Resend to lab (PROCESSING — retry) */}
                  {order.status === "PROCESSING" && physicalItems.length > 0 && (
                    <button
                      onClick={() => sendToLab(order.id)}
                      disabled={processing === order.id}
                      className="inline-flex items-center gap-2 border border-brand-300 text-brand-700 hover:bg-brand-50 disabled:opacity-50 px-4 py-2 rounded-full text-sm font-semibold transition"
                    >
                      {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                      Resend to Lab
                    </button>
                  )}

                  {/* Cancel at lab (PENDING/PROCESSING) */}
                  {["PENDING", "PAID", "PROCESSING"].includes(order.status) && (
                    <button
                      onClick={() => updateOrder(order.id, { status: "CANCELLED" })}
                      disabled={processing === order.id}
                      className="inline-flex items-center gap-2 border border-coral-300 text-coral-700 hover:bg-coral-50 disabled:opacity-50 px-4 py-2 rounded-full text-sm font-semibold transition"
                    >
                      {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      Cancel at Lab
                    </button>
                  )}

                  {/* Mark shipped (PROCESSING) */}
                  {order.status === "PROCESSING" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        placeholder="Tracking number"
                        value={trackingInput.number}
                        onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: { ...trackingInput, number: e.target.value } }))}
                        className="rounded-lg border border-cream-400 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <input
                        type="text"
                        placeholder="Tracking URL (optional)"
                        value={trackingInput.url}
                        onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: { ...trackingInput, url: e.target.value } }))}
                        className="rounded-lg border border-cream-400 px-3 py-2 text-sm w-52 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        onClick={() => markShipped(order.id)}
                        disabled={processing === order.id}
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                      >
                        {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                        Mark Shipped
                      </button>
                    </div>
                  )}

                  {/* Mark delivered (SHIPPED) */}
                  {order.status === "SHIPPED" && (
                    <button
                      onClick={() => markDelivered(order.id)}
                      disabled={processing === order.id}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                    >
                      {processing === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Mark Delivered
                    </button>
                  )}

                  {/* Customer order tracking link */}
                  <a
                    href={`/order/${order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-900 ml-auto"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Customer view
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

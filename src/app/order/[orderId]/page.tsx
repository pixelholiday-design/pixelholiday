import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Camera, Check, Circle, Package, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

// Status progression order
const STATUS_STEPS = [
  { key: "PLACED", label: "Order Placed" },
  { key: "PAID", label: "Payment Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

function getStepIndex(status: string): number {
  switch (status) {
    case "PENDING": return 0;
    case "PAID": return 1;
    case "PROCESSING": return 2;
    case "SHIPPED": return 3;
    case "DELIVERED": return 4;
    default: return 0;
  }
}

function maskAddress(order: {
  shippingName: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
}) {
  if (!order.shippingName) return null;
  const parts = order.shippingName.trim().split(" ");
  const firstName = parts[0] ?? "";
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + "." : "";
  const location = [order.shippingCity, order.shippingCountry]
    .filter(Boolean)
    .join(", ");
  return `${firstName} ${lastInitial}${location ? ` · ${location}` : ""}`;
}

export default async function OrderTrackingPage({
  params,
}: {
  params: { orderId: string };
}) {
  let order;
  try {
    order = await prisma.shopOrder.findUnique({
      where: { id: params.orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, category: true } },
          },
        },
        customer: { select: { name: true, email: true } },
      },
    });
  } catch {
    notFound();
  }

  if (!order) notFound();

  const currentStep = getStepIndex(order.status);
  const maskedAddress = maskAddress(order);
  const orderDate = new Date(order.createdAt);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const isError = order.status === "ERROR";

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-cream-200">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <Camera className="h-7 w-7 text-brand-700" />
          <span className="font-display text-xl text-navy-900 tracking-tight">Pixelvo</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Title */}
        <div>
          <h1 className="font-display text-3xl text-navy-900 mb-1">Order tracking</h1>
          <p className="text-navy-500 text-sm">
            Order <span className="font-mono font-semibold text-navy-700">#{order.id.slice(-8).toUpperCase()}</span>
            {" · "}Placed {formatDate(orderDate)} at {formatTime(orderDate)}
          </p>
        </div>

        {/* Cancelled / Error state */}
        {(isCancelled || isError) && (
          <div className={`rounded-2xl border px-5 py-4 ${isCancelled ? "bg-cream-100 border-cream-300 text-navy-600" : "bg-coral-50 border-coral-200 text-coral-700"}`}>
            <p className="font-semibold">
              {isCancelled ? "This order has been cancelled." : "There was an issue with this order."}
            </p>
            <p className="text-sm mt-1">
              {isCancelled
                ? "If you were charged, a refund will appear within 3–5 business days."
                : "Our team has been notified. Please contact support if you need assistance."}
            </p>
          </div>
        )}

        {/* Status Timeline */}
        {!isCancelled && !isError && (
          <div className="card p-6">
            <h2 className="font-display text-lg text-navy-900 mb-6">Status</h2>
            <ol className="relative">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isCurrent = idx === currentStep;
                const isPending = idx > currentStep;

                return (
                  <li key={step.key} className={`relative flex gap-4 ${idx < STATUS_STEPS.length - 1 ? "pb-7" : ""}`}>
                    {/* Vertical line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute left-[15px] top-8 w-0.5 h-full -translate-x-1/2 ${isCompleted ? "bg-green-400" : "bg-cream-300"}`}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      {isCompleted ? (
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : isCurrent ? (
                        <div className="h-8 w-8 rounded-full bg-brand-700 flex items-center justify-center ring-4 ring-brand-100">
                          {idx === 3 ? (
                            <Truck className="h-4 w-4 text-white" />
                          ) : idx === 4 ? (
                            <Package className="h-4 w-4 text-white" />
                          ) : (
                            <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                          )}
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-cream-300 bg-white flex items-center justify-center">
                          <Circle className="h-3 w-3 text-cream-400" />
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="pt-1 pb-1">
                      <p
                        className={`font-semibold text-sm ${
                          isCompleted
                            ? "text-green-700"
                            : isCurrent
                            ? "text-brand-700"
                            : "text-navy-300"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCompleted && idx === 0 && (
                        <p className="text-xs text-navy-400 mt-0.5">
                          {formatDate(orderDate)} at {formatTime(orderDate)}
                        </p>
                      )}
                      {isCurrent && idx === 2 && (
                        <p className="text-xs text-navy-500 mt-0.5">Your items are being prepared</p>
                      )}
                      {isCurrent && idx === 3 && order.trackingNumber && (
                        <p className="text-xs text-navy-500 mt-0.5">
                          Tracking: <span className="font-mono font-semibold">{order.trackingNumber}</span>
                        </p>
                      )}
                      {isPending && idx === 3 && (
                        <p className="text-xs text-navy-300 mt-0.5">Tracking will appear here</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Tracking info (if shipped) */}
        {(order.status === "SHIPPED" || order.status === "DELIVERED") &&
          order.trackingNumber && (
            <div className="card p-6">
              <h2 className="font-display text-lg text-navy-900 mb-4">Tracking</h2>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-navy-400 uppercase tracking-wider font-semibold mb-1">Tracking number</p>
                  <p className="font-mono font-semibold text-navy-900">{order.trackingNumber}</p>
                </div>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
                  >
                    <Truck className="h-4 w-4" />
                    Track Package
                  </a>
                )}
              </div>
            </div>
          )}

        {/* Order Summary */}
        <div className="card p-6">
          <h2 className="font-display text-lg text-navy-900 mb-4">Order summary</h2>
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-navy-700">
                  <span>{item.product.name}</span>
                  {item.size && (
                    <span className="text-navy-400 text-xs">({item.size})</span>
                  )}
                  <span className="text-navy-400">×{item.quantity}</span>
                </div>
                <span className="font-medium text-navy-700">€{item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-cream-200 pt-3 space-y-1">
            {order.shippingCost > 0 && (
              <div className="flex justify-between text-sm text-navy-500">
                <span>Shipping</span>
                <span>€{order.shippingCost.toFixed(2)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span>−€{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-navy-900 pt-1">
              <span>Total</span>
              <span>€{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address (masked) */}
        {maskedAddress && (
          <div className="card p-6">
            <h2 className="font-display text-lg text-navy-900 mb-2">Shipping to</h2>
            <p className="text-sm text-navy-600">{maskedAddress}</p>
            {order.shippingMethod && (
              <p className="text-xs text-navy-400 mt-1">
                {order.shippingMethod === "EXPRESS" ? "Express shipping" : "Standard shipping"}
              </p>
            )}
          </div>
        )}

        {/* Support footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-sm text-navy-400">
            Need help?{" "}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@pixelvo.com"}?subject=Order%20${order.id.slice(-8)}`}
              className="text-brand-700 hover:underline font-medium"
            >
              Contact support
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

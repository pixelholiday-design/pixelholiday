import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({ params, searchParams }: { params: { id: string }; searchParams: { paid?: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!invoice) return notFound();

  // Mark as viewed if not already
  if (!invoice.viewedAt) {
    await prisma.invoice.update({ where: { id: invoice.id }, data: { viewedAt: new Date() } }).catch(() => {});
  }

  const isPaid = invoice.status === "PAID" || searchParams.paid === "true";

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    SENT: "bg-blue-100 text-blue-700",
    VIEWED: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-lift">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-navy-900">Invoice</h1>
              <p className="text-sm text-navy-500 mt-1">#{invoice.invoiceNumber}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[isPaid ? "PAID" : invoice.status]}`}>
              {isPaid ? "PAID" : invoice.status}
            </span>
          </div>

          {/* Client Info */}
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">Bill To</p>
              <p className="font-semibold text-navy-900">{invoice.clientName}</p>
              <p className="text-sm text-navy-500">{invoice.clientEmail}</p>
              {invoice.clientAddress && <p className="text-sm text-navy-500">{invoice.clientAddress}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">Due Date</p>
              <p className="font-semibold text-navy-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-cream-200 text-xs text-navy-400 uppercase tracking-wider">
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-cream-100">
                  <td className="py-3 text-sm text-navy-700">{item.description}</td>
                  <td className="py-3 text-sm text-navy-600 text-center">{item.quantity}</td>
                  <td className="py-3 text-sm text-navy-600 text-right">{item.unitPrice.toFixed(2)} {invoice.currency}</td>
                  <td className="py-3 text-sm font-semibold text-navy-900 text-right">{item.total.toFixed(2)} {invoice.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-2 text-right mb-8">
            <div className="flex justify-end gap-8 text-sm">
              <span className="text-navy-500">Subtotal</span>
              <span className="text-navy-700 w-24">{invoice.subtotal.toFixed(2)} {invoice.currency}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-end gap-8 text-sm">
                <span className="text-navy-500">Tax ({(invoice.taxRate * 100).toFixed(0)}%)</span>
                <span className="text-navy-700 w-24">{invoice.taxAmount.toFixed(2)} {invoice.currency}</span>
              </div>
            )}
            <div className="flex justify-end gap-8 text-lg font-bold border-t border-cream-200 pt-2">
              <span className="text-navy-700">Total</span>
              <span className="text-navy-900 w-24">{invoice.total.toFixed(2)} {invoice.currency}</span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6 p-4 rounded-xl bg-cream-50">
              <p className="text-xs text-navy-400 uppercase mb-1">Notes</p>
              <p className="text-sm text-navy-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Pay Now */}
          {!isPaid && invoice.stripePaymentLink && (
            <a
              href={invoice.stripePaymentLink}
              className="block w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3.5 text-center text-sm font-semibold text-white shadow-lift hover:brightness-105 active:scale-[0.98]"
            >
              Pay Now — {invoice.total.toFixed(2)} {invoice.currency}
            </a>
          )}

          {isPaid && (
            <div className="text-center py-4">
              <p className="text-green-600 font-semibold">Payment received. Thank you!</p>
            </div>
          )}

          <p className="text-center text-xs text-navy-300 mt-8">Powered by Fotiqo</p>
        </div>
      </div>
    </div>
  );
}

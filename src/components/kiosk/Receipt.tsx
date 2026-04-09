"use client";
import { Camera, Printer } from "lucide-react";

export type ReceiptData = {
  date: string;
  location: string;
  photographer: string;
  customer: string;
  items: { label: string; qty: number; price: number }[];
  total: number;
  paymentMethod: string;
  receiptCode: string;
  galleryUrl: string;
};

export default function Receipt({ data }: { data: ReceiptData }) {
  function print() {
    window.print();
  }

  return (
    <div className="max-w-sm mx-auto bg-white text-navy-900 rounded-2xl shadow-lift p-8 print:shadow-none print:rounded-none">
      <div className="text-center mb-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/15 text-coral-600 mb-2">
          <Camera className="h-5 w-5" />
        </div>
        <div className="font-display text-2xl">Fotiqo</div>
        <div className="text-xs text-navy-400">{data.location}</div>
      </div>

      <div className="border-t border-dashed border-cream-300 pt-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-navy-400">Date</span>
          <span>{data.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-navy-400">Photographer</span>
          <span>{data.photographer}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-navy-400">Customer</span>
          <span>{data.customer}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-cream-300 mt-4 pt-4">
        <table className="w-full text-sm">
          <tbody>
            {data.items.map((it, i) => (
              <tr key={i}>
                <td className="py-1">{it.label}</td>
                <td className="py-1 text-right text-navy-400">×{it.qty}</td>
                <td className="py-1 text-right">€{(it.price * it.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-dashed border-cream-300 mt-4 pt-4 flex items-center justify-between">
        <div className="text-navy-400 text-xs uppercase tracking-wider">Total</div>
        <div className="font-display text-3xl">€{data.total.toFixed(2)}</div>
      </div>
      <div className="text-xs text-navy-400 text-right">{data.paymentMethod}</div>

      <div className="mt-6 text-center">
        <div className="text-xs text-navy-400 uppercase tracking-widest mb-2">Download code</div>
        <div className="font-mono text-lg tracking-widest font-semibold">{data.receiptCode.slice(0, 12).toUpperCase()}</div>
        {data.galleryUrl && (
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(data.galleryUrl)}`}
            alt="QR"
            className="mx-auto mt-3"
          />
        )}
        <a href={data.galleryUrl} className="text-[10px] text-navy-400 break-all block mt-2">
          {data.galleryUrl}
        </a>
      </div>

      <div className="text-center text-[10px] text-navy-400 mt-6">
        Thank you for choosing Fotiqo ✨
      </div>

      <button onClick={print} className="btn-primary w-full mt-6 print:hidden">
        <Printer className="h-4 w-4" /> Print receipt
      </button>
    </div>
  );
}

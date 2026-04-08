'use client';

export interface ReceiptOrder {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: string;
  date: Date;
}

interface Props {
  order: ReceiptOrder;
}

export default function Receipt({ order }: Props) {
  const dash = '------------------------------';
  return (
    <div className="bg-white text-black font-mono text-xs p-6 w-[300px] mx-auto rounded-lg">
      <div className="text-center mb-3">
        <div className="font-bold text-lg tracking-widest">PIXELHOLIDAY</div>
        <div>Resort Photography</div>
        <div className="text-[10px] mt-1">www.pixelholiday.com</div>
      </div>
      <div>{dash}</div>
      <div className="my-2 flex justify-between">
        <span>Receipt #{order.id.slice(-6).toUpperCase()}</span>
        <span>{order.date.toLocaleDateString()}</span>
      </div>
      <div className="text-[10px]">{order.date.toLocaleTimeString()}</div>
      <div>{dash}</div>
      <div className="my-2 space-y-1">
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between">
            <span>{it.quantity}× {it.name}</span>
            <span>€{(it.price * it.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div>{dash}</div>
      <div className="flex justify-between font-bold text-base my-2">
        <span>TOTAL</span>
        <span>€{order.total.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Paid via</span>
        <span className="uppercase">{order.paymentMethod}</span>
      </div>
      <div>{dash}</div>
      <div className="flex justify-center my-3">
        <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" fill="white" />
          {Array.from({ length: 64 }).map((_, i) => {
            const x = (i % 8) * 10;
            const y = Math.floor(i / 8) * 10;
            const fill = (i * 7 + 3) % 3 === 0;
            return fill ? <rect key={i} x={x} y={y} width="10" height="10" fill="black" /> : null;
          })}
        </svg>
      </div>
      <div className="text-center text-[10px]">Scan to download photos</div>
      <div>{dash}</div>
      <div className="text-center mt-2 text-[10px]">
        Thank you for your visit!<br />
        Share your memories #PixelHoliday
      </div>
    </div>
  );
}

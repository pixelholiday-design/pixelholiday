'use client';

import { useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export interface IncomingOrder {
  id: string;
  customer: string;
  itemCount: number;
  total: number;
}

interface Props {
  order: IncomingOrder;
  onView: () => void;
  onDismiss: () => void;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export default function OrderNotification({ order, onView, onDismiss }: Props) {
  useEffect(() => {
    playBeep();
    const t = setTimeout(onDismiss, 10000);
    return () => clearTimeout(t);
  }, [order.id, onDismiss]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 anim-slide-down">
      <div className="bg-coral-500 text-white rounded-2xl shadow-2xl p-5 min-w-[420px] flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center anim-pulse-ring">
          <Bell className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lg">New Order</p>
          <p className="text-white/90 text-sm">
            {order.customer} · {order.itemCount} items · €{order.total.toFixed(2)}
          </p>
        </div>
        <button
          onClick={onView}
          className="press bg-white text-coral-500 px-4 py-2 rounded-lg font-semibold"
        >
          View
        </button>
        <button onClick={onDismiss} className="press p-2"><X /></button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Download, Image as ImageIcon, Frame, Plus, Minus, ShoppingCart } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  icon: 'digital' | 'print-small' | 'print-large' | 'canvas';
}

export const PRODUCTS: Product[] = [
  { id: 'digital',     name: 'Digital Download', price: 5,  icon: 'digital' },
  { id: 'print-4x6',   name: 'Print 4×6',        price: 3,  icon: 'print-small' },
  { id: 'print-8x10',  name: 'Print 8×10',       price: 10, icon: 'print-large' },
  { id: 'canvas',      name: 'Canvas 12×16',     price: 45, icon: 'canvas' },
];

const ICONS = {
  digital:     Download,
  'print-small': ImageIcon,
  'print-large': ImageIcon,
  canvas:      Frame,
};

interface Props {
  onAddToCart: (items: { product: Product; quantity: number }[]) => void;
}

export default function ProductPicker({ onAddToCart }: Props) {
  const [qty, setQty] = useState<Record<string, number>>({});

  const change = (id: string, delta: number) => {
    setQty((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  };

  const total = PRODUCTS.reduce((s, p) => s + (qty[p.id] || 0) * p.price, 0);

  const handleAdd = () => {
    const items = PRODUCTS.filter((p) => qty[p.id] > 0).map((product) => ({
      product,
      quantity: qty[product.id],
    }));
    if (items.length > 0) {
      onAddToCart(items);
      setQty({});
    }
  };

  return (
    <div className="bg-[#1A1F2E] border border-[#2A3042] rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-3xl mb-2">Choose your format</h3>

      <div className="grid grid-cols-2 gap-4">
        {PRODUCTS.map((p) => {
          const Icon = ICONS[p.icon];
          const count = qty[p.id] || 0;
          return (
            <div
              key={p.id}
              className={`p-5 rounded-xl border-2 transition-all ${
                count > 0 ? 'border-coral-500 bg-coral-500/10' : 'border-[#2A3042] bg-navy-900'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-navy-800 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gold-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{p.name}</p>
                  <p className="text-2xl font-bold text-gold-500">€{p.price}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => change(p.id, -1)}
                  className="press touch-target rounded-lg bg-navy-800 border border-[#2A3042] flex items-center justify-center"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">{count}</span>
                <button
                  onClick={() => change(p.id, 1)}
                  className="press touch-target rounded-lg bg-coral-500 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleAdd}
        disabled={total === 0}
        className="press w-full mt-4 bg-coral-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xl font-semibold py-5 rounded-xl flex items-center justify-center gap-3"
      >
        <ShoppingCart className="w-6 h-6" />
        Add to Cart {total > 0 && `· €${total}`}
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Check, Delete } from 'lucide-react';

interface Props {
  amountDue: number;
  onConfirm: (received: number, change: number) => void;
}

export default function CashCalculator({ amountDue, onConfirm }: Props) {
  const [received, setReceived] = useState('');
  const numeric = parseFloat(received || '0');
  const change = numeric - amountDue;
  const valid = numeric >= amountDue;

  const press = (k: string) => {
    if (k === '⌫') return setReceived((v) => v.slice(0, -1));
    if (k === '.' && received.includes('.')) return;
    if (received.length >= 7) return;
    setReceived((v) => v + k);
  };

  const quick = [5, 10, 20, 50];
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

  return (
    <div className="bg-[#1A1F2E] border border-[#2A3042] rounded-2xl p-6 space-y-4">
      <div>
        <p className="text-slate-400 text-sm uppercase tracking-wider">Amount Due</p>
        <p className="font-display text-5xl text-gold-500">€{amountDue.toFixed(2)}</p>
      </div>

      <div>
        <p className="text-slate-400 text-sm uppercase tracking-wider">Received</p>
        <p className="font-display text-4xl text-white">€{numeric.toFixed(2)}</p>
      </div>

      <div className="bg-navy-900 rounded-xl p-4 border border-[#2A3042]">
        <p className="text-slate-400 text-sm uppercase tracking-wider">Change</p>
        <p className={`font-display text-5xl font-bold ${valid ? 'text-green-400' : 'text-slate-600'}`}>
          €{(change >= 0 ? change : 0).toFixed(2)}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => setReceived(String(q))}
            className="press py-3 rounded-lg bg-navy-800 border border-[#2A3042] font-semibold"
          >
            €{q}
          </button>
        ))}
        <button
          onClick={() => setReceived(String(amountDue))}
          className="press py-3 rounded-lg bg-gold-500 text-navy-900 font-semibold"
        >
          Exact
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="press py-4 rounded-lg bg-navy-800 border border-[#2A3042] text-2xl font-semibold flex items-center justify-center"
          >
            {k === '⌫' ? <Delete className="w-6 h-6" /> : k}
          </button>
        ))}
      </div>

      <button
        onClick={() => valid && onConfirm(numeric, change)}
        disabled={!valid}
        className="press w-full bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xl font-semibold py-5 rounded-xl flex items-center justify-center gap-3"
      >
        <Check className="w-6 h-6" />
        Confirm Payment
      </button>
    </div>
  );
}

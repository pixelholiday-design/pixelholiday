'use client';

import { useState } from 'react';
import { Delete } from 'lucide-react';

interface Props {
  onComplete: (pin: string) => void;
  length?: number;
  shake?: boolean;
}

export default function PinPad({ onComplete, length = 4, shake = false }: Props) {
  const [pin, setPin] = useState('');

  const press = (k: string) => {
    if (k === 'C') {
      setPin('');
      return;
    }
    setPin((prev) => {
      if (prev.length >= length) return prev;
      const next = prev + k;
      if (next.length === length) {
        setTimeout(() => {
          onComplete(next);
          setPin('');
        }, 150);
      }
      return next;
    });
  };

  const keys = ['1','2','3','4','5','6','7','8','9','C','0','⌫'];

  return (
    <div className={`flex flex-col items-center gap-8 ${shake ? 'anim-shake' : ''}`}>
      <div className="flex gap-4">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all ${
              pin.length > i ? 'bg-coral-500 border-coral-500 scale-110' : 'border-slate-500'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => {
              if (k === '⌫') setPin(pin.slice(0, -1));
              else press(k);
            }}
            className="press w-[80px] h-[60px] rounded-xl bg-[#1A1F2E] border border-[#2A3042] text-2xl font-semibold text-white active:bg-coral-500 active:border-coral-500 flex items-center justify-center"
          >
            {k === '⌫' ? <Delete className="w-6 h-6" /> : k}
          </button>
        ))}
      </div>
    </div>
  );
}

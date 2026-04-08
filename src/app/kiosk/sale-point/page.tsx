'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Upload, Inbox, BarChart3, User, CreditCard, Banknote, Smartphone, Lock,
  Check, X, Loader2, Printer, ArrowLeft, Camera, TrendingUp,
} from 'lucide-react';
import PinPad from '@/components/kiosk/PinPad';
import CashCalculator from '@/components/kiosk/CashCalculator';
import OrderNotification, { type IncomingOrder } from '@/components/kiosk/OrderNotification';
import ConnectionStatus from '@/components/kiosk/ConnectionStatus';
import Receipt, { type ReceiptOrder } from '@/components/kiosk/Receipt';

const VALID_PIN = '1234';

type Tab = 'incoming' | 'upload' | 'sales' | 'stats';
type RightView = 'idle' | 'order' | 'pay-card' | 'pay-cash' | 'pay-qr' | 'success' | 'receipt';

interface MockOrder {
  id: string;
  customer: string;
  room: string;
  itemCount: number;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}

const MOCK_ORDERS: MockOrder[] = [
  { id: 'ord_001', customer: 'Mueller Family', room: '412', itemCount: 8, total: 49,
    items: [{ name: 'Digital Gallery', quantity: 1, price: 49 }] },
  { id: 'ord_002', customer: 'Tanaka',        room: '208', itemCount: 3, total: 24,
    items: [{ name: 'Digital Download', quantity: 3, price: 5 }, { name: 'Print 8×10', quantity: 1, price: 9 }] },
  { id: 'ord_003', customer: 'Dupont',        room: '116', itemCount: 12, total: 130,
    items: [{ name: 'Premium Album', quantity: 1, price: 130 }] },
];

const TODAY_SALES = [
  { time: '09:14', customer: 'Schmidt',   total: 49,  method: 'Card' },
  { time: '10:32', customer: 'Rossi',     total: 24,  method: 'Cash' },
  { time: '11:08', customer: 'Anderson',  total: 130, method: 'Card' },
  { time: '12:45', customer: 'Garcia',    total: 15,  method: 'QR'   },
  { time: '14:20', customer: 'Lefevre',   total: 79,  method: 'Card' },
];

function playBeep(freq = 660) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

function playChaChing() {
  playBeep(880);
  setTimeout(() => playBeep(1100), 120);
  setTimeout(() => playBeep(1320), 240);
}

export default function SalePointKioskPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const [tab, setTab] = useState<Tab>('incoming');
  const [selected, setSelected] = useState<MockOrder | null>(null);
  const [right, setRight] = useState<RightView>('idle');
  const [notif, setNotif] = useState<IncomingOrder | null>(null);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [completedOrder, setCompletedOrder] = useState<ReceiptOrder | null>(null);

  const handlePin = (pin: string) => {
    if (pin === VALID_PIN) {
      setUnlocked(true);
      playBeep(880);
    } else {
      setShake(true);
      playBeep(220);
      setTimeout(() => setShake(false), 500);
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 3) {
        setLocked(true);
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, 5000);
      }
    }
  };

  const completeSale = useCallback((method: string) => {
    if (!selected) return;
    playChaChing();
    setCompletedOrder({
      id: selected.id,
      items: selected.items,
      total: selected.total,
      paymentMethod: method,
      date: new Date(),
    });
    setOrders((o) => o.filter((x) => x.id !== selected.id));
    setRight('success');
    setTimeout(() => setRight('receipt'), 1500);
  }, [selected]);

  // Mock incoming order every 45s
  useEffect(() => {
    if (!unlocked) return;
    const t = setInterval(() => {
      setNotif({
        id: `ord_${Date.now()}`,
        customer: 'New Guest',
        itemCount: Math.floor(Math.random() * 10) + 1,
        total: Math.floor(Math.random() * 100) + 10,
      });
    }, 45000);
    return () => clearInterval(t);
  }, [unlocked]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!unlocked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') setTab('incoming');
      if (e.key === 'u' || e.key === 'U') setTab('upload');
      if (e.key === 'p' || e.key === 'P') setRight('receipt');
      if (e.key === 'Escape') {
        setRight('idle');
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlocked]);

  if (!unlocked) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-navy-800">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-coral-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-coral-500" />
          </div>
          <h1 className="font-display text-4xl mb-2">Staff Login</h1>
          <p className="text-slate-400 mb-8">
            {locked ? 'Locked — try again in a moment' : 'Enter your 4-digit PIN'}
          </p>
          {!locked && <PinPad onComplete={handlePin} shake={shake} />}
          {attempts > 0 && !locked && (
            <p className="text-coral-500 mt-4">{3 - attempts} attempt{3 - attempts === 1 ? '' : 's'} remaining</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-navy-800 flex flex-col">
      {/* Top status bar */}
      <div className="h-16 bg-[#1A1F2E] border-b border-[#2A3042] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="font-display text-xl text-gold-500 tracking-wider">PIXELHOLIDAY · POS</div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Hilton Monastir</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">
            Today: <span className="text-white font-semibold">€{TODAY_SALES.reduce((s, x) => s + x.total, 0)}</span>
          </div>
          <ConnectionStatus />
          <button
            onClick={() => setUnlocked(false)}
            className="press flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A3042]"
          >
            <User className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT 70% */}
        <div className="w-[70%] flex flex-col border-r border-[#2A3042]">
          <div className="flex bg-[#1A1F2E] border-b border-[#2A3042]">
            {([
              { id: 'incoming', label: 'Incoming Orders', Icon: Inbox },
              { id: 'upload',   label: 'Upload',          Icon: Upload },
              { id: 'sales',    label: "Today's Sales",   Icon: BarChart3 },
              { id: 'stats',    label: 'My Stats',        Icon: TrendingUp },
            ] as const).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all ${
                  tab === id ? 'text-coral-500 border-b-2 border-coral-500' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {tab === 'incoming' && (
              <div className="space-y-3">
                {orders.length === 0 && (
                  <div className="text-center text-slate-500 py-20">
                    <Inbox className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No pending orders</p>
                  </div>
                )}
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { setSelected(o); setRight('order'); }}
                    className={`press w-full text-left bg-[#1A1F2E] border rounded-xl p-5 flex items-center justify-between hover:border-coral-500 ${
                      selected?.id === o.id ? 'border-coral-500' : 'border-[#2A3042]'
                    }`}
                  >
                    <div>
                      <p className="text-xl font-semibold">{o.customer}</p>
                      <p className="text-slate-400">Room {o.room} · {o.itemCount} items</p>
                    </div>
                    <p className="text-3xl font-bold text-gold-500">€{o.total}</p>
                  </button>
                ))}
              </div>
            )}

            {tab === 'upload' && (
              <div className="bg-[#1A1F2E] border-2 border-dashed border-[#2A3042] rounded-2xl p-16 text-center">
                <Camera className="w-20 h-20 mx-auto text-coral-500 mb-4" />
                <h3 className="font-display text-3xl mb-2">Upload Photos</h3>
                <p className="text-slate-400 mb-6">Drag and drop files or tap to browse</p>
                <button className="press bg-coral-500 px-8 py-4 rounded-xl font-semibold text-lg">
                  Select Files
                </button>
              </div>
            )}

            {tab === 'sales' && (
              <div className="space-y-2">
                {TODAY_SALES.map((s, i) => (
                  <div key={i} className="bg-[#1A1F2E] border border-[#2A3042] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-mono">{s.time}</span>
                      <span className="text-white font-semibold">{s.customer}</span>
                      <span className="text-slate-500 text-sm bg-[#2A3042] px-2 py-1 rounded">{s.method}</span>
                    </div>
                    <span className="text-xl font-bold text-gold-500">€{s.total}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'stats' && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Sales Today', value: '€297', sub: '5 orders' },
                  { label: 'Conversion',  value: '68%',  sub: 'Above target' },
                  { label: 'Avg Order',   value: '€59',  sub: '+12% vs last week' },
                  { label: 'Commission',  value: '€29',  sub: 'Earned today' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#1A1F2E] border border-[#2A3042] rounded-xl p-6">
                    <p className="text-slate-400 text-sm uppercase tracking-wider">{s.label}</p>
                    <p className="font-display text-4xl text-gold-500 my-2">{s.value}</p>
                    <p className="text-slate-500 text-sm">{s.sub}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 30% */}
        <div className="w-[30%] bg-[#1A1F2E] flex flex-col overflow-hidden">
          {right === 'idle' && (
            <div className="flex-1 p-6 flex flex-col">
              <h3 className="font-display text-2xl mb-4">Today&apos;s Summary</h3>
              <div className="space-y-3">
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="font-display text-4xl text-gold-500">€{TODAY_SALES.reduce((s, x) => s + x.total, 0)}</p>
                </div>
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Sales</p>
                  <p className="font-display text-4xl">{TODAY_SALES.length}</p>
                </div>
                <div className="bg-navy-900 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Pending</p>
                  <p className="font-display text-4xl">{orders.length}</p>
                </div>
              </div>
              <div className="mt-auto text-xs text-slate-500 space-y-1">
                <p>Shortcuts: <span className="text-slate-300">S</span> Sales · <span className="text-slate-300">U</span> Upload</p>
                <p><span className="text-slate-300">P</span> Print · <span className="text-slate-300">ESC</span> Back</p>
              </div>
            </div>
          )}

          {right === 'order' && selected && (
            <div className="flex-1 flex flex-col p-6 anim-slide-right">
              <button onClick={() => { setRight('idle'); setSelected(null); }} className="press flex items-center gap-2 mb-4 text-slate-400">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h3 className="font-display text-2xl">{selected.customer}</h3>
              <p className="text-slate-400 mb-4">Room {selected.room}</p>

              <div className="space-y-2 mb-6">
                {selected.items.map((it, i) => (
                  <div key={i} className="bg-navy-900 rounded-lg p-3 flex justify-between">
                    <span>{it.quantity}× {it.name}</span>
                    <span className="font-semibold">€{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="bg-navy-900 rounded-xl p-4 mb-6">
                <p className="text-slate-400 text-sm">Total Due</p>
                <p className="font-display text-4xl text-gold-500">€{selected.total}</p>
              </div>

              <div className="space-y-2 mt-auto">
                <button onClick={() => setRight('pay-card')} className="press w-full bg-coral-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" /> Card
                </button>
                <button onClick={() => setRight('pay-cash')} className="press w-full bg-green-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Banknote className="w-5 h-5" /> Cash
                </button>
                <button onClick={() => setRight('pay-qr')} className="press w-full bg-[#2A3042] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Smartphone className="w-5 h-5" /> QR Pay
                </button>
              </div>
            </div>
          )}

          {right === 'pay-card' && selected && (
            <PayCard total={selected.total} onSuccess={() => completeSale('Card')} onBack={() => setRight('order')} />
          )}

          {right === 'pay-cash' && selected && (
            <div className="flex-1 overflow-y-auto p-4 anim-slide-right">
              <button onClick={() => setRight('order')} className="press flex items-center gap-2 mb-4 text-slate-400">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <CashCalculator amountDue={selected.total} onConfirm={() => completeSale('Cash')} />
            </div>
          )}

          {right === 'pay-qr' && selected && (
            <div className="flex-1 p-6 anim-slide-right text-center">
              <button onClick={() => setRight('order')} className="press flex items-center gap-2 mb-4 text-slate-400">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <p className="text-slate-400 mb-2">Scan to pay</p>
              <p className="font-display text-3xl text-gold-500 mb-4">€{selected.total}</p>
              <div className="bg-white p-4 rounded-2xl mx-auto inline-block">
                <svg width="200" height="200" viewBox="0 0 80 80">
                  <rect width="80" height="80" fill="white" />
                  {Array.from({ length: 64 }).map((_, i) => {
                    const x = (i % 8) * 10;
                    const y = Math.floor(i / 8) * 10;
                    const fill = (i * 11 + 7) % 3 === 0;
                    return fill ? <rect key={i} x={x} y={y} width="10" height="10" fill="black" /> : null;
                  })}
                </svg>
              </div>
              <button onClick={() => completeSale('QR')} className="press w-full mt-6 bg-green-500 py-4 rounded-xl font-semibold">
                Mark as Paid
              </button>
            </div>
          )}

          {right === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center anim-fade-up">
              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-4 anim-pulse-ring">
                <Check className="w-12 h-12 text-white" />
              </div>
              <p className="font-display text-3xl">Payment Complete</p>
            </div>
          )}

          {right === 'receipt' && completedOrder && (
            <div className="flex-1 overflow-y-auto p-4 anim-fade-up">
              <Receipt order={completedOrder} />
              <div className="space-y-2 mt-4">
                <button className="press w-full bg-coral-500 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Printer className="w-5 h-5" /> Print Receipt
                </button>
                <button
                  onClick={() => { setRight('idle'); setSelected(null); setCompletedOrder(null); }}
                  className="press w-full bg-[#2A3042] py-4 rounded-xl font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {notif && (
        <OrderNotification
          order={notif}
          onView={() => setNotif(null)}
          onDismiss={() => setNotif(null)}
        />
      )}
    </div>
  );
}

function PayCard({ total, onSuccess, onBack }: { total: number; onSuccess: () => void; onBack: () => void }) {
  const [stage, setStage] = useState<'waiting' | 'processing' | 'done'>('waiting');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('processing'), 1500);
    const t2 = setTimeout(() => setStage('done'), 3000);
    const t3 = setTimeout(onSuccess, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onSuccess]);

  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center anim-slide-right">
      <button onClick={onBack} className="press absolute top-4 left-4 flex items-center gap-2 text-slate-400">
        <X className="w-5 h-5" />
      </button>
      <CreditCard className="w-20 h-20 text-coral-500 mb-4" />
      <p className="font-display text-2xl mb-2">€{total.toFixed(2)}</p>
      {stage === 'waiting' && <p className="text-slate-400">Insert or tap card...</p>}
      {stage === 'processing' && (
        <p className="text-yellow-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 anim-spin-slow" /> Processing...
        </p>
      )}
      {stage === 'done' && <p className="text-green-400">Approved</p>}
    </div>
  );
}

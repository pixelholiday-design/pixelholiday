'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2, X } from 'lucide-react';

type Status = 'connected' | 'connecting' | 'offline';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<Status>('connected');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOnline = () => setStatus('connected');
    const onOffline = () => setStatus('offline');
    if (typeof navigator !== 'undefined') {
      setStatus(navigator.onLine ? 'connected' : 'offline');
    }
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const config: Record<Status, { label: string; cls: string; Icon: typeof Wifi }> = {
    connected:  { label: 'Online',     cls: 'bg-green-500/20 text-green-400 border-green-500/40', Icon: Wifi },
    connecting: { label: 'Connecting', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', Icon: Loader2 },
    offline:    { label: 'Offline',    cls: 'bg-red-500/20 text-red-400 border-red-500/40', Icon: WifiOff },
  };
  const { label, cls, Icon } = config[status];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`press flex items-center gap-2 px-4 py-2 rounded-full border ${cls} text-sm font-semibold`}
      >
        <Icon className={`w-4 h-4 ${status === 'connecting' ? 'anim-spin-slow' : ''}`} />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 anim-fade-up"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#1A1F2E] border border-[#2A3042] rounded-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-2xl">Connection Status</h3>
              <button onClick={() => setOpen(false)} className="press p-2"><X /></button>
            </div>
            <div className="space-y-3 text-slate-300">
              <p>Status: <span className="font-semibold text-white">{label}</span></p>
              <p>Local Network: <span className="text-green-400">Active</span></p>
              <p>Last Sync: <span className="text-white">2 min ago</span></p>
              <p className="text-sm text-slate-400 pt-2">
                Kiosk operates offline-first. Sales are queued and synced when connection is stable.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

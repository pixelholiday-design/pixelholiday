import type { ReactNode } from 'react';
import '@/styles/kiosk.css';

export const metadata = {
  title: 'Fotiqo Kiosk',
  manifest: '/manifest-gallery-kiosk.json',
  themeColor: '#0f172a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fotiqo Kiosk',
  },
};

export default function KioskLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-navy-900 text-white font-sans"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Inject html.kiosk class + register service worker + start sync */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
document.documentElement.classList.add('kiosk');

// Register kiosk service worker for offline caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-kiosk.js', { scope: '/kiosk/' })
    .then(function(reg) { console.log('[Kiosk SW] registered, scope:', reg.scope); })
    .catch(function(err) { console.warn('[Kiosk SW] registration failed:', err); });
}

// Background sync: push queued mutations to cloud every 60s when online
(function startAutoSync() {
  var SYNC_INTERVAL = 60000;
  function runSync() {
    if (!navigator.onLine) return;
    fetch('/api/local/sync', { method: 'POST' }).catch(function() {});
  }
  setInterval(runSync, SYNC_INTERVAL);
  // Also sync when coming back online
  window.addEventListener('online', function() {
    console.log('[Kiosk] Back online — syncing...');
    setTimeout(runSync, 2000);
  });
  // Initial sync on load
  setTimeout(runSync, 5000);
})();
`,
        }}
      />
      {children}
    </div>
  );
}

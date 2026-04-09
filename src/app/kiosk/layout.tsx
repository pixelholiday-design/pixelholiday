import type { ReactNode } from 'react';
import '@/styles/kiosk.css';

export const metadata = {
  title: 'Pixelvo Kiosk',
};

export default function KioskLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-navy-900 text-white font-sans"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Inject html.kiosk class for global styling */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('kiosk');`,
        }}
      />
      {children}
    </div>
  );
}

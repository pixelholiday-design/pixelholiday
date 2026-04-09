import Link from "next/link";
import {
  Smartphone,
  Monitor,
  Camera,
  Tv,
  Tablet,
  Download,
  Wifi,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-static";
export const metadata = {
  title: "Fotiqo — Install apps",
  description:
    "Install the Fotiqo kiosk, gallery, photographer, camera station, and TV display apps on any device.",
};

type AppEntry = {
  slug: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  device: string;
  url: string;
  steps: string[];
  requirements: string[];
  theme: string;
};

const APPS: AppEntry[] = [
  {
    slug: "sale-point",
    title: "Sale Kiosk",
    tagline: "POS terminal for photographers to close sales.",
    icon: Tablet,
    device: "iPad / Android tablet",
    url: "/kiosk/sale-point",
    theme: "from-brand-700 to-brand-500",
    steps: [
      "Open /kiosk/sale-point in Safari or Chrome on the tablet.",
      "Use the browser's Share menu → Add to Home Screen.",
      "Launch from the home-screen icon — it opens full-screen.",
      "Enter your 4-digit staff PIN at the lock screen.",
    ],
    requirements: [
      "iPad / Android tablet with browser support for PWAs",
      "Local Wi-Fi to the sale-point server (works offline)",
      "Stripe Terminal reader (optional, for card payments)",
    ],
  },
  {
    slug: "gallery-kiosk",
    title: "Gallery Kiosk",
    tagline: "Self-serve customer identification and gallery viewer.",
    icon: Monitor,
    device: "Touch-screen display",
    url: "/kiosk/gallery",
    theme: "from-brand-500 to-brand-300",
    steps: [
      "On the display, open /kiosk/gallery in fullscreen kiosk mode.",
      "Pin the tab in Chrome (View → Always Show Toolbar → Pin).",
      "Toggle the browser into kiosk mode (F11 / Cmd-Shift-F).",
      "Customers can identify by QR, wristband, room, or selfie.",
    ],
    requirements: [
      "Any 1080p+ touch screen with Chrome or Edge",
      "Kiosk network to the gallery server",
      "Optional: selfie camera for face identification",
    ],
  },
  {
    slug: "photographer",
    title: "Photographer Phone",
    tagline: "Mobile uploader, scanner, and daily stats for photographers.",
    icon: Smartphone,
    device: "iPhone / Android phone",
    url: "/mobile-upload",
    theme: "from-coral-600 to-coral-400",
    steps: [
      "Sign in to the Fotiqo app on your phone.",
      "Open /mobile-upload and tap Share → Add to Home Screen.",
      "Grant camera permission the first time you shoot.",
      "Upload runs in the background, auto-resumes on reconnect.",
    ],
    requirements: [
      "iOS 15+ / Android 10+",
      "Camera permission",
      "Wi-Fi or 4G for uploads (works offline and syncs later)",
    ],
  },
  {
    slug: "camera-station",
    title: "Camera Station",
    tagline: "Tethered/auto capture for speed cameras and welcome archways.",
    icon: Camera,
    device: "Raspberry Pi / mini PC",
    url: "/admin/cameras",
    theme: "from-navy-700 to-navy-500",
    steps: [
      "Flash Raspberry Pi OS Lite, enable Wi-Fi + SSH.",
      "Clone the Fotiqo camera client (see /admin/cameras).",
      "Register the station by scanning its QR at /admin/cameras.",
      "Captures auto-upload to R2 and tag the active wristband.",
    ],
    requirements: [
      "Raspberry Pi 4 or any x86 mini PC",
      "USB or tethered DSLR (Nikon D7000 tested)",
      "Local network to the kiosk server",
    ],
  },
  {
    slug: "tv-display",
    title: "TV Display",
    tagline: "Ambient TV showing arriving customers and live galleries.",
    icon: Tv,
    device: "Smart TV / HDMI display",
    url: "/kiosk/tv-display",
    theme: "from-gold-500 to-gold-400",
    steps: [
      "Connect an HDMI display to a Chromebox or Fire TV.",
      "Open /kiosk/tv-display in the browser and pin it.",
      "Enable auto-rotation if the display is vertical.",
      "The screen auto-refreshes as new galleries come in.",
    ],
    requirements: [
      "Any TV or display with Chrome / Edge",
      "Chromebox / mini-PC / Fire TV (any PWA-capable browser)",
      "Network to the kiosk server",
    ],
  },
];

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-cream-100 text-navy-900">
      <nav className="bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/portfolio" className="font-display text-2xl tracking-tight">
          Fotiqo
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/dashboard" className="text-navy-700 hover:text-brand-700 px-3 py-2 transition">
            Admin
          </Link>
          <Link
            href="/login"
            className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-full font-semibold shadow-card transition"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <header className="bg-gradient-to-br from-brand-700 via-brand-500 to-brand-300 px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-brand-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold backdrop-blur">
          <Download className="h-3.5 w-3.5" />
          The Fotiqo app suite
        </div>
        <h1 className="text-white font-display text-4xl md:text-6xl mt-5 max-w-3xl mx-auto leading-tight">
          Install what you need, where you need it
        </h1>
        <p className="text-white/85 text-lg mt-4 max-w-2xl mx-auto">
          Five progressive web apps — one for every part of the shoot-to-sale pipeline.
          No app store, no downloads. Add to home screen and go.
        </p>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {APPS.map((app) => {
            const Icon = app.icon;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
              `https://fotiqo.app${app.url}`,
            )}`;
            return (
              <article
                key={app.slug}
                className="bg-white rounded-2xl ring-1 ring-cream-300 shadow-card overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${app.theme} p-6 flex items-start gap-4`}>
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-white">
                    <h2 className="font-display text-2xl leading-tight">{app.title}</h2>
                    <p className="text-white/85 text-sm mt-1">{app.tagline}</p>
                    <p className="text-xs text-white/70 mt-2 uppercase tracking-wider font-semibold">
                      For: {app.device}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-navy-900 font-semibold flex items-center gap-2 mb-2">
                      <Download className="h-4 w-4 text-brand-700" /> Install
                    </h3>
                    <ol className="space-y-1.5 text-sm text-navy-600 list-decimal list-inside">
                      {app.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>

                    <h3 className="text-navy-900 font-semibold flex items-center gap-2 mb-2 mt-5">
                      <ShieldCheck className="h-4 w-4 text-brand-700" /> Requirements
                    </h3>
                    <ul className="space-y-1 text-sm text-navy-600">
                      {app.requirements.map((r, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-brand-500">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="shrink-0 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt={`${app.title} install QR code`}
                      width={120}
                      height={120}
                      className="rounded-xl border border-cream-300 bg-white p-2"
                    />
                    <div className="text-[10px] text-navy-400 mt-2 uppercase tracking-wider">
                      Scan to open
                    </div>
                    <Link
                      href={app.url}
                      className="text-brand-700 hover:text-brand-500 text-xs font-semibold mt-1 block"
                    >
                      {app.url}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl ring-1 ring-cream-300 shadow-card p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center">
            <Wifi className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl text-navy-900">Need help installing?</h3>
            <p className="text-navy-500 text-sm mt-1">
              All five apps are progressive web apps (PWAs). They install from your
              browser, work offline where needed, and update automatically when a new
              version ships. Contact ops if a device won&apos;t install.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-navy-900 text-navy-300 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">Fotiqo</div>
          <div className="flex gap-6 text-sm">
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <Link href="/shop" className="hover:text-white transition">Shop</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
          <div className="text-xs text-navy-400">© {new Date().getFullYear()} Fotiqo</div>
        </div>
      </footer>
    </div>
  );
}

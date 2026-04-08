import { prisma } from "@/lib/db";
import {
  Camera, Upload, Sparkles, Wand2, Cloud, Monitor, ShoppingCart,
  CreditCard, Send, Printer, RefreshCw, Moon,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PhotoFlowPage() {
  const [photos, edited, orders, prints, syncPending, sleepingMoney] = await Promise.all([
    prisma.photo.count(),
    prisma.photo.count({ where: { isAutoEdited: true } }),
    prisma.order.count(),
    prisma.printJob.count(),
    prisma.syncLog.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { isAutomatedSale: true } }),
  ]);

  const editedPct = photos > 0 ? Math.round((edited / photos) * 100) : 0;

  const steps = [
    { icon: <Camera />, title: "Capture", body: "Photographer or speed cam (Nikon D7000) pushes via WiFi transmitter, SD card, or phone upload.", count: photos, label: "photos" },
    { icon: <Upload />, title: "Upload", body: "Direct R2 presigned upload + Cloudinary mirror — no Next.js round-trip.", count: photos, label: "frames" },
    { icon: <Sparkles />, title: "AI cull", body: "Heuristic + AI scoring drops misfires (eyes closed, blur, mid-blink).", count: photos - edited, label: "still queued" },
    { icon: <Wand2 />, title: "AI auto-edit", body: "Cloudinary chain: e_auto_color · e_auto_brightness · e_auto_contrast · e_improve · e_sharpen · smart-crop · (PREMIUM) e_beauty_retouch.", count: edited, label: "edited", accent: "green" },
    { icon: <Cloud />, title: "Store", body: "Original + edited URLs persisted; cloud R2 + local SSD.", count: photos, label: "stored" },
    { icon: <Monitor />, title: "Gallery kiosk", body: "Customer browses on TV/iPad. In LOCAL mode, photos served from sale-point over Wi-Fi.", count: 0, label: "" },
    { icon: <ShoppingCart />, title: "Customer selects", body: "Two paths: Pay Now (self-service QR) or Order at Counter (sent to sale-point).", count: orders, label: "orders" },
    { icon: <CreditCard />, title: "Payment", body: "POS terminal, cash + PIN, or Stripe online webhook.", count: orders, label: "completed" },
    { icon: <Send />, title: "Auto-deliver", body: "Digital → WhatsApp + email + gallery unlocked. Print → queued.", count: prints, label: "print jobs", accent: "coral" },
    { icon: <Printer />, title: "Print + receipt", body: "Print queue (local lab or 3rd-party) + receipt with download QR.", count: prints, label: "queued" },
    { icon: <RefreshCw />, title: "Cloud sync", body: "Night sync replays every local mutation to the cloud DB.", count: syncPending, label: "pending", accent: syncPending > 0 ? "coral" : "green" },
    { icon: <Moon />, title: "Sleeping money", body: "3-day abandoned cart + 7-day sweep-up → automated post-trip revenue.", count: sleepingMoney, label: "automated sales", accent: "gold" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Hardware</div>
        <h1 className="heading text-4xl mt-1">Photo flow</h1>
        <p className="text-navy-400 mt-1">
          Live trace of every photo from camera to customer. Counts update each time the page loads.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card">
          <div className="label-xs">Photos in system</div>
          <div className="font-display text-3xl text-navy-900">{photos}</div>
        </div>
        <div className="stat-card">
          <div className="label-xs">AI-edited</div>
          <div className="font-display text-3xl text-green-600">{edited}</div>
          <div className="text-xs text-navy-400">{editedPct}% of total</div>
        </div>
        <div className="stat-card">
          <div className="label-xs">Pending cloud sync</div>
          <div className={`font-display text-3xl ${syncPending > 0 ? "text-coral-600" : "text-navy-900"}`}>{syncPending}</div>
        </div>
      </div>

      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="card p-5 flex items-start gap-5">
            <div className="flex flex-col items-center">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  s.accent === "coral" ? "bg-coral-500/10 text-coral-600" :
                  s.accent === "green" ? "bg-green-500/10 text-green-600" :
                  s.accent === "gold" ? "bg-gold-500/10 text-gold-600" :
                  "bg-navy-800/10 text-navy-700"
                }`}
              >
                {s.icon}
              </div>
              {i < steps.length - 1 && <div className="h-8 w-px bg-cream-300 mt-2" />}
            </div>
            <div className="flex-1">
              <div className="flex items-end justify-between">
                <h3 className="heading text-lg">
                  <span className="text-navy-300 font-mono mr-2">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h3>
                {s.label && (
                  <div className="text-right">
                    <div className="font-display text-2xl text-navy-900">{s.count}</div>
                    <div className="text-[10px] uppercase tracking-widest text-navy-400">{s.label}</div>
                  </div>
                )}
              </div>
              <p className="text-sm text-navy-500 mt-1">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

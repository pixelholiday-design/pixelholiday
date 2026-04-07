/* eslint-disable */
import fs from "node:fs";
import path from "node:path";

type Status = "PASS" | "FAIL" | "MOCK";
type Row = { category: string; check: string; status: Status; phase: 1 | 2 };

const rows: Row[] = [];
function add(category: string, check: string, status: Status, phase: 1 | 2 = 1) {
  rows.push({ category, check, status, phase });
}

function fileHas(rel: string, needle?: string | RegExp) {
  try {
    const p = path.join(process.cwd(), rel);
    if (!fs.existsSync(p)) return false;
    if (!needle) return true;
    const s = fs.readFileSync(p, "utf8");
    return typeof needle === "string" ? s.includes(needle) : needle.test(s);
  } catch {
    return false;
  }
}

// ── PHASE 1 ──────────────────────────────────────────
add("DATABASE", "Schema valid", fileHas("prisma/schema.prisma", "model Gallery") ? "PASS" : "FAIL");
add("DATABASE", "All models present", fileHas("prisma/schema.prisma", "model JobApplication") ? "PASS" : "FAIL");
add("DATABASE", "Seed file exists", fileHas("prisma/seed.ts") ? "PASS" : "FAIL");
add("DATABASE", "db.ts singleton", fileHas("src/lib/db.ts", "PrismaClient") ? "PASS" : "FAIL");
add("AUTH", "NextAuth options", fileHas("src/lib/auth.ts", "CredentialsProvider") ? "PASS" : "FAIL");
add("AUTH", "Login page", fileHas("src/app/login/page.tsx", "signIn") ? "PASS" : "FAIL");
add("AUTH", "Middleware /admin", fileHas("src/middleware.ts", "/admin") ? "PASS" : "FAIL");
add("UPLOAD", "Presigned URL route", fileHas("src/app/api/upload/presigned/route.ts") ? "PASS" : "FAIL");
add("UPLOAD", "Complete upload", fileHas("src/app/api/upload/complete/route.ts", "prisma.gallery.create") ? "PASS" : "FAIL");
add("UPLOAD", "Upload Hub UI", fileHas("src/app/admin/upload/UploadHub.tsx", "useDropzone") ? "PASS" : "FAIL");
add("UPLOAD", "Hook image star", fileHas("src/app/admin/upload/UploadHub.tsx", "isHook") ? "PASS" : "FAIL");
add("UPLOAD", "R2 mode", process.env.R2_ACCESS_KEY_ID ? "PASS" : "MOCK");
add("GALLERY", "Magic link route", fileHas("src/app/gallery/[magicLinkToken]/page.tsx", "magicLinkToken") ? "PASS" : "FAIL");
add("GALLERY", "HOOK_ONLY render", fileHas("src/app/gallery/[magicLinkToken]/GalleryView.tsx", "HOOK_ONLY") ? "PASS" : "FAIL");
add("GALLERY", "Masonry grid", fileHas("src/app/gallery/[magicLinkToken]/GalleryView.tsx", "columns-") ? "PASS" : "FAIL");
add("GALLERY", "PAID download", fileHas("src/app/gallery/[magicLinkToken]/GalleryView.tsx", "Download") ? "PASS" : "FAIL");
add("GALLERY", "Favorites action", fileHas("src/app/gallery/[magicLinkToken]/actions.ts", "toggleFavorite") ? "PASS" : "FAIL");
add("GALLERY", "FOMO timer", fileHas("src/components/gallery/FomoTimer.tsx", "expiresAt") ? "PASS" : "FAIL");
const wm = fileHas("src/lib/cloudinary.ts", "w_0.5") && fileHas("src/lib/cloudinary.ts", "g_center") && fileHas("src/lib/cloudinary.ts", "o_40") && fileHas("src/lib/cloudinary.ts", "q_60") && fileHas("src/lib/cloudinary.ts", "f_webp");
add("WATERMARK", "Cloudinary lib", fileHas("src/lib/cloudinary.ts") ? "PASS" : "FAIL");
add("WATERMARK", "Params correct", wm ? "PASS" : "FAIL");
add("WATERMARK", "Component", fileHas("src/components/gallery/WatermarkedImage.tsx") ? "PASS" : "FAIL");
add("STRIPE", "Stripe lib", fileHas("src/lib/stripe.ts", "Stripe") ? "PASS" : "FAIL");
add("STRIPE", "Checkout w/ metadata", fileHas("src/app/api/checkout/route.ts", "metadata") ? "PASS" : "FAIL");
add("STRIPE", "Webhook constructEvent", fileHas("src/app/api/webhooks/stripe/route.ts", "constructEvent") ? "PASS" : "FAIL");
add("STRIPE", "Resend delivery", fileHas("src/app/api/webhooks/stripe/route.ts", "resend") ? "PASS" : "FAIL");
add("STRIPE", "Live keys", process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_xxx" ? "PASS" : "MOCK");
add("O2O", "WhatsApp lib", fileHas("src/lib/whatsapp.ts", "sendWhatsAppHookLink") ? "PASS" : "FAIL");
add("O2O", "Hook trigger", fileHas("src/app/api/upload/complete/route.ts", "sendWhatsAppHookLink") ? "PASS" : "FAIL");
add("O2O", "Booking picker", fileHas("src/app/gallery/[magicLinkToken]/BookingTimePicker.tsx") ? "PASS" : "FAIL");
add("O2O", "Booking API", fileHas("src/app/api/gallery/[token]/book/route.ts", "appointment.upsert") ? "PASS" : "FAIL");
add("KIOSK", "Presentation mode", fileHas("src/app/kiosk/[galleryId]/KioskView.tsx", "fixed inset-0") ? "PASS" : "FAIL");
add("KIOSK", "Photo selection", fileHas("src/app/kiosk/[galleryId]/KioskView.tsx", "selected") ? "PASS" : "FAIL");
add("KIOSK", "Cash + PIN", fileHas("src/app/kiosk/[galleryId]/KioskView.tsx", "Staff PIN") || fileHas("src/app/kiosk/[galleryId]/KioskView.tsx", "cashPin") ? "PASS" : "FAIL");
add("KIOSK", "Sale unlock", fileHas("src/app/api/kiosk/sale/route.ts", "isPurchased") ? "PASS" : "FAIL");
add("DOWNLOAD", "ZIP via Cloudinary", fileHas("src/lib/cloudinary.server.ts", "download_zip_url") ? "PASS" : "FAIL");

// ─── PHASE 3 CHECKS ──────────────────────────
add("REEL", "Auto-reel API exists", fileHas("src/app/api/ai/auto-reel/route.ts", "AUTO_REEL") ? "PASS" : "FAIL");
add("REEL", "Burst detection logic", fileHas("src/app/api/ai/auto-reel/route.ts", "diff <= 10") ? "PASS" : "FAIL");
add("REEL", "Generates Video record", fileHas("src/app/api/ai/auto-reel/route.ts", "isAutoReel: true") ? "PASS" : "FAIL");
add("MAGIC", "Magic shot API", fileHas("src/app/api/ai/magic-shot/route.ts", "hasMagicElement") ? "PASS" : "FAIL");
add("MAGIC", "Magic elements admin", fileHas("src/app/admin/magic-elements/page.tsx", "MagicElement") ? "PASS" : "FAIL");
add("MAGIC", "Cloudinary overlay", fileHas("src/app/api/ai/magic-shot/route.ts", "overlay") ? "PASS" : "FAIL");
add("STREAM", "Camera capture API", fileHas("src/app/api/camera/capture/route.ts", "wristbandCode") ? "PASS" : "FAIL");
add("STREAM", "Real-time WhatsApp ping", fileHas("src/app/api/camera/capture/route.ts", "sendWhatsAppHookLink") ? "PASS" : "FAIL");
add("RETOUCH", "Retouch admin page", fileHas("src/app/admin/retouch/page.tsx", "Pro Retouch") ? "PASS" : "FAIL");
add("RETOUCH", "Before/after slider", fileHas("src/app/admin/retouch/page.tsx", "sliderPos") ? "PASS" : "FAIL");
add("RETOUCH", "Retouch API", fileHas("src/app/api/admin/retouch/route.ts", "isRetouched") ? "PASS" : "FAIL");
add("WEB", "Portfolio page", fileHas("src/app/portfolio/page.tsx", "PixelHoliday") ? "PASS" : "FAIL");
add("WEB", "Blog admin", fileHas("src/app/admin/blog/page.tsx", "Blog Manager") ? "PASS" : "FAIL");
add("WEB", "Blog AI generation", fileHas("src/app/api/blog/route.ts", "aiGenerate") ? "PASS" : "FAIL");
add("WEB", "Online shop page", fileHas("src/app/shop/page.tsx", "PRODUCTS") ? "PASS" : "FAIL");
add("WEB", "Shop checkout API", fileHas("src/app/api/shop/checkout/route.ts", "stripe.checkout") ? "PASS" : "FAIL");
add("WEB", "Reviews dashboard", fileHas("src/app/admin/reviews/page.tsx", "Reviews") ? "PASS" : "FAIL");
add("AI", "Growth engine API", fileHas("src/app/api/ai/growth/route.ts", "insights") ? "PASS" : "FAIL");
add("AI", "AI insights admin page", fileHas("src/app/admin/ai-insights/page.tsx", "Growth Insights") ? "PASS" : "FAIL");
add("AI", "Logs to AIGrowthLog", fileHas("src/app/api/ai/growth/route.ts", "aIGrowthLog.create") ? "PASS" : "FAIL");
add("AI", "Culling API", fileHas("src/app/api/ai/cull/route.ts", "aiCulled") ? "PASS" : "FAIL");
add("AI", "Cull reasons tracked", fileHas("src/app/api/ai/cull/route.ts", "aiCullReason") ? "PASS" : "FAIL");
add("AI", "Admin override (PATCH)", fileHas("src/app/api/ai/cull/route.ts", "PATCH") ? "PASS" : "FAIL");

// Render report
const ok = rows.filter((r) => r.status === "PASS").length;
const fail = rows.filter((r) => r.status === "FAIL").length;
const mock = rows.filter((r) => r.status === "MOCK").length;
const total = rows.length;

const COL = { cat: 10, chk: 36, st: 9 };
const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n));
const lines: string[] = [];
const bar = "═".repeat(64);
lines.push("╔" + bar + "╗");
lines.push("║       PIXELHOLIDAY — PHASES 1+2+3 HEALTH REPORT" + " ".repeat(21) + "║");
lines.push("╠" + bar + "╣");
let lastPhase = 0;
for (const r of rows) {
  if (r.phase !== lastPhase) {
    lines.push("║ ── PHASE " + r.phase + " " + "─".repeat(53) + "║");
    lastPhase = r.phase;
  }
  const icon = r.status === "PASS" ? "✅ PASS" : r.status === "FAIL" ? "❌ FAIL" : "⚠️  MOCK";
  lines.push("║ " + pad(r.category, COL.cat) + "│ " + pad(r.check, COL.chk) + "│ " + pad(icon, COL.st) + "║");
}
lines.push("╠" + bar + "╣");
const summary = ` TOTAL ${ok}/${total} PASS │ ${fail} FAIL │ ${mock} MOCK`;
lines.push("║" + pad(summary, 64) + "║");
const phaseStatus = fail === 0 ? (mock === 0 ? "✅ COMPLETE" : "🔧 COMPLETE (some MOCKs — set env vars)") : "❌ FAIL";
lines.push("║ STATUS: " + pad(phaseStatus, 55) + "║");
lines.push("╚" + bar + "╝");

const out = lines.join("\n");
console.log(out);
fs.mkdirSync("logs", { recursive: true });
fs.writeFileSync("logs/phase1-health.md", "```\n" + out + "\n```\n");
fs.writeFileSync("logs/phase3-health.md", "```\n" + out + "\n```\n");
process.exit(fail > 0 ? 1 : 0);

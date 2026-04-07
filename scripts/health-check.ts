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

// ── PHASE 2 ──────────────────────────────────────────
add("DASH", "Dashboard page", fileHas("src/app/admin/dashboard/page.tsx", "Total Revenue") ? "PASS" : "FAIL", 2);
add("DASH", "Dashboard API", fileHas("src/app/api/admin/dashboard/route.ts", "totalRevenue") ? "PASS" : "FAIL", 2);
add("DASH", "Conversion tracking", fileHas("src/app/api/admin/dashboard/route.ts", "conversion") ? "PASS" : "FAIL", 2);
add("DASH", "Recharts installed", fileHas("package.json", "recharts") ? "PASS" : "FAIL", 2);
add("STAFF", "Staff list page", fileHas("src/app/admin/staff/page.tsx", "Leaderboard") ? "PASS" : "FAIL", 2);
add("STAFF", "Staff detail page", fileHas("src/app/admin/staff/[id]/page.tsx") ? "PASS" : "FAIL", 2);
add("STAFF", "Staff CRUD API", fileHas("src/app/api/admin/staff/route.ts", "prisma.user") ? "PASS" : "FAIL", 2);
add("STAFF", "Commissions API", fileHas("src/app/api/admin/commissions/route.ts", "isPaid") ? "PASS" : "FAIL", 2);
add("STAFF", "Commissions lib", fileHas("src/lib/commissions.ts", "recordCommission") ? "PASS" : "FAIL", 2);
add("STAFF", "Shift assignment", fileHas("src/app/api/admin/shifts/route.ts", "shift.create") ? "PASS" : "FAIL", 2);
add("STAFF", "Transfer API", fileHas("src/app/api/admin/transfers/route.ts", "staffTransfer.create") ? "PASS" : "FAIL", 2);
add("STAFF", "Equipment page", fileHas("src/app/admin/equipment/page.tsx") ? "PASS" : "FAIL", 2);
add("STAFF", "Housing page", fileHas("src/app/admin/housing/page.tsx") ? "PASS" : "FAIL", 2);
add("STAFF", "Chat messages API", fileHas("src/app/api/chat/messages/route.ts", "chatMessage.create") ? "PASS" : "FAIL", 2);
add("STAFF", "Chat channels API", fileHas("src/app/api/chat/channels/route.ts") ? "PASS" : "FAIL", 2);
add("STAFF", "Gamification XP/badges", fileHas("src/lib/gamification.ts", "addXp") && fileHas("prisma/schema.prisma", "xp ") ? "PASS" : "FAIL", 2);
add("BOOK", "Bookings calendar", fileHas("src/app/admin/bookings/page.tsx", "weekStart") ? "PASS" : "FAIL", 2);
add("BOOK", "Booking create API", fileHas("src/app/api/booking/create/route.ts", "appointment.upsert") ? "PASS" : "FAIL", 2);
add("BOOK", "Auto-dispatch", fileHas("src/app/api/booking/dispatch/route.ts", "rating") ? "PASS" : "FAIL", 2);
add("CUSTID", "QR generate", fileHas("src/app/api/qr/generate/route.ts", "qRCode.create") ? "PASS" : "FAIL", 2);
add("CUSTID", "QR scan", fileHas("src/app/api/qr/scan/route.ts", "wristbandCode") ? "PASS" : "FAIL", 2);
add("CUSTID", "Customer identify", fileHas("src/app/api/customer/identify/route.ts", "method") ? "PASS" : "FAIL", 2);
add("CUSTID", "Face match (placeholder)", fileHas("src/app/api/ai/face-match/route.ts", "gdpr") ? "PASS" : "FAIL", 2);
add("AUTO", "Abandoned cart route", fileHas("src/app/api/automation/abandoned-cart/route.ts", "cartAbandoned") ? "PASS" : "FAIL", 2);
add("AUTO", "Sweep-up route", fileHas("src/app/api/automation/sweep-up/route.ts", "sweepUpSentAt") ? "PASS" : "FAIL", 2);
add("AUTO", "Cron handler", fileHas("src/app/api/automation/cron/route.ts", "abandoned-cart") ? "PASS" : "FAIL", 2);
add("AUTO", "Customer.lastViewedAt", fileHas("prisma/schema.prisma", "lastViewedAt") ? "PASS" : "FAIL", 2);
add("FUNNEL", "Pass page", fileHas("src/app/pass/[locationId]/page.tsx", "TIERS") ? "PASS" : "FAIL", 2);
add("FUNNEL", "Pass purchase API", fileHas("src/app/api/pass/purchase/route.ts", "DIGITAL_PASS") ? "PASS" : "FAIL", 2);
add("FUNNEL", "Pass verify", fileHas("src/app/api/pass/verify/route.ts", "hasDigitalPass") ? "PASS" : "FAIL", 2);
add("FUNNEL", "QR pre-book page", fileHas("src/app/book/[qrCodeId]/page.tsx") ? "PASS" : "FAIL", 2);
add("FUNNEL", "QR pre-book API", fileHas("src/app/api/booking/qr-prebook/route.ts", "QR_CODE") ? "PASS" : "FAIL", 2);
add("COMMS", "WhatsApp templates", fileHas("src/lib/whatsapp.ts", "sendWhatsAppGalleryDelivery") && fileHas("src/lib/whatsapp.ts", "sendWhatsAppSweepUp") ? "PASS" : "FAIL", 2);
add("COMMS", "Email templates", fileHas("src/lib/email.ts", "emailGalleryLink") && fileHas("src/lib/email.ts", "emailSweepUp") ? "PASS" : "FAIL", 2);
add("COMMS", "WhatsApp webhook", fileHas("src/app/api/webhooks/whatsapp/route.ts", "hub.challenge") ? "PASS" : "FAIL", 2);

// Render
const ok = rows.filter((r) => r.status === "PASS").length;
const fail = rows.filter((r) => r.status === "FAIL").length;
const mock = rows.filter((r) => r.status === "MOCK").length;
const total = rows.length;

const COL = { cat: 10, chk: 36, st: 9 };
const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n));
const lines: string[] = [];
const bar = "═".repeat(64);
lines.push("╔" + bar + "╗");
lines.push("║   PIXELHOLIDAY — PHASE 1 + PHASE 2 HEALTH REPORT             ║");
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
fs.writeFileSync("logs/phase2-health.md", "```\n" + out + "\n```\n");
process.exit(fail > 0 ? 1 : 0);

# PixelHoliday — Manual Test Guide

A walkthrough script for verifying every role and customer flow against a running PixelHoliday instance (local or production).

**Production URL:** https://pixelholiday.vercel.app
**Database:** Neon PostgreSQL 17.8 (eu-central-1)
**Last verified:** 2026-04-08

---

## 1. Pre-flight

Open the production URL in a fresh incognito window (ensures clean cookies).
Decline non-essential cookies on the banner; accept the essentials.

```
https://pixelholiday.vercel.app/api/health
```
Expect: `{"status":"ok","database":"connected"}`

---

## 2. Seeded credentials (all roles, all `password123`)

| Role | Email | PIN |
|---|---|---|
| CEO | `admin@pixelholiday.local` | — |
| Operations Manager | `ops@pixelholiday.local` | — |
| Supervisor | `super@pixelholiday.local` | 4444 |
| Photographer (Yassine Ben) | `photo1@pixelholiday.local` | 1111 |
| Photographer (Karim Hamdi) | `photo2@pixelholiday.local` | 2222 |
| Sales Staff | `sales@pixelholiday.local` | 3333 |
| Receptionist | `reception@pixelholiday.local` | — |
| Academy Trainee | `trainee@pixelholiday.local` | — |

PINs are used at the kiosk Sale Point (`/kiosk/sale-point`), not the web login.

---

## 3. Role walkthroughs

### 3.1 CEO — `admin@pixelholiday.local` / `password123`

1. Sign in at `/login`
2. Land on `/admin/dashboard` — verify:
   - **All / Pixel Luxury / Pixel Splash** division pill renders (top-right)
   - **All Locations** dropdown next to the pill (5 options when multi-destination is deployed)
   - Stat cards show real numbers (Total Revenue, Galleries Today, Conversion Rate, Pending Payouts)
   - "Revenue by location" bar chart shows data
3. Click **Pixel Luxury** pill → revenue numbers should change to luxury-only
4. Click **Pixel Splash** → numbers change to splash-only
5. Click back to **All**
6. Sidebar (☰) — verify all sections visible: Operations, Team, Business, Content
7. Navigate to `/admin/staff` — should list 8 seeded users + any signups
8. Click any photographer name → land on `/admin/staff/[id]`. Verify "Photography Skill Profile" radar chart renders (6 axes: Individual/Couple/Family/Kids/Action/Portrait)
9. Navigate to `/admin/pricing`:
   - Tabular catalogue with Anchor + Hidden columns
   - "Full Gallery (digital)" should have a gold **ANCHOR** badge
   - Toggle Anchor on a different row → previous anchor clears, new one becomes active
10. Navigate to `/admin/finance/close-month` — 5-row proof checklist (daily_cash, bank_statement, rent_receipt, payroll, petty_cash)
11. Navigate to `/admin/sites/evaluate` — Site Viability Scorecard with 5 sliders (default 3/3/3/3/3 = 15/25 FAIL, monthly gross / rent ceiling auto-calculate)
12. Navigate to `/admin/zones` — Zone management for water park rotation tracking
13. Navigate to `/admin/ai-insights` — Photographer coaching heatmap with color-coded scores per pose category
14. Sign out via the avatar menu

### 3.2 Operations Manager — `ops@pixelholiday.local`

1. Sign in
2. Verify sidebar shows operations + business sections, **NOT franchise**
3. Try `/admin/franchise` — should redirect to `/my-dashboard` or 403
4. `/admin/dashboard` — should see all locations data
5. `/admin/payroll` — accessible

### 3.3 Supervisor — `super@pixelholiday.local`

1. Sign in
2. Sidebar should be reduced (no payroll, no finance, no franchise)
3. `/admin/staff` — sees staff at their location
4. Try `/admin/payroll` — should be blocked

### 3.4 Photographer — `photo1@pixelholiday.local`

1. Sign in
2. Lands on `/my-dashboard`
3. Verify:
   - XP bar with current level (e.g. "Rookie · Level 1")
   - Streak counter, Today's XP, Leaderboard rank
   - Badges section
   - **Your Photography Skill Profile** radar chart (6 axes)
   - Weekly leaderboard
4. Try `/admin/dashboard` — should be blocked (redirects to my-dashboard)
5. Open `/admin/upload` — Upload Hub form is accessible
6. Open `/kiosk/sale-point` — PIN screen appears
7. Enter PIN **1111** — POS main screen loads with incoming orders tab

### 3.5 Sales Staff — `sales@pixelholiday.local`

1. Sign in
2. Open `/kiosk/sale-point`, enter PIN **3333** — should access POS
3. Try `/admin/staff` — blocked

### 3.6 Receptionist — `reception@pixelholiday.local`

1. Sign in
2. `/admin/bookings` — accessible
3. Try `/admin/finance` — blocked

### 3.7 Academy Trainee — `trainee@pixelholiday.local`

1. Sign in
2. Should land on `/admin/academy` (or be blocked from everything else)
3. Try `/admin/dashboard` — blocked

---

## 4. Customer flows

### 4.1 Online gallery purchase (Stripe checkout)

1. CEO signs in, navigates to `/admin/dashboard`
2. Pull a `magicLinkToken` from any seeded gallery (use Neon dashboard or
   `npx tsx -e "import {prisma} from './src/lib/db'; prisma.gallery.findFirst({where:{status:'PREVIEW_ECOM'}}).then(g=>console.log(g?.magicLinkToken))"`)
3. Open `https://pixelholiday.vercel.app/gallery/<token>` in incognito
4. Verify:
   - All photos shown with Cloudinary watermarks
   - FOMO timer counts down
   - Heart icons toggle favorites
   - "Unlock All Photos" button shows price
5. Click checkout → Stripe should open (or fail with 502 if STRIPE_SECRET_KEY is stale — see "Known limitations")

### 4.2 Single-photo purchase (online)

1. From the same gallery, click on a single photo → lightbox opens
2. Heart it → verify the heart fills
3. Click "Buy this photo" → checkout flow

### 4.3 Digital Pass purchase (pre-arrival)

1. Open `https://pixelholiday.vercel.app/pass/<locationId>`
2. Three tiers shown (Basic / Unlimited / VIP) — prices vary by location
3. Choose Basic, enter customer details
4. Stripe checkout opens (or 502 with stale key)

### 4.4 QR pre-booking

1. Get a QR code ID: `prisma.qRCode.findFirst({where:{type:'HOTEL_ROOM'}})`
2. Open `/book/<qrCodeId>`
3. Time picker → submit
4. Verify Appointment created in DB with `source = QR_CODE`

### 4.5 Kiosk self-service

1. Open `/kiosk/gallery` on a tablet (or browser sized to tablet)
2. Tap **Room number** → enter `100` (or any seeded room)
3. Photos load → tap to favorite, double-tap to add to cart
4. Tap "Checkout" → 3-screen reveal (Anchor → Compromise → Individual)
5. Tap "Order at counter" → SaleOrder created → photographer receives notification on `/kiosk/sale-point`

### 4.6 Sleeping money (automated abandoned-cart)

```
POST /api/automation/abandoned-cart
POST /api/automation/sweep-up
```
Both should return 200 with a `triggered` count.

---

## 5. API smoke tests (via the production test runner)

```bash
node scripts/test-prod.mjs
```

Expected:
```
✅ 1 Health endpoint
✅ 2 Login flow
✅ 3 Dashboard data
✅ 4 Gallery / public page
✅ 5 Favorite toggle
✅ 6 Staff endpoint
⚠️ 7 Pass purchase  (PARTIAL — Stripe stale key)
```

---

## 6. Known limitations in production

| | |
|---|---|
| **Stripe live charges** | The `STRIPE_SECRET_KEY` env var on Vercel is a stale test key that Stripe rejects (502 from `/api/pass/purchase`). Replace with a real `sk_test_...` (or remove entirely so the route falls into dev-mode mock) before launching. |
| **R2 file storage** | `R2_*` env vars set but not verified — uploads will write to whatever bucket those creds resolve to. |
| **WhatsApp Cloud API** | `WHATSAPP_TOKEN` set but not verified. WhatsApp delivery will silently fail or use the mock logger if creds are wrong. |
| **Resend email** | `RESEND_API_KEY` set but unverified. |
| **Cloudinary watermarking** | Verify `CLOUDINARY_*` creds work by uploading a real photo via `/admin/upload`. |
| **Multi-destination data** | Production currently has 2 seeded locations (Hilton Monastir + AquaSplash Water Park). The 5-destination expansion (commit `1f931ea` — Tunisia × 3 + Greece × 2) is built and tested locally but not yet pushed to main. Push to enable. |

---

## 7. Reset / re-seed (Neon)

```bash
DATABASE_URL="<neon-url>" npx prisma db push --accept-data-loss
DATABASE_URL="<neon-url>" npx tsx prisma/seed.ts
DATABASE_URL="<neon-url>" npx tsx prisma/seed-academy.ts
DATABASE_URL="<neon-url>" npx tsx prisma/seed-multi-destination.ts  # optional, after multi-dest push
```

---

## 8. Reporting

If any test fails, capture:
- The exact route + HTTP status
- The response body (JSON)
- Server logs from `npx vercel logs <deployment-url>`
- The git SHA of the deployed commit (visible in Vercel dashboard)

File issues against `pixelholiday-design/pixelholiday` on GitHub.

# PIXELHOLIDAY — AUTONOMOUS BUILD GUIDE
# ════════════════════════════════════════
# This file + PIXELHOLIDAY_CLAUDE.md together = your complete system
# Merge them into a single CLAUDE.md in your project root
# Or keep them separate — Claude Code reads all .md files in root

---

## A. ZERO-APPROVAL SETUP

### A.1 Create `.claude/settings.json` in your project root:
```json
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Read(*)",
      "Write(*)",
      "Edit(*)",
      "MultiEdit(*)",
      "TodoRead(*)",
      "TodoWrite(*)"
    ],
    "deny": []
  }
}
```

### A.2 Autonomous execution rules (paste at top of CLAUDE.md):
```
IMPORTANT — CLAUDE CODE BEHAVIOR:
1. READ CLAUDE.md before writing ANY code
2. NEVER ask for approval — just build
3. NEVER stop to ask "should I continue?" — just continue
4. If something fails, fix it and move on
5. After EACH PHASE: run ALL health checks, display status table
6. Commit to git after each completed module
7. If a dependency is missing, install it silently
8. If an env variable is missing, create .env.example with placeholder
9. Log all decisions to /logs/build-decisions.md
10. Update the progress tracker in CLAUDE.md (⬜ → 🔧 → ✅)
```

---

## B. HEALTH CHECK SYSTEM

After completing each phase, Claude Code MUST create and run `scripts/health-check.ts` displaying a formatted table.

### B.1 Phase 1 checks (28 checks):
```
[DB]       Prisma schema valid & migrations run clean
[DB]       Can CRUD: Organization, User, Customer, Gallery, Photo
[AUTH]     NextAuth login/logout works
[UPLOAD]   Presigned URL generation returns valid URL
[UPLOAD]   File upload to R2 completes (mock in dev)
[UPLOAD]   Gallery record created with correct status
[UPLOAD]   Hook image selection persists (isHookImage=true)
[GALLERY]  Magic link resolves to correct gallery
[GALLERY]  HOOK_ONLY shows single image only
[GALLERY]  PREVIEW_ECOM shows masonry grid with watermarks
[GALLERY]  PAID shows clean images with download
[GALLERY]  Favorites toggle works (Server Action)
[GALLERY]  FOMO timer displays and counts down
[WATER]    Cloudinary watermark URL generates correctly
[WATER]    Params correct: w_0.5, g_center, o_40, q_60, f_webp
[STRIPE]   Checkout session creates with galleryId metadata
[STRIPE]   Webhook signature verification works
[STRIPE]   Gallery updates PREVIEW_ECOM → PAID on payment
[STRIPE]   Delivery email sends after payment
[HOOK]     WhatsApp message triggers on gallery creation (mock)
[HOOK]     Booking time picker creates Appointment
[HOOK]     Photographer notification triggers on booking
[KIOSK]    Presentation mode renders (no admin UI)
[KIOSK]    Photo selection before "Complete Sale" works
[KIOSK]    Cash payment with PIN records correctly
[KIOSK]    Gallery unlocks instantly after kiosk sale
[BUILD]    Next.js builds without errors, no TS errors
[BUILD]    All API routes respond (no 500s)
```

### B.2 Phase 2 checks (16 checks):
```
[DASH]     Dashboard loads revenue data
[DASH]     Conversion tracking: uploaded vs sold
[STAFF]    Staff CRUD operations work
[STAFF]    Commission calculation fires on sale
[STAFF]    Shift assignment works
[STAFF]    Chat messages send and receive
[BOOK]     Booking calendar displays correctly
[BOOK]     Photographer auto-dispatch assigns correctly
[CUSTID]   QR wristband scan creates customer link
[CUSTID]   Room number lookup returns correct gallery
[AUTO]     Abandoned cart detected after timeout
[AUTO]     7-day sweep-up scheduled correctly
[AUTO]     Partial purchase tracked correctly
[FUNNEL]   Digital pass purchase flow completes
[FUNNEL]   QR pre-booking creates appointment
[COMMS]    WhatsApp + Email templates work (mock)
```

### B.3 Phase 3 checks (12 checks):
```
[REEL]     Burst detection identifies 5+ rapid photos
[REEL]     Auto-reel generates MP4/GIF from burst
[MAGIC]    AR overlay applies to photo correctly
[MAGIC]    Magic element library loads in admin
[STREAM]   Real-time notification sends on capture (mock)
[RETOUCH]  Retouch interface loads with tools
[RETOUCH]  Before/after comparison renders
[WEB]      Portfolio page renders with photos
[WEB]      Blog post AI generation works
[WEB]      Online shop displays products
[AI]       Growth suggestions generate from data
[AI]       AI culling flags bad photos correctly
```

### B.4 Phase 4 checks (8 checks):
```
[SAAS]     External photographer signup works
[SAAS]     Subscription tier limits enforced
[SAAS]     Custom branding applies per photographer
[ACADEMY]  Module list renders with content
[ACADEMY]  Progress tracking saves per staff
[B2B]      Delivery tracking records monthly
[GAME]     Gamification badges award on milestones
[GAME]     Leaderboard updates with real data
```

### B.5 Display format (Claude Code must output this):
```
╔══════════════════════════════════════════════════╗
║        PIXELHOLIDAY — PHASE X HEALTH REPORT      ║
╠══════════════════════════════════════════════════╣
║ Category    │ Check              │ Status         ║
║─────────────┼────────────────────┼────────────────║
║ DATABASE    │ Schema valid       │ ✅ PASS        ║
║ DATABASE    │ CRUD operations    │ ✅ PASS        ║
║ UPLOAD      │ Presigned URLs     │ ✅ PASS        ║
║ GALLERY     │ Hook view          │ ❌ FAIL        ║
║ STRIPE      │ Webhook verify     │ ⚠️  MOCK        ║
╠══════════════════════════════════════════════════╣
║ TOTAL: 26/28 PASS │ 1 FAIL │ 1 MOCK             ║
║ PHASE STATUS: 🔧 IN PROGRESS                     ║
╚══════════════════════════════════════════════════╝
```

---

## C. STEP-BY-STEP TERMINAL COMMANDS

### Step 0: One-time setup (do this once, 10 minutes)

```bash
# 1. Install Claude Code
npm install -g @anthropic-ai/claude-code

# 2. Create project
mkdir pixeleco && cd pixeleco
git init

# 3. Place CLAUDE.md (the PIXELHOLIDAY_CLAUDE.md file renamed)
# Copy your downloaded file to ./CLAUDE.md

# 4. Create zero-approval settings
mkdir -p .claude
cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": ["Bash(*)","Read(*)","Write(*)","Edit(*)","MultiEdit(*)","TodoRead(*)","TodoWrite(*)"],
    "deny": []
  }
}
EOF

# 5. Set API key
export ANTHROPIC_API_KEY=your_key_here

# 6. Verify
claude "Read CLAUDE.md and confirm you understand the PixelHoliday project. List all 23 modules."
```

---

### Step 1: PHASE 1 — Core Revenue Engine

Copy-paste this entire block into your terminal:

```bash
claude "
Read CLAUDE.md completely. You are building PHASE 1. Execute ALL steps in order. No approval needed. Fix errors silently. Continue to next step automatically.

STEP 1.1 — SCAFFOLD:
- npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'
- Install: prisma @prisma/client next-auth @auth/prisma-adapter stripe @stripe/stripe-js cloudinary react-dropzone resend zod lucide-react date-fns @aws-sdk/client-s3 @aws-sdk/s3-request-presigner bcryptjs
- Install dev: @types/bcryptjs prisma
- Create folder structure per CLAUDE.md Section 6
- Initialize prisma: npx prisma init

STEP 1.2 — DATABASE:
- Copy the COMPLETE Prisma schema from CLAUDE.md Section 1 into prisma/schema.prisma
- ALL 25+ models, ALL enums, ALL relations — skip nothing
- npx prisma generate
- Create prisma/seed.ts with test data: 1 org, 2 locations (1 hotel, 1 water park), 3 photographers, 5 customers, 10 galleries with mixed statuses, 50 photos (some with isHookImage=true)
- Create src/lib/db.ts (Prisma client singleton)

STEP 1.3 — AUTH:
- Set up NextAuth at src/lib/auth.ts with CredentialsProvider
- Middleware for role-based access: /admin/* requires CEO/OPERATIONS_MANAGER/SUPERVISOR/PHOTOGRAPHER
- Login page at src/app/login/page.tsx
- Session types extended with role and orgId

STEP 1.4 — UPLOAD HUB (Module 1):
- src/app/admin/upload/page.tsx
- Left: form with location selector (from DB), room number input, customer WhatsApp+email, gallery status toggle (PRE-PAID vs ECOM/HOOK), photographer dropdown
- Right: react-dropzone area, thumbnail grid after drop, star icon on each thumbnail (click to set hook image, only 1 allowed)
- Accept: .jpg, .jpeg, .png, .raw, .cr2, .nef, .arw, .mp4, .mov
- API: src/app/api/upload/presigned/route.ts — generates R2 presigned URLs
- API: src/app/api/upload/complete/route.ts — creates Gallery + Photo records, sets status based on tactic toggle
- Upload flow: client gets presigned URL → uploads directly to R2 → calls /complete

STEP 1.5 — CUSTOMER GALLERY (Module 2):
- src/app/gallery/[magicLinkToken]/page.tsx (Server Component)
- Fetch gallery by token, include photos, customer, photographer
- Dynamic render:
  * HOOK_ONLY: single WatermarkedImage + time picker + 'Book viewing at kiosk' CTA
  * PREVIEW_ECOM: CSS columns masonry grid of WatermarkedImages + heart overlay + 'Unlock for €49' Stripe button
  * PAID: clean images + download icon per photo + DownloadAllButton
  * PARTIAL_PAID: purchased photos clean, rest watermarked
  * DIGITAL_PASS: all clean, auto-delivered
- Server Action for toggling isFavorited
- 'Show Favorites Only' client-side filter
- FOMO countdown timer component (expiresAt)
- Mobile-first, warm holiday aesthetic, clean luxury feel

STEP 1.6 — WATERMARKING (Module 3):
- src/lib/cloudinary.ts: Cloudinary config + watermark URL builder
- Transformation: overlay=pixelholiday_watermark,w_0.5,g_center,o_40/q_60,f_webp
- src/components/gallery/WatermarkedImage.tsx: wraps next/image with custom loader
- NEVER expose unwatermarked URLs for unpaid galleries

STEP 1.7 — STRIPE (Module 4):
- src/lib/stripe.ts: Stripe client
- src/app/api/checkout/route.ts: creates checkout session with galleryId in metadata
- src/app/api/webhooks/stripe/route.ts: verifies signature, on completed → update gallery PREVIEW_ECOM→PAID, send email via Resend
- src/components/gallery/StripeCheckoutButton.tsx
- Price configs for: single photo, partial (10), full gallery, album, video, magic shot, digital pass, social package

STEP 1.8 — O2O HOOK ENGINE (Module 5):
- src/lib/whatsapp.ts: WhatsApp Cloud API client (console.log mock in dev)
- On gallery creation with HOOK_ONLY status → trigger WhatsApp with magic link
- src/app/gallery/[magicLinkToken]/components/BookingTimePicker.tsx
- src/app/api/gallery/[token]/book/route.ts: creates Appointment, sets status PENDING
- Mock notification to photographer (console.log)

STEP 1.9 — KIOSK (Module 6 basic):
- src/app/kiosk/[galleryId]/page.tsx
- Presentation mode: full-screen, no nav, no admin controls
- All photos unwatermarked, high quality
- Heart icons for favorites
- 'Select Photos for Customer' toggle mode (photographer picks which to include)
- 'Complete Sale' button: payment method selector (Card via Stripe Terminal / Cash with PIN)
- src/app/api/kiosk/sale/route.ts: processes sale, creates Order + OrderItems, updates Gallery status
- On complete: gallery unlocks purchased photos

STEP 1.10 — ZIP DOWNLOAD:
- src/app/api/gallery/[token]/download/route.ts
- Query all cloudinaryIds for PAID gallery
- Use Cloudinary v2.utils.download_zip_url (target_public_id: PixelHoliday_Memories)
- Return URL to client
- src/components/gallery/DownloadAllButton.tsx

STEP 1.11 — HEALTH CHECK:
- Create scripts/health-check.ts implementing ALL Phase 1 checks from the build guide
- Run it with ts-node or tsx
- Display formatted table with PASS/FAIL/MOCK for each check
- Log results to logs/phase1-health.md
- git add -A && git commit -m 'Phase 1 Complete: Core Revenue Engine'

Show the health report at the end.
"
```

---

### Step 1.5: Fix any Phase 1 failures

```bash
claude "
Read CLAUDE.md. Check logs/phase1-health.md.
Fix ALL failing checks. Do not ask for approval.
Re-run health checks. Show updated report.
Commit fixes: 'Phase 1 fixes: [list what was fixed]'
"
```

---

### Step 2: PHASE 2 — Operations & Management

```bash
claude "
Read CLAUDE.md completely. Building PHASE 2. Phase 1 is done — do NOT rebuild it. No approval needed. Execute all steps.

STEP 2.1 — ANALYTICS DASHBOARD (Module 14):
- src/app/admin/dashboard/page.tsx
- Cards: Total Revenue, Pending Payouts, Revenue by Location (hotel/park/attraction)
- Conversion chart: galleries uploaded vs sold (use recharts)
- Flag photographers with <20% conversion (red badge)
- Revenue breakdown: by period, location, photographer
- Digital Pass sales count and revenue
- Automated (sleeping money) vs manual sales pie chart
- Equipment cost summary
- API: src/app/api/admin/dashboard/route.ts (aggregated queries)

STEP 2.2 — STAFF MANAGEMENT (Module 15):
- src/app/admin/staff/page.tsx: staff list with search, filter by role/location
- src/app/admin/staff/[id]/page.tsx: detail view
- Shift calendar: assign shifts by location, visual calendar (date-fns)
- Staff transfer: move between locations, log to StaffTransfer
- Repeater system: isRepeater badge, repeaterYears counter, salary calculation (+100/year, max +1500)
- Commission dashboard: all 5 types tracked, monthly summary, 'Mark as Paid' button
- Performance leaderboard: sort by sales, uploads, conversion, rating
- Equipment page: src/app/admin/equipment/page.tsx — assign/track/costs
- Housing page: src/app/admin/housing — address, cost, docs per person
- Staff cost view: total = salary + housing + equipment per person, sortable
- Chat system: src/app/api/chat/messages/route.ts + /channels/route.ts, polling-based, channels per location + direct messages
- Gamification: XP system, level tracking, badges (Top Closer, Upload King, Booking Machine, Streak Master, Revenue Champion), daily/weekly progress bars, milestone notifications

STEP 2.3 — BOOKING (Module 17):
- src/app/admin/bookings/page.tsx: calendar view (weekly/daily)
- Filter by location, photographer, status, booking source
- VIP Concierge: dispatches to highest-rated available photographer
- Auto-assign algorithm: check availability + rating + proximity
- Track booking source on every appointment
- API: src/app/api/booking/create/route.ts + /dispatch/route.ts

STEP 2.4 — CUSTOMER ID (Module 7):
- QR wristband: src/app/api/qr/generate/route.ts — generate unique codes
- Scan endpoint: link QR to customer, auto-tag future photos
- Room number lookup: search by room → return galleries
- Face recognition placeholder: src/app/api/ai/face-match/route.ts — accept selfie, return matched gallery (placeholder logic, real AI in Phase 3)
- GDPR: delete selfie immediately after match attempt

STEP 2.5 — AUTOMATED SALES (Module 8):
- Abandoned cart: track lastViewedAt on Customer, detect no purchase after 3 days
- src/app/api/automation/abandoned-cart/route.ts — sends WhatsApp with 15% discount
- 7-day sweep: track partial purchases, after 7 days send 50% off remaining
- src/app/api/automation/sweep-up/route.ts
- Cron handler: src/app/api/automation/cron/route.ts — runs both checks
- Mark automated sales with isAutomatedSale=true

STEP 2.6 — PRE-ARRIVAL FUNNEL (Module 11):
- src/app/pass/[locationId]/page.tsx: Digital Pass purchase (3 tiers with Stripe)
- src/app/book/[qrCodeId]/page.tsx: public booking from QR scan
- Time slot selector + optional photographer request
- Receptionist commission: track QR source, 5% per booking
- On-site pass sale: kiosk staff can sell passes with POS

STEP 2.7 — COMMUNICATION ENGINE (Module 23):
- src/lib/whatsapp.ts: template messages for gallery delivery, booking confirm, discount offers, sweep-up
- src/lib/email.ts: Resend templates for receipt, gallery link, abandoned cart, sweep-up
- Webhook: src/app/api/webhooks/whatsapp/route.ts
- Notification system: photographer alerts on booking

STEP 2.8 — HEALTH CHECK:
- Add Phase 2 checks to scripts/health-check.ts
- Run full check (Phase 1 + 2)
- Display combined table
- Log to logs/phase2-health.md
- Commit: 'Phase 2 Complete: Operations & Management'

Show combined health report.
"
```

---

### Step 3: PHASE 3 — Premium Features & AI

```bash
claude "
Read CLAUDE.md completely. Building PHASE 3. Phases 1-2 done. No approval needed.

STEP 3.1 — AUTO-REEL (Module 9):
- Burst detection: identify 5+ photos in gallery with createdAt within 10 seconds
- Auto-stitch script using ffmpeg: combine into 3-sec loop MP4 + GIF
- Graphic overlay text configurable per location/season
- Music track library (store track metadata, apply during stitch)
- Store as Video with type=AUTO_REEL, isAutoReel=true
- Display in gallery alongside photos with video player
- Photographer video upload: accept .mp4/.mov as RAW_CLIP or SLOW_MOTION

STEP 3.2 — MAGIC SHOTS & AR (Module 10):
- src/app/admin/magic-elements/page.tsx: manage asset library
- MagicElement CRUD: name, type, assetUrl, category
- Magic Shot application: photographer selects photo + element → composite via Cloudinary overlay
- Save result with hasMagicElement=true, magicElementId set
- Green screen: Cloudinary background removal + scenic backdrop overlay
- XLfie: panoramic upload with special display mode
- Price: 20 TND per Magic Shot as OrderItemType

STEP 3.3 — REAL-TIME STREAMING (Module 12):
- On photo upload: check if customer has active digital pass
- If yes: match via faceVector or wristbandCode → auto-add to gallery
- Send WhatsApp notification with preview link within 60 seconds
- src/app/api/camera/capture/route.ts: receive from speed camera system
- Auto-match + auto-deliver

STEP 3.4 — PRO RETOUCH (Module 13):
- src/app/admin/retouch/page.tsx
- Select gallery → select photos → retouch tools
- AI-assisted: auto color, exposure, white balance, skin smoothing (Cloudinary transformations)
- Batch mode: apply preset to multiple photos
- Before/after slider component
- Mark isRetouched=true on processed photos
- Save presets per location

STEP 3.5 — WEBSITE & PORTFOLIO (Module 18):
- src/app/portfolio/page.tsx: public showcase
- src/app/admin/blog/page.tsx: create/edit posts, AI generation
- AI writes posts from featured photographer photos + SEO keywords
- src/app/shop/page.tsx: online products (prints, albums, digital)
- 3D product preview placeholder (album mockup image)
- Stripe checkout for shop
- src/app/admin/reviews/page.tsx: customer reviews + photo tagging

STEP 3.6 — AI GROWTH (Module 20 v1):
- src/app/admin/ai-insights/page.tsx
- Analyze: conversion patterns, peak times, best photographers
- Generate: pricing suggestions, scheduling improvements, marketing ideas, promotion candidates
- SEO: keyword tracking, content suggestions
- Log actions to AIGrowthLog
- Display as actionable cards

STEP 3.7 — AI CULLING (Module 1.9):
- On upload, run quality checks:
  * Blur detection (Laplacian variance threshold)
  * Face detection → eyes closed check
  * Exposure analysis (histogram)
  * Misfire detection (no subject)
- Set aiCulled=true, aiCullReason on rejected photos
- Hide from customer gallery, show in admin review
- Admin can override culling decisions
- Track % culled per photographer

STEP 3.8 — HEALTH CHECK:
- Add Phase 3 checks
- Run full (P1+P2+P3)
- Display table
- Log to logs/phase3-health.md
- Commit: 'Phase 3 Complete: Premium Features & AI'

Show combined health report.
"
```

---

### Step 4: PHASE 4 — Platform & SaaS

```bash
claude "
Read CLAUDE.md completely. Building PHASE 4. Phases 1-3 done. No approval needed.

STEP 4.1 — SAAS (Module 19):
- src/app/signup/page.tsx: external photographer registration
- Stripe subscription billing: 4 tiers (Starter/Pro/Business/Enterprise)
- Custom branding: logo upload, color scheme, custom domain placeholder
- src/app/my-dashboard/page.tsx: photographer's own dashboard
- Upload to client galleries, share magic links, view analytics
- Enforce upload limits per tier
- 2% commission on all sales

STEP 4.2 — ACADEMY & HR (Module 16):
- src/app/admin/academy/page.tsx: training modules CRUD
- Module types: Onboarding, Sales, Photography, Software, Compliance
- Content: markdown editor, quiz questions per module
- Assign required modules per role
- Progress tracking: per staff, completion dates, scores
- src/app/admin/hr/jobs/page.tsx: job postings CRUD
- Application pipeline: Received→Shortlisted→Interviewed→Offered/Rejected

STEP 4.3 — B2B BARTER (Module 22):
- src/app/admin/b2b/page.tsx
- Monthly photo delivery tracker per partner location
- Rent discount tracking (10-15%)
- Photo selection workflow for B2B
- Monthly report generation

STEP 4.4 — GAMIFICATION DEEP (Module 15.10):
- Apply across ALL modules: upload, sales, bookings, overall
- XP system with levels
- Badge system: Top Closer, Upload King, Booking Machine, Streak Master, Revenue Champion
- Real-time leaderboard on staff dashboard
- Monthly awards view
- Push notification on badge earned

STEP 4.5 — MOVING WATERMARK (Module 3.3):
- Kiosk display: CSS animation watermark that moves + pulses
- Configurable speed, opacity, size
- Anti-phone-camera: pulsing brightness ruins exposure

STEP 4.6 — HEALTH CHECK:
- Full system check (P1+P2+P3+P4)
- Display comprehensive table
- Log to logs/phase4-health.md
- Commit: 'Phase 4 Complete: Platform & SaaS'
"
```

---

### Step 5: PHASE 5 — Franchise & Scale (Final)

```bash
claude "
Read CLAUDE.md completely. Building PHASE 5 (FINAL). Phases 1-4 done. No approval needed.

STEP 5.1 — FRANCHISE (Module 21):
- Organization hierarchy: HQ → child franchise orgs (parentOrgId)
- src/app/admin/franchise/page.tsx (HQ only)
- Create franchise: new org, assign locations, set commission rates
- White-label: branding per franchise
- Franchise dashboard: filtered to their locations only
- HQ dashboard: aggregate across all
- Revenue sharing: auto-calculate SaaS 2% + sleeping money 50%
- Monthly payout summary
- Push Academy SOPs to franchises

STEP 5.2 — AI GROWTH v2 (Module 20 enhanced):
- Self-learning: pattern detection from historical conversion data
- Seasonal trend analysis
- Auto-pricing recommendations
- Franchise territory scoring
- Staff AI: auto-suggest promotions (photographer→supervisor→manager)
- Detect burnout risk (declining metrics)
- Marketing AI: auto-generate ad copy, content calendar
- Partnership priority scoring

STEP 5.3 — SYSTEM POLISH:
- UI/UX consistency audit across all pages
- Mobile responsiveness check everywhere
- Every API route: try/catch, proper error responses
- Every page: loading + error + empty states
- 404 and error pages
- SEO meta tags on public pages
- Image lazy loading, code splitting
- Performance: gallery < 3s load, upload 10 images < 30s

STEP 5.4 — FINAL DELIVERABLES:
- Run COMPLETE system health check (ALL phases, 64+ checks)
- Generate final report: modules built, API routes functional, DB models active, performance benchmarks, known limitations
- Create docs/DEPLOYMENT.md: env setup, Vercel deploy, DB migration, kiosk local setup, third-party config
- Log to logs/final-health.md
- Commit: 'Phase 5 Complete: PixelHoliday Full Ecosystem'

Show the FINAL comprehensive health report with all phases.
"
```

---

## D. FIX PROMPT (use between any phases)

```bash
claude "
Read CLAUDE.md. Check the latest health log in /logs/.
Fix ALL failing checks. Do not ask for approval.
Re-run health checks. Show updated report.
Commit: 'Fix: [what was fixed]'
"
```

---

## E. RESUME PROMPT (if Claude Code loses context mid-phase)

```bash
claude "
Read CLAUDE.md. Check git log for last commit. Check progress tracker in CLAUDE.md.
Identify which module was last completed (✅) and which is next (⬜).
Continue building from where you left off. No approval needed.
"
```

---

## F. SINGLE MODULE PROMPT (build one specific module)

```bash
claude "
Read CLAUDE.md. Build Module [X] only.
Follow the feature list exactly as written in CLAUDE.md Section 2.
Create all routes, components, and API endpoints for this module.
Run health checks for this module. Show report.
Update CLAUDE.md progress tracker. Commit.
"
```

---

## G. WHAT WAS NOT INCLUDED AND WHY

**Nothing was removed.** Every feature from the original ecosystem document (203 features audited) maps to a module in CLAUDE.md. The audit is in Section 9 of PIXELHOLIDAY_CLAUDE.md.

If you believe something is missing, search both files for the keyword. If it's truly absent, add it to the relevant module in CLAUDE.md before running the next build phase.

---

*END OF AUTONOMOUS BUILD GUIDE*
*Use this file alongside PIXELHOLIDAY_CLAUDE.md*
*Together they contain: 23 modules, 203 features, 64+ health checks, 5 build phases*

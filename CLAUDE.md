# CLAUDE.md — PIXELHOLIDAY MASTER ARCHITECTURE
# ════════════════════════════════════════════════
# PURPOSE: This is the SINGLE SOURCE OF TRUTH for the entire PixelHoliday ecosystem.
# RULE: The AI agent MUST read this file at the start of EVERY coding session.
# RULE: No feature may be built that contradicts this document.
# RULE: If a module is completed, mark it ✅. If in progress, mark it 🔧. If not started, mark it ⬜.
# Last updated: 2026-04-07

---

## 0. PROJECT IDENTITY

| Field | Value |
|-------|-------|
| **Project Name** | PixelHoliday (brand) / Pixeleco (codebase) |
| **Core Business** | High-volume resort photography delivery & e-commerce SaaS |
| **Verticals** | Hotels, Water Parks, Attractions, Self-Service Kiosks |
| **Revenue Model** | SaaS (2% commission on sales) + 50% of "sleeping money" (automated post-trip sales) |
| **Target Scale** | 100+ photographers, thousands of galleries/day, 1M→10M revenue in 5 years |
| **Tech Stack** | Next.js 14 (App Router), Prisma, PostgreSQL, Cloudflare R2, Cloudinary, Stripe, WhatsApp Cloud API, Resend, TailwindCSS |
| **Deployment** | Vercel (web) + Local kiosk network (offline-first) |
| **AI Engine** | Integrated AI for culling, face recognition, auto-reels, growth, SEO, marketing, staff management |

---

## 1. DATABASE SCHEMA (Prisma)

### 1.1 Core Models

```prisma
// ── USERS & AUTH ──────────────────────────────
model Organization {
  id            String   @id @default(cuid())
  name          String   // "PixelHoliday Tunisia" or franchise name
  type          OrgType  // HEADQUARTERS, FRANCHISE
  parentOrgId   String?  // null = HQ, otherwise = franchise parent
  parentOrg     Organization? @relation("FranchiseTree", fields: [parentOrgId], references: [id])
  children      Organization[] @relation("FranchiseTree")
  locations     Location[]
  staff         User[]
  subscriptionTier SubscriptionTier @default(STARTER)
  saasCommissionRate Float @default(0.02) // 2% of sales
  sleepingMoneyShare Float @default(0.50) // 50% of automated post-trip sales
  createdAt     DateTime @default(now())
}

model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  phone         String?
  pin           String?  // For kiosk/POS cash operations
  role          StaffRole
  orgId         String
  org           Organization @relation(fields: [orgId], references: [id])
  locationId    String?
  location      Location? @relation(fields: [locationId], references: [id])
  isRepeater    Boolean  @default(false) // Returning seasonal staff
  repeaterYears Int      @default(0)     // Each year = +€100 salary, max +€1500
  salary        Float?
  rating        Float    @default(0)     // Performance rating
  equipmentAssignments EquipmentAssignment[]
  galleries     Gallery[] @relation("PhotographerGalleries")
  appointments  Appointment[] @relation("AssignedPhotographer")
  commissions   Commission[]
  shifts        Shift[]
  housing       StaffHousing?
  blogPosts     BlogPost[]
  chatMessages  ChatMessage[]
  createdAt     DateTime @default(now())
}

enum StaffRole {
  CEO
  OPERATIONS_MANAGER
  SUPERVISOR
  PHOTOGRAPHER
  SALES_STAFF
  RECEPTIONIST
  ACADEMY_TRAINEE
}

enum OrgType {
  HEADQUARTERS
  FRANCHISE
}

enum SubscriptionTier {
  STARTER     // Solo photographer, gallery-only (like Pixieset)
  PROFESSIONAL // Small team, kiosk + gallery
  BUSINESS    // Multi-location, full ecosystem
  ENTERPRISE  // Franchise, white-label
}

// ── LOCATIONS ─────────────────────────────────
model Location {
  id            String   @id @default(cuid())
  name          String   // "Hilton Monastir", "AquaSplash Water Park"
  type          LocationType
  orgId         String
  org           Organization @relation(fields: [orgId], references: [id])
  address       String?
  partnerCommission Float? // % given to hotel/park
  rentCost      Float?   // Monthly rent for the location
  qrCodes       QRCode[]
  staff         User[]
  galleries     Gallery[]
  equipment     Equipment[]
  b2bDeliveries B2BDelivery[]
  createdAt     DateTime @default(now())
}

enum LocationType {
  HOTEL
  WATER_PARK
  ATTRACTION
  SELF_SERVICE
}

// ── CUSTOMERS ─────────────────────────────────
model Customer {
  id            String   @id @default(cuid())
  name          String?
  email         String?
  whatsapp      String?  // Primary contact method
  roomNumber    String?
  faceVector    Bytes?   // AI face recognition embedding (deleted after match per GDPR)
  wristbandCode String?  // QR/NFC wristband ID
  nfcTag        String?
  hasDigitalPass Boolean @default(false)
  digitalPassType DigitalPassType?
  locationId    String?
  galleries     Gallery[]
  orders        Order[]
  cartAbandoned Boolean  @default(false)
  cartAbandonedAt DateTime?
  createdAt     DateTime @default(now())
}

enum DigitalPassType {
  BASIC         // Pre-paid photo package
  UNLIMITED     // All photos during stay
  VIP           // Priority + sunset sessions
}

// ── GALLERIES ─────────────────────────────────
model Gallery {
  id              String   @id @default(cuid())
  magicLinkToken  String   @unique @default(cuid())
  status          GalleryStatus
  locationId      String
  location        Location @relation(fields: [locationId], references: [id])
  photographerId  String
  photographer    User     @relation("PhotographerGalleries", fields: [photographerId], references: [id])
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  roomNumber      String?
  photos          Photo[]
  videos          Video[]
  hookImageId     String?  // The single "best" photo for O2O tease
  expiresAt       DateTime // FOMO timer (e.g., 7 days)
  appointment     Appointment?
  order           Order?
  partialPurchase Boolean  @default(false) // Did they buy only some photos?
  purchasedCount  Int      @default(0)
  totalCount      Int      @default(0)
  sweepUpSentAt   DateTime? // When the 7-day discount was sent
  discountPercent Float?    // e.g., 0.50 for 50% off remaining
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum GalleryStatus {
  HOOK_ONLY       // O2O: only hook image visible, drives to kiosk
  PREVIEW_ECOM    // Online: watermarked preview, Stripe checkout
  PAID            // Unlocked: full high-res downloads
  PARTIAL_PAID    // Some photos purchased (kiosk upsell)
  DIGITAL_PASS    // Pre-paid pass, auto-deliver
  EXPIRED         // Past the FOMO window
}

// ── PHOTOS & VIDEOS ───────────────────────────
model Photo {
  id              String   @id @default(cuid())
  galleryId       String
  gallery         Gallery  @relation(fields: [galleryId], references: [id])
  s3Key_highRes   String   // Cloudflare R2 key (original)
  s3Key_raw       String?  // RAW file key (if uploaded)
  cloudinaryId    String?  // For watermarking & transformations
  isHookImage     Boolean  @default(false)
  isFavorited     Boolean  @default(false)
  isPurchased     Boolean  @default(false)
  isRetouched     Boolean  @default(false)
  aiCulled        Boolean  @default(false) // true = AI rejected this photo
  aiCullReason    String?  // "eyes_closed", "blurry", "misfire"
  hasMagicElement Boolean  @default(false) // AR/3D overlay added
  magicElementId  String?  // Which AR asset was used
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
}

model Video {
  id              String   @id @default(cuid())
  galleryId       String
  gallery         Gallery  @relation(fields: [galleryId], references: [id])
  s3Key           String
  type            VideoType
  duration        Int?     // seconds
  isAutoReel      Boolean  @default(false) // AI-generated from burst photos
  musicTrackId    String?
  graphicOverlay  String?  // e.g., "Tunisia Summer 2026"
  createdAt       DateTime @default(now())
}

enum VideoType {
  RAW_CLIP        // Photographer-shot video
  SLOW_MOTION     // High-framerate slow-mo
  AUTO_REEL       // AI-stitched from burst photos
  HIGHLIGHT       // AI-compiled highlight reel
}

// ── APPOINTMENTS & BOOKINGS ───────────────────
model Appointment {
  id                    String   @id @default(cuid())
  galleryId             String   @unique
  gallery               Gallery  @relation(fields: [galleryId], references: [id])
  scheduledTime         DateTime
  status                AppointmentStatus
  assignedPhotographerId String
  assignedPhotographer  User     @relation("AssignedPhotographer", fields: [assignedPhotographerId], references: [id])
  source                BookingSource
  qrCodeId              String?
  qrCode                QRCode?  @relation(fields: [qrCodeId], references: [id])
  createdAt             DateTime @default(now())
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  NO_SHOW
}

enum BookingSource {
  HOOK_GALLERY    // From the O2O hook page
  QR_CODE         // From hotel room / reception QR
  VIP_BOOKING     // From VIP concierge system
  WALK_IN         // Direct kiosk walk-in
  PRE_ARRIVAL     // Booked before arriving at hotel
  WEBSITE         // From portfolio website
}

// ── ORDERS & PAYMENTS ─────────────────────────
model Order {
  id              String   @id @default(cuid())
  galleryId       String   @unique
  gallery         Gallery  @relation(fields: [galleryId], references: [id])
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  amount          Float
  currency        String   @default("EUR")
  paymentMethod   PaymentMethod
  stripeSessionId String?
  stripePaymentId String?
  cashPin         String?  // Staff PIN who processed cash
  status          OrderStatus
  items           OrderItem[]
  commissions     Commission[]
  isAutomatedSale Boolean  @default(false) // sleeping money
  discountApplied Float?   // e.g., 0.15 for 15% abandoned cart discount
  createdAt       DateTime @default(now())
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  type      OrderItemType
  photoId   String?
  videoId   String?
  quantity  Int      @default(1)
  unitPrice Float
}

enum OrderItemType {
  SINGLE_PHOTO
  FULL_GALLERY
  PARTIAL_GALLERY
  PRINTED_ALBUM
  VIDEO_CLIP
  AUTO_REEL
  MAGIC_SHOT      // AR/3D overlay photo
  DIGITAL_PASS
  SOCIAL_MEDIA_PACKAGE
}

enum PaymentMethod {
  STRIPE_ONLINE
  STRIPE_TERMINAL  // Physical card reader at kiosk
  CASH
}

enum OrderStatus {
  PENDING
  COMPLETED
  REFUNDED
  FAILED
}

// ── COMMISSIONS & PAYROLL ─────────────────────
model Commission {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])
  type            CommissionType
  amount          Float
  rate            Float    // e.g., 0.10 for 10%
  isPaid          Boolean  @default(false)
  paidAt          DateTime?
  month           String?  // "2026-04" for monthly payroll
}

enum CommissionType {
  PHOTO_SALE           // From kiosk or online sale
  DIGITAL_PASS_SALE    // From selling a digital pass
  APPOINTMENT_BOOKING  // Per appointment driven
  QR_REFERRAL          // Receptionist referral commission (5%)
  SLEEPING_MONEY       // Automated post-trip sale
}

// ── QR CODES ──────────────────────────────────
model QRCode {
  id            String   @id @default(cuid())
  code          String   @unique
  type          QRCodeType
  locationId    String
  location      Location @relation(fields: [locationId], references: [id])
  assignedToStaffId String? // If receptionist-specific for tracking
  scanCount     Int      @default(0)
  appointments  Appointment[]
  createdAt     DateTime @default(now())
}

enum QRCodeType {
  HOTEL_ROOM        // In-room card
  RECEPTION_DESK    // At check-in
  LOBBY_SIGN        // VIP booking sign
  WRISTBAND         // Waterproof QR wristband
  WELCOME_ARCHWAY   // Arrival photo station
}

// ── EQUIPMENT TRACKING ────────────────────────
model Equipment {
  id            String   @id @default(cuid())
  name          String   // "Nikon D7000 #3"
  type          String   // "Camera", "Lens", "iPad", "Kiosk TV"
  serialNumber  String?
  purchaseCost  Float?
  locationId    String
  location      Location @relation(fields: [locationId], references: [id])
  assignments   EquipmentAssignment[]
  status        EquipmentStatus @default(AVAILABLE)
}

enum EquipmentStatus {
  AVAILABLE
  ASSIGNED
  MAINTENANCE
  RETIRED
}

model EquipmentAssignment {
  id            String   @id @default(cuid())
  equipmentId   String
  equipment     Equipment @relation(fields: [equipmentId], references: [id])
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  assignedAt    DateTime @default(now())
  returnedAt    DateTime?
}

// ── STAFF MANAGEMENT ──────────────────────────
model Shift {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  date          DateTime
  startTime     DateTime
  endTime       DateTime
  locationId    String
}

model StaffHousing {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  address       String
  monthlyCost   Float
  documentation String?  // Link to contract/docs
}

model StaffTransfer {
  id            String   @id @default(cuid())
  userId        String
  fromLocationId String
  toLocationId  String
  transferDate  DateTime
  reason        String?
  approvedBy    String?
  createdAt     DateTime @default(now())
}

// ── CHAT & COMMUNICATION ──────────────────────
model ChatMessage {
  id            String   @id @default(cuid())
  senderId      String
  sender        User     @relation(fields: [senderId], references: [id])
  channelId     String   // "location:{id}", "staff:{id1}:{id2}", "global"
  content       String
  createdAt     DateTime @default(now())
}

// ── AI & CONTENT ──────────────────────────────
model BlogPost {
  id            String   @id @default(cuid())
  title         String
  content       String
  authorId      String
  author        User     @relation(fields: [authorId], references: [id])
  isAIGenerated Boolean  @default(true)
  status        ContentStatus @default(DRAFT)
  seoKeywords   String[]
  featuredPhotos String[] // Photo IDs to showcase
  createdAt     DateTime @default(now())
  publishedAt   DateTime?
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model AIGrowthLog {
  id            String   @id @default(cuid())
  type          AIActionType
  description   String
  result        String?
  dataSnapshot  Json?    // What data the AI analyzed
  createdAt     DateTime @default(now())
}

enum AIActionType {
  STAFF_PROMOTION_SUGGESTION
  PRICING_OPTIMIZATION
  PARTNER_DISCOVERY
  SEO_UPDATE
  MARKETING_CAMPAIGN
  BOOKING_BOOST
  PHOTOGRAPHER_PERFORMANCE_FLAG
  FRANCHISE_LEAD
}

// ── B2B MEDIA BARTER ──────────────────────────
model B2BDelivery {
  id            String   @id @default(cuid())
  locationId    String
  location      Location @relation(fields: [locationId], references: [id])
  month         String   // "2026-04"
  photoCount    Int
  deliveredAt   DateTime?
  rentDiscountPercent Float? // Negotiated discount (10-15%)
  notes         String?
}

// ── MAGIC ELEMENTS (AR/3D) ────────────────────
model MagicElement {
  id            String   @id @default(cuid())
  name          String   // "Pirate Parrot", "Fennec Fox", "Dragon"
  type          MagicElementType
  assetUrl      String   // 3D model or overlay image URL
  category      String?  // "Animals", "Fantasy", "Local Culture"
  isActive      Boolean  @default(true)
}

enum MagicElementType {
  THREE_D_CHARACTER  // 3D rendered character
  AR_OVERLAY         // Augmented reality effect
  BACKGROUND_REPLACE // Green screen replacement
  GRAPHIC_OVERLAY    // Text/graphic watermark ("Tunisia Summer 2026")
}

// ── ACADEMY & HR ──────────────────────────────
model AcademyModule {
  id            String   @id @default(cuid())
  title         String
  description   String
  type          AcademyModuleType
  contentUrl    String?
  sortOrder     Int
  isRequired    Boolean  @default(false)
}

enum AcademyModuleType {
  ONBOARDING
  SALES_TRAINING
  PHOTOGRAPHY_TECHNIQUE
  SOFTWARE_TRAINING
  COMPLIANCE        // GDPR, safety
}

model AcademyProgress {
  id            String   @id @default(cuid())
  userId        String
  moduleId      String
  completed     Boolean  @default(false)
  completedAt   DateTime?
  score         Float?   // Quiz score
}

model JobPosting {
  id            String   @id @default(cuid())
  title         String
  locationId    String?
  requirements  String
  status        JobStatus @default(OPEN)
  applications  JobApplication[]
  createdAt     DateTime @default(now())
}

enum JobStatus {
  OPEN
  FILLED
  CLOSED
}

model JobApplication {
  id            String   @id @default(cuid())
  jobId         String
  job           JobPosting @relation(fields: [jobId], references: [id])
  applicantName String
  applicantEmail String
  cvUrl         String?
  status        ApplicationStatus @default(RECEIVED)
  createdAt     DateTime @default(now())
}

enum ApplicationStatus {
  RECEIVED
  SHORTLISTED
  INTERVIEWED
  OFFERED
  REJECTED
}
```

---

## 2. SYSTEM MODULES — COMPLETE FEATURE MAP

Every feature from the ecosystem document is listed below. **Nothing has been removed.**
Each module has a status tracker and a build order priority (P1 = build first, P5 = build last).

---

### MODULE 1: UPLOAD HUB (PixelManager Admin Panel) — P1 ⬜

**Route:** `/admin/upload`

**Features:**
- [ ] **1.1** Left panel: Form — Select Location (hotel/park/attraction), Room Number, Customer WhatsApp/Email, Gallery Status toggle, Select Photographer
- [ ] **1.2** Right panel: `react-dropzone` with thumbnail previews after drop
- [ ] **1.3** "Star" icon on thumbnails to set `isHookImage = true` (exactly ONE per gallery)
- [ ] **1.4** Dual-Tactic Toggle:
  - Tactic 1 (Pre-Paid): Instant delivery of unwatermarked files
  - Tactic 2 (E-Commerce/Hook): Upload hook photo only to customer; photographer selects photos to send after payment
- [ ] **1.5** Direct-to-R2 upload via presigned URLs (NEVER through Next.js server)
- [ ] **1.6** Accept JPG, RAW, and Video files
- [ ] **1.7** Phone app companion: Camera → direct upload to kiosk gallery (photographer's phone connects to camera, uploads directly to sale point)
- [ ] **1.8** Bulk upload: Support 100+ photos per session
- [ ] **1.9** AI Culling pre-filter: Before upload completes, AI auto-rejects eyes-closed, blurry, misfires (saves storage & improves customer experience)
- [ ] **1.10** Speed camera integration: Nikon D7000 tethered shooting → instant transfer to system
- [ ] **1.11** Instant camera-to-cloud pipeline (like Zno): Photographer shoots → photo appears in cloud gallery within seconds

**Technical Notes:**
- Presigned URL flow: Client → API (generate URL) → Client uploads directly to R2
- AI culling runs as a background job on upload (lightweight model)
- RAW files stored separately, JPG generated for preview

---

### MODULE 2: CUSTOMER GALLERY — P1 ⬜

**Route:** `/gallery/[magicLinkToken]`

**Features:**
- [ ] **2.1** Dynamic rendering based on `Gallery.status`:
  - `HOOK_ONLY`: Show ONLY the hook image (watermarked) + booking time picker
  - `PREVIEW_ECOM`: Pinterest-style masonry grid, all watermarked, Stripe checkout button
  - `PAID`: Full high-res images with download icons
  - `PARTIAL_PAID`: Mix of unlocked + watermarked remaining
  - `DIGITAL_PASS`: Auto-delivered, no paywall
- [ ] **2.2** Favorites system: Heart icon overlay, toggles `Photo.isFavorited` via Server Action, "Show Favorites Only" filter
- [ ] **2.3** FOMO timer: Countdown to `Gallery.expiresAt` displayed prominently
- [ ] **2.4** Gallery design inspired by Pixieset: Clean, modern, luxury aesthetic (customers are on holiday — positive, warm design)
- [ ] **2.5** Video & Reel display: Embedded video player for clips and auto-reels
- [ ] **2.6** Social media package grouping: Photos + video clip bundled together visually
- [ ] **2.7** "Magic Shot" indicator: Special badge on AR/3D enhanced photos
- [ ] **2.8** Mobile-first responsive design
- [ ] **2.9** Download individual photos (PAID status)
- [ ] **2.10** "Download All (ZIP)" button (PAID status) — uses serverless Cloudinary archive

**Technical Notes:**
- Passwordless access via `magicLinkToken` (no login required)
- Server-side watermarking via Cloudinary (see Module 3)
- Gallery should feel like a premium photo portfolio site

---

### MODULE 3: SERVER-SIDE WATERMARKING (Security) — P1 ⬜

**Features:**
- [ ] **3.1** Cloudinary dynamic watermarking:
  - Scale watermark to 50% width (`w_0.5`)
  - Center position (`g_center`)
  - 40% opacity (`o_40`)
  - Compressed to 60% quality WebP (`q_60, f_webp`)
- [ ] **3.2** Custom Next.js Image Loader: `<WatermarkedImage publicId={id} />`
- [ ] **3.3** Moving/animated watermark for kiosk displays: Pulsing brightness that ruins phone camera captures
- [ ] **3.4** CSS/HTML overlays are FORBIDDEN — all watermarking must be server-side

**Security Rules:**
- Never expose original high-res URLs to unpaid customers
- Watermark transformation applied at CDN level
- No client-side watermark removal possible

---

### MODULE 4: STRIPE PAYMENTS & AUTOMATION — P1 ⬜

**Features:**
- [ ] **4.1** Stripe Checkout: Pass `galleryId` in session metadata
- [ ] **4.2** Webhook endpoint: `app/api/webhooks/stripe/route.ts`
  - Verify signature with `stripe.webhooks.constructEvent`
  - On `checkout.session.completed`: Update Gallery status → PAID
  - Trigger delivery email via Resend
- [ ] **4.3** Stripe Terminal integration for kiosk POS (physical card reader)
- [ ] **4.4** Cash payment processing with staff PIN tracking
- [ ] **4.5** Multiple pricing tiers:
  - Single photo
  - Partial gallery (10-photo package)
  - Full digital gallery (€49-€130)
  - Printed luxury album (€150)
  - Video add-on (30 TND)
  - Magic Shot add-on (20 TND)
  - Digital Pass (150 TND pre-arrival)
  - Social Media Package
- [ ] **4.6** SaaS commission auto-deduction: 2% of every transaction
- [ ] **4.7** Sleeping money: 50% revenue share on automated post-trip sales

---

### MODULE 5: O2O HOOK ENGINE (Online-to-Offline) — P1 ⬜

**Flow:**
1. Photographer uploads → selects hook image
2. System sends WhatsApp message with magic link
3. Customer sees ONLY the hook image (watermarked)
4. Below image: Time picker to book kiosk viewing
5. Appointment created → Photographer's iPad + app pinged
6. Customer arrives at kiosk → face-to-face close

**Features:**
- [ ] **5.1** WhatsApp Cloud API integration: Instant ping after upload
- [ ] **5.2** Magic link delivery (passwordless)
- [ ] **5.3** Calendar/time-picker booking UI
- [ ] **5.4** Appointment notification to photographer (push + iPad alert)
- [ ] **5.5** "Uber-style" photographer dispatch for VIP bookings (pings highest-rated photographer)

---

### MODULE 6: KIOSK / IPAD POS — P2 ⬜

**App:** Dedicated iPad/Touch Screen application

**Features:**
- [ ] **6.1** Presentation mode: No admin settings visible, pure visual luxury
- [ ] **6.2** Full unwatermarked gallery display on retina screen
- [ ] **6.3** Heart/favorite icons directly on kiosk for customer interaction
- [ ] **6.4** "Edit before Complete Sale" flow: Photographer selects which photos customer receives BEFORE tapping Complete
- [ ] **6.5** Payment methods: Stripe Terminal (card), Cash (with staff PIN)
- [ ] **6.6** Instant unlock: Purchased photos appear on customer's phone immediately
- [ ] **6.7** Local network operation: Kiosk connects to local Wi-Fi router, works WITHOUT internet
- [ ] **6.8** Night sync: Upload transactions to cloud dashboard when connection is stable
- [ ] **6.9** TV with camera: Detects customer approaching kiosk, auto-displays their images on screen (face recognition trigger)
- [ ] **6.10** Multiple touch screens per sale point: Connected via local network, shared image display
- [ ] **6.11** Unlimited touch screens can connect to one sale point
- [ ] **6.12** Sale point has both office (back-end) and customer-facing (front-end) modes

**Architecture:**
- Local-first: SSD ↔ Kiosk ↔ Local Wi-Fi (closed loop, no internet needed)
- Sync engine: Background process pushes data to cloud when online
- Nikon D7000 → SSD → Kiosk (all local network)

---

### MODULE 7: CUSTOMER IDENTIFICATION SYSTEMS — P2 ⬜

Multiple methods (configurable per location):

- [ ] **7.1** AI Face Recognition (Pomvom method):
  - Customer takes selfie → AI converts to vector → matches against all photos in milliseconds
  - Works with sunglasses, hats, expressions
  - GDPR: Selfie deleted immediately after match
- [ ] **7.2** QR Wristband (Scene to Believe method):
  - Waterproof rubber wristband with QR code
  - Photographer scans wristband → all subsequent photos auto-tagged to that customer
  - Customer scans wristband at kiosk exit → sees only their photos
- [ ] **7.3** NFC tag identification
- [ ] **7.4** Room number lookup
- [ ] **7.5** Magic link / code entry
- [ ] **7.6** "Welcome Archway" capture at check-in: Family photo at floral archway, QR card given immediately

---

### MODULE 8: AUTOMATED SALES ENGINE ("Sleeping Money") — P2 ⬜

**Features:**
- [ ] **8.1** Abandoned Cart Auto-Responder:
  - If customer views gallery but doesn't buy → wait 3 days
  - Send WhatsApp: "Missing the Tunisian sun? Get your memories now at 15% off!"
  - Track `cartAbandoned` and `cartAbandonedAt` in Customer model
- [ ] **8.2** 7-Day Sweep-Up:
  - If customer bought only partial gallery at kiosk
  - After 7 days, send: "Unlock remaining 90 photos for 50% off!"
  - System tracks `partialPurchase`, `purchasedCount`, `totalCount`
- [ ] **8.3** Stripe webhook catches all online payments automatically
- [ ] **8.4** Auto-delivery email with magic link after payment
- [ ] **8.5** Serverless ZIP generation via Cloudinary `generate_archive` API (NOT on Next.js server)
- [ ] **8.6** Scheduled discount campaigns (configurable timing and discount %)

---

### MODULE 9: AI AUTO-REEL ENGINE — P3 ⬜

**Features:**
- [ ] **9.1** Burst photo detection: When 5-10 photos are taken in rapid succession
- [ ] **9.2** Auto-stitch into 3-second looping video (GIF/MP4)
- [ ] **9.3** Graphic overlay: "Tunisia Summer 2026" (configurable per location/season)
- [ ] **9.4** Music track library: Royalty-free tracks, auto-applied
- [ ] **9.5** Sells as "Digital Video Add-on" (30 TND, 0 TND production cost)
- [ ] **9.6** Photographer-shot slow-motion video support (gimbal/phone)
- [ ] **9.7** Premium Social Media Package: Photos + video clip bundled

---

### MODULE 10: MAGIC SHOTS & AR — P3 ⬜

**Features:**
- [ ] **10.1** "Magic Element" overlay system:
  - 3D pirate parrot on dad's shoulder
  - Animated fennec fox next to child
  - Pirate ship in background
  - Custom elements per location
- [ ] **10.2** Green screen / AI background replacement
- [ ] **10.3** "XLfie" panoramic: Camera mounted high up, remote trigger, sweeping panoramic with guest
- [ ] **10.4** Magic Shot charged as add-on (20 TND per shot, $0 production cost)
- [ ] **10.5** MagicElement asset library in admin panel

---

### MODULE 11: PRE-ARRIVAL SALES FUNNEL — P2 ⬜

**Features:**
- [ ] **11.1** Hotel booking API integration:
  - When tourist books room → automated email: "Upgrade with PixelHoliday Unlimited Digital Wallet for 150 TND"
  - Payment collected before arrival
- [ ] **11.2** Digital Pass types: Basic, Unlimited, VIP
- [ ] **11.3** VIP Photo Pass wristband/QR: Photographer scans at location, guest treated as royalty
- [ ] **11.4** QR code pre-booking:
  - In-room cards, reception desk signs, lobby displays
  - Guest scans → selects time slot → requests specific photographer
  - Receptionist gets 5% commission per booking from their QR code
- [ ] **11.5** "Welcome Archway" arrival capture: Professional family photo at check-in, QR card given
- [ ] **11.6** Digital Pass sale at park/hotel arrival: Staff sells passes on-site

---

### MODULE 12: REAL-TIME STREAMING TO MOBILE — P3 ⬜

**Features:**
- [ ] **12.1** For Digital Pass holders:
  - Automated camera snaps photo → face recognition matches account
  - WhatsApp/push notification sent to customer's phone BEFORE they get off the ride
- [ ] **12.2** Instant gratification → drives social media sharing (free marketing)
- [ ] **12.3** Speed camera system: Nikon D7000 + software integration

---

### MODULE 13: PRO RETOUCH (like Zno.com) — P3 ⬜

**Features:**
- [ ] **13.1** Photo retouching interface for photographers
- [ ] **13.2** AI-assisted retouching: Auto color correction, skin smoothing
- [ ] **13.3** Batch retouching presets per location/style
- [ ] **13.4** Before/after comparison view
- [ ] **13.5** Retouch status tracking (`isRetouched` on Photo model)

---

### MODULE 14: ANALYTICS & CEO DASHBOARD — P2 ⬜

**Route:** `/admin/dashboard`

**Features:**
- [ ] **14.1** CEO Overview: Total Revenue, Pending Payouts, Revenue by Hotel/Park/Attraction
- [ ] **14.2** Conversion Tracking: Galleries Uploaded vs. Galleries Sold
  - Flag photographers with low conversion for sales training
- [ ] **14.3** Automated Payroll / Commission Dashboard:
  - Commission types: Photo sale, Digital Pass sale, Appointment booking, QR referral, Sleeping money
  - Monthly "Commission Owed" column → pay staff → "Mark as Paid"
- [ ] **14.4** Staff Cost Leaderboard: Most expensive vs. lowest cost staff
- [ ] **14.5** Revenue by time period, location, photographer
- [ ] **14.6** Digital Pass sales tracking
- [ ] **14.7** Automated sales (sleeping money) vs. manual sales breakdown
- [ ] **14.8** B2B media barter tracking: Photos delivered to hotels, rent discounts negotiated
- [ ] **14.9** Equipment cost tracking

---

### MODULE 15: STAFF MANAGEMENT — P2 ⬜

**Features:**
- [ ] **15.1** Shift management: Assign shifts by location, track attendance
- [ ] **15.2** Staff transfer between locations (via system)
- [ ] **15.3** Repeater system:
  - `isRepeater` flag → returning seasonal staff
  - Each year: +€100 salary, max +€1500 total bonus
  - System auto-detects high performers
- [ ] **15.4** AI promotion suggestions:
  - System detects good photographers → suggests to CEO: "Promote to Supervisor"
  - Automated suggestions for: Operations Manager, Supervisor, next park, next hotel
- [ ] **15.5** Performance leaderboard: Sales closed, galleries uploaded, conversion rate, customer ratings
- [ ] **15.6** Equipment assignment tracking: Who has what, costs per person
- [ ] **15.7** Housing management: Address, monthly cost, documentation per staff member
- [ ] **15.8** Staff cost management: Total cost per person (salary + housing + equipment)
- [ ] **15.9** Internal chat system: Staff ↔ Staff, Staff ↔ Company channels
- [ ] **15.10** Gamification across ALL use cases:
  - Daily/weekly targets with progress bars
  - Badges: "Top Closer", "Upload King", "Booking Machine"
  - Leaderboards with real-time rankings
  - Bonus unlocks for hitting milestones

---

### MODULE 16: ACADEMY & HR — P4 ⬜

**Features:**
- [ ] **16.1** Academy module system: Onboarding, Sales Training, Photography Technique, Software Training, Compliance (GDPR)
- [ ] **16.2** Progress tracking per staff member (quiz scores, completion)
- [ ] **16.3** AI reads all Pixel Academy documents to understand training content
- [ ] **16.4** Job posting & application management
- [ ] **16.5** Recruitment pipeline: Received → Shortlisted → Interviewed → Offered/Rejected

---

### MODULE 17: BOOKING MANAGEMENT — P2 ⬜

**Features:**
- [ ] **17.1** Booking system like Bokun: Calendar view, time slot management
- [ ] **17.2** VIP Concierge booking (DreamArt style): QR in lobbies → book sunset session → Uber-dispatch to highest-rated photographer
- [ ] **17.3** Admin booking management: View all appointments, filter by location/photographer/status
- [ ] **17.4** Photographer scheduling: Auto-assign based on availability and rating
- [ ] **17.5** Booking source tracking: Hook gallery, QR code, VIP, walk-in, pre-arrival, website

---

### MODULE 18: WEBSITE & PORTFOLIO — P3 ⬜

**Features:**
- [ ] **18.1** Portfolio website management: Showcase photographer work
- [ ] **18.2** SEO management (AI-led)
- [ ] **18.3** AI-generated professional blog: Editor selects photographer's best work, AI writes posts
- [ ] **18.4** Online shop (like Pixieset): Customers browse and purchase from web
- [ ] **18.5** Shop integration with 3D printed products (albums, canvases, etc.)
- [ ] **18.6** Review and tag dashboard: Customer reviews, photo tagging

---

### MODULE 19: ONLINE GALLERY CLOUD (SaaS for External Photographers) — P4 ⬜

**Features:**
- [ ] **19.1** External photographers can sign up and use gallery system (like Pixieset/Zno)
- [ ] **19.2** Subscription tiers: Starter, Professional, Business, Enterprise
- [ ] **19.3** Custom branding per photographer
- [ ] **19.4** Upload limit per tier (e.g., photos per day)
- [ ] **19.5** Each photographer gets their own client galleries
- [ ] **19.6** This is the SaaS revenue arm — separate from resort operations

---

### MODULE 20: AI GROWTH ENGINE — P3 ⬜

**Features:**
- [ ] **20.1** AI-led system management: Automatic optimization of pricing, scheduling, marketing
- [ ] **20.2** Self-learning AI: Learns from conversion data, staff performance, seasonal patterns
- [ ] **20.3** Booking boost automation: AI suggests optimal times, photographers, pricing
- [ ] **20.4** AI-powered ads & marketing:
  - Goal-based: Booking, Staff recruitment, Partnerships
  - Social media avatar bots: Chat as PixelHoliday marketing army on each platform
- [ ] **20.5** AI partnership discovery: Scans for new hotel/park partnership opportunities
- [ ] **20.6** AI franchise management: Lead scoring, territory analysis
- [ ] **20.7** Growth system: Automatic, AI-led, data-driven decisions
- [ ] **20.8** SEO managed by AI: Content optimization, keyword tracking, blog scheduling

---

### MODULE 21: FRANCHISE SYSTEM — P5 ⬜

**Features:**
- [ ] **21.1** Multi-org hierarchy: HQ → Franchise organizations
- [ ] **21.2** White-label branding per franchise
- [ ] **21.3** Revenue sharing: SaaS commission + sleeping money share
- [ ] **21.4** Centralized dashboard for HQ, filtered dashboards for franchisees
- [ ] **21.5** Franchise onboarding workflow
- [ ] **21.6** Standardized operating procedures (from Academy)

---

### MODULE 22: B2B MEDIA BARTER PORTAL — P4 ⬜

**Features:**
- [ ] **22.1** CEO Dashboard section: Track free promotional photos delivered to partner hotels
- [ ] **22.2** Monthly delivery tracking: 10 free high-end photos per hotel
- [ ] **22.3** Rent discount negotiation tracking (10-15% off yearly rent)
- [ ] **22.4** Zero labor cost: Photographers already on-site
- [ ] **22.5** Photo selection and approval workflow for B2B deliveries

---

### MODULE 23: COMMUNICATION ENGINE — P2 ⬜

**Features:**
- [ ] **23.1** WhatsApp Cloud API: Gallery delivery, booking confirmations, discount offers, sweep-up messages
- [ ] **23.2** Email (Resend/SendGrid): Receipts, gallery links, marketing
- [ ] **23.3** Push notifications: Appointment alerts, real-time photo delivery
- [ ] **23.4** Internal staff chat
- [ ] **23.5** Customer contact management: WhatsApp + Email as primary channels

---

## 3. BUILD ORDER & PHASES

### PHASE 1 — CORE REVENUE ENGINE (Months 1-3)
Priority: Get money flowing.

```
Week 1-2:   Database schema (Prisma) + Auth (NextAuth)
Week 3-4:   Upload Hub (Module 1: basic upload, hook selection, R2 presigned URLs)
Week 5-6:   Customer Gallery (Module 2: hook view, masonry grid, watermark, favorites)
Week 7-8:   Watermarking (Module 3) + Stripe Payments (Module 4)
Week 9-10:  O2O Hook Engine (Module 5: WhatsApp delivery, booking)
Week 11-12: Basic Kiosk POS (Module 6: presentation mode, payment, photo selection)
```

### PHASE 2 — OPERATIONS & MANAGEMENT (Months 4-6)
Priority: Scale the team.

```
Week 13-14: Analytics Dashboard (Module 14: revenue, conversions)
Week 15-16: Staff Management (Module 15: shifts, commissions, leaderboard)
Week 17-18: Booking Management (Module 17: calendar, dispatch)
Week 19-20: Customer ID Systems (Module 7: QR wristband first, face recognition later)
Week 21-22: Automated Sales Engine (Module 8: abandoned cart, 7-day sweep)
Week 23-24: Pre-Arrival Funnel (Module 11: digital passes, QR pre-booking)
            Communication Engine (Module 23: WhatsApp + Email templates)
```

### PHASE 3 — PREMIUM FEATURES & AI (Months 7-9)
Priority: Maximize revenue per customer.

```
Week 25-26: AI Auto-Reel (Module 9)
Week 27-28: Magic Shots & AR (Module 10)
Week 29-30: Real-Time Mobile Streaming (Module 12)
Week 31-32: Pro Retouch (Module 13)
Week 33-34: Website & Portfolio (Module 18)
Week 35-36: AI Growth Engine (Module 20: first iteration)
```

### PHASE 4 — PLATFORM & SAAS (Months 10-12)
Priority: Build recurring revenue.

```
Week 37-38: Online Gallery Cloud / SaaS (Module 19)
Week 39-40: Academy & HR (Module 16)
Week 41-42: B2B Media Barter (Module 22)
Week 43-44: Gamification layer across all modules (Module 15.10)
```

### PHASE 5 — FRANCHISE & SCALE (Year 2+)
Priority: Multiply the business.

```
Franchise System (Module 21)
AI self-learning optimization (Module 20 v2)
Multi-region deployment
Advanced analytics & predictive AI
```

---

## 4. API ROUTE MAP

```
/api/auth/[...nextauth]       — NextAuth authentication
/api/upload/presigned          — Generate R2 presigned URLs
/api/upload/complete           — Finalize upload, create Gallery record
/api/gallery/[token]           — Get gallery data by magic link
/api/gallery/[token]/favorite  — Toggle photo favorite
/api/gallery/[token]/book      — Create kiosk appointment
/api/gallery/[token]/download  — Generate serverless ZIP (Cloudinary)
/api/webhooks/stripe           — Stripe payment webhook
/api/webhooks/whatsapp         — WhatsApp incoming messages
/api/kiosk/gallery/[id]        — Kiosk gallery data (local network)
/api/kiosk/sale                — Process kiosk sale (card/cash)
/api/kiosk/sync                — Sync local data to cloud
/api/admin/dashboard           — Analytics data
/api/admin/staff               — Staff CRUD
/api/admin/commissions         — Commission calculations
/api/admin/equipment           — Equipment tracking
/api/admin/shifts              — Shift management
/api/admin/transfers           — Staff transfers
/api/admin/housing             — Housing management
/api/booking/create            — Create booking
/api/booking/dispatch          — Assign photographer
/api/ai/cull                   — AI photo culling
/api/ai/face-match             — Face recognition matching
/api/ai/auto-reel              — Generate auto-reel from burst
/api/ai/magic-shot             — Apply AR/3D overlay
/api/ai/growth                 — AI growth suggestions
/api/ai/blog                   — AI blog generation
/api/customer/identify         — Customer ID (face/QR/NFC/room)
/api/customer/digital-pass     — Digital pass management
/api/b2b/delivery              — B2B photo delivery tracking
/api/shop/products             — Online shop products
/api/shop/checkout             — Shop checkout
/api/franchise/[orgId]         — Franchise management
/api/academy/modules           — Academy content
/api/academy/progress          — Staff training progress
/api/chat/messages             — Internal chat
/api/chat/channels             — Chat channels
```

---

## 5. ENVIRONMENT VARIABLES REQUIRED

```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Cloudflare R2 (Object Storage)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Cloudinary (Watermarking & Transformations)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_WATERMARK_PUBLIC_ID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_TERMINAL_LOCATION_ID=

# WhatsApp Cloud API
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=

# Email (Resend)
RESEND_API_KEY=
FROM_EMAIL=

# AI Services
OPENAI_API_KEY=          # For face recognition vectors
AI_CULLING_MODEL_URL=    # Lightweight model endpoint

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_KIOSK_MODE=  # true for kiosk builds
```

---

## 6. CRITICAL ARCHITECTURE RULES

1. **NEVER process high-res uploads through Next.js server** — always use presigned URLs to R2/S3
2. **NEVER generate ZIPs on the server** — use Cloudinary `generate_archive` API
3. **NEVER use CSS/HTML watermarks** — always server-side via Cloudinary
4. **NEVER expose original file URLs to unpaid customers**
5. **ALWAYS verify Stripe webhook signatures** with `constructEvent`
6. **ALWAYS delete face vectors immediately after matching** (GDPR)
7. **Kiosk MUST work offline** — local-first architecture with background sync
8. **System must handle 100+ photographers uploading simultaneously**
9. **Each photographer can upload 100+ photos per session**
10. **Gallery expiration (FOMO timer) is enforced server-side**

---

## 7. THIRD-PARTY INTEGRATIONS

| Service | Purpose | Priority |
|---------|---------|----------|
| Cloudflare R2 | Object storage (photos/videos) | P1 |
| Cloudinary | Watermarking, transformations, ZIP generation | P1 |
| Stripe (Online) | Online payments | P1 |
| Stripe Terminal | Kiosk card payments | P1 |
| WhatsApp Cloud API | Customer messaging | P1 |
| Resend / SendGrid | Email delivery | P1 |
| NextAuth | Authentication | P1 |
| Face Recognition API | Customer matching | P2 |
| Hotel Booking APIs | Pre-arrival integration | P3 |
| Bokun-style Calendar | Booking management | P2 |

---

## 8. FIVE-YEAR ROADMAP (1M → 10M)

| Year | Revenue Target | Key Milestones |
|------|---------------|----------------|
| Y1 | €1M | Core platform live, 3-5 hotel/park locations, 20+ photographers |
| Y2 | €2.5M | SaaS launch, AI features, 10+ locations, first franchise |
| Y3 | €4M | Franchise expansion, 5+ franchise partners, AI growth engine v2 |
| Y4 | €7M | International expansion, 20+ franchise locations, advanced AR |
| Y5 | €10M | Market leader in resort photography SaaS, 50+ locations globally |

---

## 9. NOTHING WAS REMOVED — COMPLETE FEATURE AUDIT

Every single feature mentioned in the ecosystem document is accounted for above. Here is a cross-reference of features that might seem "hidden" in the modules:

| Original Feature | Where It Lives |
|-----------------|----------------|
| Hotels, Water Parks, Attractions, Self-Service | Module 1 (LocationType enum) |
| Phone app connects to camera | Module 1.7 |
| JPG + RAW + Video support | Module 1.6 |
| Digital Pass sales at arrival | Module 11.6 |
| Cloud for photographers (like Pixieset/Zno) | Module 19 |
| Instant camera to cloud | Module 1.11 |
| Pro retouch like Zno | Module 13 |
| Booking system like Bokun | Module 17 |
| Shop integration with 3D printed products | Module 18.5 |
| Cash operations with staff PIN | Module 4.4 + 6.5 |
| Commission calculation (appointment, sales, digital pass) | Module 14.3 |
| Franchise system | Module 21 |
| SaaS 2% commission + 50% sleeping money | Module 4.6 + 4.7 |
| AI leading data, SEO, manager, franchise, photographer | Module 20 |
| Academy management with HR recruitment | Module 16 |
| TV with camera detecting customers | Module 6.9 |
| Booking management admin | Module 17 |
| Website portfolio management | Module 18 |
| Review and tag dashboard | Module 18.6 |
| Staff shift control | Module 15.1 |
| Staff chat | Module 15.9 |
| Equipment tracking with costs | Module 15.6 |
| Modern welcome design (holiday positive) | Module 2.4 |
| Face recognition, wristband, NFC, room filters | Module 7 |
| Email + WhatsApp customer contact | Module 23 |
| iPad kiosk for sales | Module 6 |
| Office + online + touch screen + sale point | Module 6.12 |
| Growth system automatic AI-led | Module 20 |
| Self-learning AI | Module 20.2 |
| Upload system for external photographers | Module 19 |
| Management for repeater staff | Module 15.3 |
| 100 photographers, high traffic | Architecture Rule #8 |
| Staff transfers | Module 15.2 |
| Apartment management for staff | Module 15.7 |
| Staff cost leaderboard | Module 15.4 + 15.8 |
| AI blog management | Module 20, 18.3 |
| AI ads and marketing | Module 20.4 |
| Social media avatars | Module 20.4 |
| AI partnership discovery | Module 20.5 |
| Repeater salary system (+€100/year, max +€1500) | Module 15.3 |
| AI staff promotion suggestions | Module 15.4 |
| Gamification all use cases | Module 15.10 |
| Photographer working machine / booking boost | Module 20.3 |
| AI culling pre-filter | Module 1.9 |
| QR pre-booking via hotel | Module 11.4 |
| Abandoned cart responder | Module 8.1 |
| Reels video service | Module 9 |
| Selfie matching (Pomvom) | Module 7.1 |
| Pre-arrival VIP funnel (DEI) | Module 11 |
| Real-time streaming to mobile (Pomvom push) | Module 12 |
| XLfie & AR magic (DEI TriX) | Module 10 |
| Auto-Reel engine (Revl) | Module 9 |
| VIP Concierge (DreamArt) | Module 17.2 |
| Offline-First kiosk (Image Insight) | Module 6.7 |
| Roaming QR lanyard (Scene to Believe) | Module 7.2 |
| Disney Magic Shot method | Module 10 |
| Moving watermark anti-piracy | Module 3.3 |
| B2B Media Barter | Module 22 |
| Welcome archway arrival capture | Module 7.6 + 11.5 |
| Arrival Ambush (Carnival Cruise) | Module 11.5 |
| Speed camera + D7000 | Module 1.10 |

---

## 10. HOW TO USE THIS FILE

### For Claude / AI Agent:
```
1. READ this entire file before writing ANY code
2. CHECK which module you're building (look at ⬜/🔧/✅ status)
3. FOLLOW the build order in Section 3
4. RESPECT all architecture rules in Section 6
5. USE the exact Prisma models in Section 1
6. MATCH API routes to Section 4
7. After completing a feature, update its checkbox to ✅
```

### For the Human Developer:
```
1. Keep this file in the ROOT of your project as CLAUDE.md
2. Before every coding session, tell Claude: "Read CLAUDE.md first"
3. When you want to build a specific module, say: "Build Module X from CLAUDE.md"
4. Track progress by updating ⬜ → 🔧 → ✅
5. If you modify the plan, update this file FIRST
```

---

## 11. RECOMMENDED TOOLS FOR BUILDING

| Approach | Best For | How |
|----------|----------|-----|
| **Claude.ai chat** | Design decisions, debugging, individual components | Paste this CLAUDE.md + ask for specific module |
| **Claude Code (CLI)** | Building entire modules, file creation, testing | `claude` in terminal, reads CLAUDE.md automatically |
| **Cowork** | Non-code tasks (planning, documentation, academy content) | Desktop automation |
| **Memory (Claude.ai)** | Remembering preferences across sessions | Enable memory, but CLAUDE.md is the primary source of truth |

### Recommended approach:
1. **Use Claude Code (CLI)** as your primary building tool — it can read CLAUDE.md from the repo root automatically
2. **Enable Claude.ai Memory** as a backup — store key decisions like "We chose R2 over S3" or "Kiosk uses React Native"
3. **Keep CLAUDE.md updated** — this is the master document, memory is secondary
4. **Build module by module** — don't try to build everything at once
5. **Test each module before moving to the next**

---

*END OF MASTER ARCHITECTURE DOCUMENT*
*Total modules: 23 | Total features: 150+ | Total API routes: 40+*
*This document IS the system. If it's not in here, it doesn't exist.*

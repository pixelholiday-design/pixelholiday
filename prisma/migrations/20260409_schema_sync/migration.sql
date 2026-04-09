-- Schema sync migration: adds all models and columns introduced after the init migration

-- ════════════════════════════════════════════════════════════
-- SECTION 1: NEW ENUMS
-- ════════════════════════════════════════════════════════════

-- CreateEnum
CREATE TYPE "AiCullStatus" AS ENUM ('PENDING', 'KEEP', 'MAYBE', 'REJECT');

-- CreateEnum
CREATE TYPE "ChatChannelType" AS ENUM ('LOCATION', 'ROLE', 'DIRECT', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM', 'ALERT', 'AI_TIP');

-- CreateEnum
CREATE TYPE "CashRegisterStatus" AS ENUM ('OPEN', 'CLOSED', 'RECONCILED', 'DISCREPANCY');

-- CreateEnum
CREATE TYPE "CashTransactionType" AS ENUM ('SALE', 'CHANGE_GIVEN', 'REFUND', 'ADJUSTMENT', 'EXPENSE');

-- CreateEnum
CREATE TYPE "PrintLabType" AS ENUM ('LOCAL', 'PRODIGI', 'PRINTFUL', 'GOOTEN', 'CUSTOM_API');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'SUBMITTED_TO_LAB', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "EditQuality" AS ENUM ('NONE', 'LIGHT', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "KioskAppType" AS ENUM ('SALE_POINT', 'GALLERY_DISPLAY', 'TV_DISPLAY', 'SD_UPLOAD');

-- CreateEnum
CREATE TYPE "NetworkMode" AS ENUM ('ONLINE', 'LOCAL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCING', 'SYNCED', 'FAILED');

-- Alter existing enum: BookingSource — add new values
ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'INSTAGRAM';
ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'FACEBOOK';
ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'EMAIL';
ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'PHONE';
ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'WHATSAPP';
ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'HOTEL_CONCIERGE';
ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'PARTNER_REFERRAL';

-- Alter existing enum: CommissionType — add new value
ALTER TYPE "CommissionType" ADD VALUE IF NOT EXISTS 'ATTENDANCE_BONUS';

-- ════════════════════════════════════════════════════════════
-- SECTION 2: NEW COLUMNS ON EXISTING TABLES
-- ════════════════════════════════════════════════════════════

-- AddColumn: Organization — franchise branding & Stripe
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "brandColor"           TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "logoUrl"              TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "tagline"              TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "customDomain"        TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeCustomerId"    TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;

-- AddColumn: User — gamification & relations
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "streakDays"     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3);

-- AddColumn: Location — extended operational fields
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "locationType"        TEXT NOT NULL DEFAULT 'LUXURY';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "targetAOV"           DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "maxShiftHours"       INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "siestaStart"         TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "siestaEnd"           TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "country"             TEXT NOT NULL DEFAULT 'Tunisia';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "city"                TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "timezone"            TEXT NOT NULL DEFAULT 'Africa/Tunis';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "currency"            TEXT NOT NULL DEFAULT 'EUR';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "taxRate"             DOUBLE PRECISION NOT NULL DEFAULT 0.19;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "rentAmount"          DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "rentType"            TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "rentPercentage"      DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "targetDailyRevenue"  DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "targetCaptureRate"   DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "scheduleType"        TEXT NOT NULL DEFAULT 'SIESTA';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "morningStart"        TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "morningEnd"          TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "eveningStart"        TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "eveningEnd"          TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "rotationHours"       INTEGER;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "commissionType"      TEXT NOT NULL DEFAULT 'FLAT';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "commissionRate"      DOUBLE PRECISION NOT NULL DEFAULT 0.10;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "attendanceBonus"     DOUBLE PRECISION NOT NULL DEFAULT 2.0;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "vipCloserBonus"      DOUBLE PRECISION NOT NULL DEFAULT 0.05;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "tier1Threshold"      DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "tier1Rate"           DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "tier2Threshold"      DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "tier2Rate"           DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "tier3Rate"           DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "supervisorOverride"  DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "partnerName"         TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "partnerContact"      TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "partnerEmail"        TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "partnerPhone"        TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "roomCount"           INTEGER;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "occupancyRate"       DOUBLE PRECISION;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "contractStartDate"   TIMESTAMP(3);
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "contractEndDate"     TIMESTAMP(3);
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "isActive"            BOOLEAN NOT NULL DEFAULT true;

-- AddColumn: Customer — check-in/out dates and pre-arrival tracking
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "checkInDate"               TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "checkOutDate"              TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "preArrivalOfferSentAt"     TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "checkoutReminderSentAt"    TIMESTAMP(3);

-- AddColumn: Gallery — content & access fields
ALTER TABLE "Gallery" ADD COLUMN IF NOT EXISTS "coverMessage"   TEXT;
ALTER TABLE "Gallery" ADD COLUMN IF NOT EXISTS "accessPassword" TEXT;
ALTER TABLE "Gallery" ADD COLUMN IF NOT EXISTS "downloadPin"    TEXT;
ALTER TABLE "Gallery" ADD COLUMN IF NOT EXISTS "editQuality"    "EditQuality" NOT NULL DEFAULT 'STANDARD';

-- AddColumn: Photo — editing, AI, and wristband fields
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "isMagicShot"            BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "parentPhotoId"          TEXT;
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "setId"                  TEXT;
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "cloudinaryId_edited"    TEXT;
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "isAutoEdited"           BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "editApplied"            TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "aiScore"                INTEGER;
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "aiStatus"               "AiCullStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "isWristbandPhoto"       BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "extractedWristbandCode" TEXT;

-- AddColumn: Appointment — extended booking fields
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "sourceDetail"       TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "externalRef"        TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "notes"              TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "customerName"       TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "customerPhone"      TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "customerEmail"      TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "partySize"          INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "sessionType"        TEXT NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "estimatedDuration"  INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "specialRequests"    TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "locationId"         TEXT;

-- Appointment.galleryId is now nullable in the schema (was NOT NULL in init)
-- Note: altering NOT NULL to nullable requires explicit ALTER
ALTER TABLE "Appointment" ALTER COLUMN "galleryId" DROP NOT NULL;

-- AddColumn: Order — refund tracking
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "refundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "refundedAt"     TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "refundReason"   TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "refundedBy"     TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeRefundId" TEXT;

-- AddColumn: Commission — orderId is now nullable
ALTER TABLE "Commission" ALTER COLUMN "orderId" DROP NOT NULL;

-- AddColumn: QRCode — new fields
ALTER TABLE "QRCode" ADD COLUMN IF NOT EXISTS "customerId"  TEXT;
ALTER TABLE "QRCode" ADD COLUMN IF NOT EXISTS "roomNumber"  TEXT;

-- AddColumn: StaffHousing — extended fields
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "propertyName"      TEXT;
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "type"              TEXT;
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "capacity"          INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "deposit"           DOUBLE PRECISION;
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "utilitiesIncluded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "wifiIncluded"      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "distanceToResort"  TEXT;
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "contractStart"     TIMESTAMP(3);
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "contractEnd"       TIMESTAMP(3);
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "notes"             TEXT;
ALTER TABLE "StaffHousing" ADD COLUMN IF NOT EXISTS "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddColumn: ChatMessage — new fields (channel FK replaces plain channelId text)
-- The old ChatMessage.channelId was TEXT (no FK). New schema has a FK to ChatChannel.
-- We add the new columns; FK migration is handled below after ChatChannel is created.
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "type"      "ChatMessageType" NOT NULL DEFAULT 'TEXT';
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "edited"    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
-- senderId is now nullable
ALTER TABLE "ChatMessage" ALTER COLUMN "senderId" DROP NOT NULL;

-- AddColumn: MagicElement — new fields
ALTER TABLE "MagicElement" ADD COLUMN IF NOT EXISTS "slug"        TEXT;
ALTER TABLE "MagicElement" ADD COLUMN IF NOT EXISTS "position"    TEXT;
ALTER TABLE "MagicElement" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "MagicElement" ADD COLUMN IF NOT EXISTS "usageCount"  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MagicElement" ADD COLUMN IF NOT EXISTS "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddColumn: PricingConfig — new fields and locationId FK
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "isAnchor"           BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "isHidden"           BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "displayOrder"       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "anchorDelaySeconds" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "locationId"         TEXT;

-- The old PricingConfig unique index was on productKey alone; new schema is (productKey, locationId)
-- Drop old unique index and add composite one
DROP INDEX IF EXISTS "PricingConfig_productKey_key";

-- CreateIndex (composite unique replacing old single-column unique)
CREATE UNIQUE INDEX IF NOT EXISTS "PricingConfig_productKey_locationId_key" ON "PricingConfig"("productKey", "locationId");

-- ════════════════════════════════════════════════════════════
-- SECTION 3: NEW TABLES
-- ════════════════════════════════════════════════════════════

-- CreateTable: ChatChannel
CREATE TABLE "ChatChannel" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "type"        "ChatChannelType" NOT NULL,
    "description" TEXT,
    "locationId"  TEXT,
    "role"        TEXT,
    "isSystem"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ChatMember
CREATE TABLE "ChatMember" (
    "id"         TEXT NOT NULL,
    "channelId"  TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ChatMember_channelId_userId_key" UNIQUE ("channelId", "userId")
);

-- CreateTable: HousingExpense
CREATE TABLE "HousingExpense" (
    "id"        TEXT NOT NULL,
    "housingId" TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "amount"    DOUBLE PRECISION NOT NULL,
    "date"      TIMESTAMP(3) NOT NULL,
    "paidBy"    TEXT NOT NULL,
    "receipt"   TEXT,
    "notes"     TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HousingExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CashRegister
CREATE TABLE "CashRegister" (
    "id"              TEXT NOT NULL,
    "locationId"      TEXT NOT NULL,
    "date"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openingBalance"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCashIn"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCashOut"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpenses"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualBalance"   DOUBLE PRECISION,
    "discrepancy"     DOUBLE PRECISION,
    "status"          "CashRegisterStatus" NOT NULL DEFAULT 'OPEN',
    "openedBy"        TEXT NOT NULL,
    "closedBy"        TEXT,
    "closedAt"        TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashRegister_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CashRegister_locationId_date_key" UNIQUE ("locationId", "date")
);

-- CreateTable: CashTransaction
CREATE TABLE "CashTransaction" (
    "id"             TEXT NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "orderId"        TEXT,
    "type"           "CashTransactionType" NOT NULL,
    "amount"         DOUBLE PRECISION NOT NULL,
    "staffId"        TEXT NOT NULL,
    "staffPin"       TEXT NOT NULL,
    "customerName"   TEXT,
    "description"    TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CashHandover
CREATE TABLE "CashHandover" (
    "id"                  TEXT NOT NULL,
    "cashRegisterId"      TEXT NOT NULL,
    "fromStaffId"         TEXT NOT NULL,
    "toStaffId"           TEXT NOT NULL,
    "amount"              DOUBLE PRECISION NOT NULL,
    "denomination"        TEXT,
    "notes"               TEXT,
    "confirmedByReceiver" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt"         TIMESTAMP(3),
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashHandover_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CashExpense
CREATE TABLE "CashExpense" (
    "id"             TEXT NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "amount"         DOUBLE PRECISION NOT NULL,
    "reason"         TEXT NOT NULL,
    "staffId"        TEXT NOT NULL,
    "approvedBy"     TEXT,
    "receiptUrl"     TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable: OperatingExpense
CREATE TABLE "OperatingExpense" (
    "id"          TEXT NOT NULL,
    "category"    TEXT NOT NULL,
    "amount"      DOUBLE PRECISION NOT NULL,
    "date"        TIMESTAMP(3) NOT NULL,
    "locationId"  TEXT,
    "paidBy"      TEXT,
    "receiptUrl"  TEXT,
    "description" TEXT,
    "recurring"   BOOLEAN NOT NULL DEFAULT false,
    "createdBy"   TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatingExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DownloadLog
CREATE TABLE "DownloadLog" (
    "id"        TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "photoId"   TEXT,
    "type"      TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: GalleryViewLog
CREATE TABLE "GalleryViewLog" (
    "id"        TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryViewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PhotoSet
CREATE TABLE "PhotoSet" (
    "id"        TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PrintLabConfig
CREATE TABLE "PrintLabConfig" (
    "id"            TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "type"          "PrintLabType" NOT NULL,
    "apiBaseUrl"    TEXT,
    "apiKey"        TEXT,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "isDefault"     BOOLEAN NOT NULL DEFAULT false,
    "markupPercent" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "shippingRates" JSONB,
    "productMap"    JSONB,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintLabConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FulfillmentOrder
CREATE TABLE "FulfillmentOrder" (
    "id"              TEXT NOT NULL,
    "orderId"         TEXT NOT NULL,
    "printLabId"      TEXT NOT NULL,
    "externalOrderId" TEXT,
    "status"          "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "trackingNumber"  TEXT,
    "trackingUrl"     TEXT,
    "shippingAddress" JSONB NOT NULL,
    "items"           JSONB NOT NULL,
    "costToUs"        DOUBLE PRECISION NOT NULL,
    "chargedCustomer" DOUBLE PRECISION NOT NULL,
    "profit"          DOUBLE PRECISION NOT NULL,
    "submittedAt"     TIMESTAMP(3),
    "shippedAt"       TIMESTAMP(3),
    "deliveredAt"     TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Coupon
CREATE TABLE "Coupon" (
    "id"         TEXT NOT NULL,
    "code"       TEXT NOT NULL,
    "type"       "CouponType" NOT NULL,
    "value"      DOUBLE PRECISION NOT NULL,
    "minOrder"   DOUBLE PRECISION,
    "maxUses"    INTEGER,
    "usedCount"  INTEGER NOT NULL DEFAULT 0,
    "expiresAt"  TIMESTAMP(3),
    "isActive"   BOOLEAN NOT NULL DEFAULT true,
    "locationId" TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Coupon_code_key" UNIQUE ("code")
);

-- CreateTable: KioskConfig
CREATE TABLE "KioskConfig" (
    "id"            TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "externalId"    TEXT NOT NULL,
    "type"          "KioskAppType" NOT NULL,
    "locationId"    TEXT NOT NULL,
    "networkMode"   "NetworkMode" NOT NULL DEFAULT 'ONLINE',
    "serverIp"      TEXT,
    "isLocalServer" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt"    TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KioskConfig_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KioskConfig_externalId_key" UNIQUE ("externalId")
);

-- CreateTable: SyncLog
CREATE TABLE "SyncLog" (
    "id"        TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "localId"   TEXT NOT NULL,
    "cloudId"   TEXT,
    "status"    "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "error"     TEXT,
    "syncedAt"  TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SyncQueue
CREATE TABLE "SyncQueue" (
    "id"        TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "action"    TEXT NOT NULL,
    "localId"   TEXT NOT NULL,
    "cloudId"   TEXT,
    "payload"   TEXT NOT NULL,
    "status"    TEXT NOT NULL DEFAULT 'pending',
    "attempts"  INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "priority"  INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt"  TIMESTAMP(3),

    CONSTRAINT "SyncQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Badge
CREATE TABLE "Badge" (
    "id"          TEXT NOT NULL,
    "key"         TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon"        TEXT NOT NULL,
    "category"    TEXT NOT NULL,
    "xpBonus"     INTEGER NOT NULL DEFAULT 0,
    "isSecret"    BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Badge_key_key" UNIQUE ("key")
);

-- CreateTable: UserBadge
CREATE TABLE "UserBadge" (
    "id"       TEXT NOT NULL,
    "userId"   TEXT NOT NULL,
    "badgeId"  TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserBadge_userId_badgeId_key" UNIQUE ("userId", "badgeId")
);

-- CreateTable: XpLog
CREATE TABLE "XpLog" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "action"    TEXT NOT NULL,
    "amount"    INTEGER NOT NULL,
    "context"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DailyChallenge
CREATE TABLE "DailyChallenge" (
    "id"         TEXT NOT NULL,
    "date"       TIMESTAMP(3) NOT NULL,
    "locationId" TEXT,
    "challenges" TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AIInsight
CREATE TABLE "AIInsight" (
    "id"          TEXT NOT NULL,
    "type"        TEXT NOT NULL,
    "targetType"  TEXT NOT NULL,
    "targetId"    TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "message"     TEXT NOT NULL,
    "priority"    TEXT NOT NULL DEFAULT 'medium',
    "actionable"  BOOLEAN NOT NULL DEFAULT true,
    "actionTaken" BOOLEAN NOT NULL DEFAULT false,
    "actionBy"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SalesCoachTip
CREATE TABLE "SalesCoachTip" (
    "id"       TEXT NOT NULL,
    "trigger"  TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "message"  TEXT NOT NULL,
    "script"   TEXT,
    "tactic"   TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SalesCoachTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AIBriefingLog
CREATE TABLE "AIBriefingLog" (
    "id"        TEXT NOT NULL,
    "scope"     TEXT NOT NULL,
    "scopeId"   TEXT,
    "payload"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIBriefingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PoseCategory
CREATE TABLE "PoseCategory" (
    "id"                 TEXT NOT NULL,
    "name"               TEXT NOT NULL,
    "description"        TEXT NOT NULL,
    "subjectType"        TEXT NOT NULL,
    "difficulty"         TEXT NOT NULL,
    "tags"               TEXT NOT NULL,
    "exampleDescription" TEXT NOT NULL,
    "isActive"           BOOLEAN NOT NULL DEFAULT true,
    "sortOrder"          INTEGER NOT NULL DEFAULT 0,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoseCategory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PoseCategory_name_key" UNIQUE ("name")
);

-- CreateTable: PhotoAnalysis
CREATE TABLE "PhotoAnalysis" (
    "id"                     TEXT NOT NULL,
    "photoId"                TEXT NOT NULL,
    "photographerId"         TEXT NOT NULL,
    "detectedPoseCategory"   TEXT,
    "poseConfidence"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "poseVariety"            BOOLEAN NOT NULL DEFAULT false,
    "subjectCount"           INTEGER NOT NULL DEFAULT 1,
    "subjectType"            TEXT,
    "facesDetected"          INTEGER NOT NULL DEFAULT 0,
    "smilesDetected"         INTEGER NOT NULL DEFAULT 0,
    "eyesOpen"               BOOLEAN NOT NULL DEFAULT true,
    "sharpnessScore"         INTEGER NOT NULL DEFAULT 50,
    "exposureScore"          INTEGER NOT NULL DEFAULT 50,
    "compositionScore"       INTEGER NOT NULL DEFAULT 50,
    "lightingScore"          INTEGER NOT NULL DEFAULT 50,
    "framingScore"           INTEGER NOT NULL DEFAULT 50,
    "emotionScore"           INTEGER NOT NULL DEFAULT 50,
    "actionScore"            INTEGER NOT NULL DEFAULT 50,
    "hookPotential"          INTEGER NOT NULL DEFAULT 50,
    "wowFactor"              INTEGER NOT NULL DEFAULT 50,
    "technicalTotal"         INTEGER NOT NULL DEFAULT 50,
    "salesTotal"             INTEGER NOT NULL DEFAULT 50,
    "overallScore"           INTEGER NOT NULL DEFAULT 50,
    "improvements"           TEXT,
    "poseSuggestion"         TEXT,
    "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoAnalysis_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PhotoAnalysis_photoId_key" UNIQUE ("photoId")
);

-- CreateTable: PhotographerSkillProfile
CREATE TABLE "PhotographerSkillProfile" (
    "id"                   TEXT NOT NULL,
    "userId"               TEXT NOT NULL,
    "individualPoses"      INTEGER NOT NULL DEFAULT 50,
    "couplePoses"          INTEGER NOT NULL DEFAULT 50,
    "familyPoses"          INTEGER NOT NULL DEFAULT 50,
    "kidsPoses"            INTEGER NOT NULL DEFAULT 50,
    "actionPoses"          INTEGER NOT NULL DEFAULT 50,
    "portraitPoses"        INTEGER NOT NULL DEFAULT 50,
    "avgSharpness"         INTEGER NOT NULL DEFAULT 50,
    "avgExposure"          INTEGER NOT NULL DEFAULT 50,
    "avgComposition"       INTEGER NOT NULL DEFAULT 50,
    "avgLighting"          INTEGER NOT NULL DEFAULT 50,
    "avgFraming"           INTEGER NOT NULL DEFAULT 50,
    "avgHookRate"          INTEGER NOT NULL DEFAULT 50,
    "avgSalesConversion"   INTEGER NOT NULL DEFAULT 50,
    "avgEmotionCapture"    INTEGER NOT NULL DEFAULT 50,
    "weakestPoseCategory"  TEXT,
    "weakestTechnical"     TEXT,
    "strongestArea"        TEXT,
    "trainingAssigned"     TEXT,
    "lastTrainingDate"     TIMESTAMP(3),
    "improvementRate"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotographerSkillProfile_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PhotographerSkillProfile_userId_key" UNIQUE ("userId")
);

-- CreateTable: TrainingAssignment
CREATE TABLE "TrainingAssignment" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "moduleId"    TEXT,
    "reason"      TEXT NOT NULL,
    "priority"    TEXT NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'assigned',
    "assignedBy"  TEXT NOT NULL,
    "dueDate"     TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skillBefore" INTEGER,
    "skillAfter"  INTEGER,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WeeklySkillReport
CREATE TABLE "WeeklySkillReport" (
    "id"              TEXT NOT NULL,
    "userId"          TEXT NOT NULL,
    "weekStart"       TIMESTAMP(3) NOT NULL,
    "weekEnd"         TIMESTAMP(3) NOT NULL,
    "photosAnalyzed"  INTEGER NOT NULL DEFAULT 0,
    "avgOverallScore" INTEGER NOT NULL DEFAULT 50,
    "scoreChange"     INTEGER NOT NULL DEFAULT 0,
    "strengths"       TEXT,
    "improvements"    TEXT,
    "recommendations" TEXT,
    "teamRank"        INTEGER,
    "aboveAverage"    TEXT,
    "belowAverage"    TEXT,
    "sentAt"          TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklySkillReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UpsellScript
CREATE TABLE "UpsellScript" (
    "id"             TEXT NOT NULL,
    "scriptName"     TEXT NOT NULL,
    "trigger"        TEXT NOT NULL,
    "condition"      TEXT NOT NULL,
    "script"         TEXT NOT NULL,
    "demographic"    TEXT,
    "locationType"   TEXT,
    "priority"       INTEGER NOT NULL DEFAULT 0,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timesShown"     INTEGER NOT NULL DEFAULT 0,
    "timesConverted" INTEGER NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpsellScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ApproachHook
CREATE TABLE "ApproachHook" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "demographic" TEXT,
    "location"    TEXT,
    "locationType" TEXT,
    "timeOfDay"   TEXT,
    "script"      TEXT NOT NULL,
    "notes"       TEXT,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timesUsed"   INTEGER NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApproachHook_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AppointmentOutcome
CREATE TABLE "AppointmentOutcome" (
    "id"             TEXT NOT NULL,
    "appointmentId"  TEXT NOT NULL,
    "arrivedAt"      TIMESTAMP(3),
    "didArrive"      BOOLEAN NOT NULL DEFAULT false,
    "didBuy"         BOOLEAN NOT NULL DEFAULT false,
    "orderAmount"    DOUBLE PRECISION,
    "hookUsed"       TEXT,
    "noShowReason"   TEXT,
    "photographerId" TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentOutcome_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AppointmentOutcome_appointmentId_key" UNIQUE ("appointmentId")
);

-- CreateTable: SneakPeek
CREATE TABLE "SneakPeek" (
    "id"              TEXT NOT NULL,
    "customerId"      TEXT NOT NULL,
    "galleryId"       TEXT NOT NULL,
    "photoId"         TEXT,
    "sentAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasOpened"       BOOLEAN NOT NULL DEFAULT false,
    "customerArrived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SneakPeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZoneAssignment
CREATE TABLE "ZoneAssignment" (
    "id"             TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "locationId"     TEXT NOT NULL,
    "zoneName"       TEXT NOT NULL,
    "startedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt"        TIMESTAMP(3),
    "isOutdoor"      BOOLEAN NOT NULL DEFAULT false,
    "temperature"    DOUBLE PRECISION,
    "rotatedOnTime"  BOOLEAN,

    CONSTRAINT "ZoneAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SiteEvaluation
CREATE TABLE "SiteEvaluation" (
    "id"               TEXT NOT NULL,
    "locationId"       TEXT,
    "locationName"     TEXT NOT NULL,
    "evaluatedBy"      TEXT,
    "trafficScore"     INTEGER NOT NULL,
    "affluenceScore"   INTEGER NOT NULL,
    "spaceScore"       INTEGER NOT NULL,
    "partnerScore"     INTEGER NOT NULL,
    "competitionScore" INTEGER NOT NULL,
    "totalScore"       INTEGER NOT NULL,
    "passed"           BOOLEAN NOT NULL,
    "expectedTraffic"  INTEGER,
    "expectedAOV"      DOUBLE PRECISION,
    "monthlyGross"     DOUBLE PRECISION,
    "rentCeiling"      DOUBLE PRECISION,
    "proposedRent"     DOUBLE PRECISION,
    "status"           TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ScalingGate
CREATE TABLE "ScalingGate" (
    "id"          TEXT NOT NULL,
    "orgId"       TEXT NOT NULL,
    "gateNumber"  INTEGER NOT NULL,
    "gateName"    TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "passed"      BOOLEAN NOT NULL DEFAULT false,
    "passedAt"    TIMESTAMP(3),
    "evidence"    TEXT,

    CONSTRAINT "ScalingGate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ScalingGate_orgId_gateNumber_key" UNIQUE ("orgId", "gateNumber")
);

-- CreateTable: ProofSubmission
CREATE TABLE "ProofSubmission" (
    "id"          TEXT NOT NULL,
    "locationId"  TEXT NOT NULL,
    "month"       TEXT NOT NULL,
    "type"        TEXT NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'pending',
    "fileUrl"     TEXT,
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "verifiedBy"  TEXT,
    "verifiedAt"  TIMESTAMP(3),
    "notes"       TEXT,

    CONSTRAINT "ProofSubmission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProofSubmission_locationId_month_type_key" UNIQUE ("locationId", "month", "type")
);

-- CreateTable: KioskEvent
CREATE TABLE "KioskEvent" (
    "id"         TEXT NOT NULL,
    "type"       TEXT NOT NULL,
    "photoCount" INTEGER,
    "amount"     DOUBLE PRECISION,
    "locationId" TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KioskEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable: VideoReel
CREATE TABLE "VideoReel" (
    "id"           TEXT NOT NULL,
    "galleryId"    TEXT NOT NULL,
    "photoIds"     TEXT NOT NULL,
    "musicTrack"   TEXT,
    "duration"     INTEGER NOT NULL DEFAULT 15,
    "status"       TEXT NOT NULL DEFAULT 'READY',
    "previewHtml"  TEXT,
    "thumbnailUrl" TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoReel_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════
-- SECTION 4: INDEXES
-- ════════════════════════════════════════════════════════════

-- CreateIndex: Customer
CREATE INDEX IF NOT EXISTS "Customer_whatsapp_idx"    ON "Customer"("whatsapp");
CREATE INDEX IF NOT EXISTS "Customer_wristbandCode_idx" ON "Customer"("wristbandCode");
CREATE INDEX IF NOT EXISTS "Customer_email_idx"       ON "Customer"("email");
CREATE INDEX IF NOT EXISTS "Customer_locationId_idx"  ON "Customer"("locationId");

-- CreateIndex: Gallery
CREATE INDEX IF NOT EXISTS "Gallery_status_idx"       ON "Gallery"("status");
CREATE INDEX IF NOT EXISTS "Gallery_locationId_idx"   ON "Gallery"("locationId");
CREATE INDEX IF NOT EXISTS "Gallery_photographerId_idx" ON "Gallery"("photographerId");
CREATE INDEX IF NOT EXISTS "Gallery_expiresAt_idx"    ON "Gallery"("expiresAt");
CREATE INDEX IF NOT EXISTS "Gallery_customerId_idx"   ON "Gallery"("customerId");

-- CreateIndex: Photo
CREATE INDEX IF NOT EXISTS "Photo_galleryId_idx"    ON "Photo"("galleryId");
CREATE INDEX IF NOT EXISTS "Photo_isPurchased_idx"  ON "Photo"("isPurchased");
CREATE INDEX IF NOT EXISTS "Photo_aiCulled_idx"     ON "Photo"("aiCulled");
CREATE INDEX IF NOT EXISTS "Photo_aiStatus_idx"     ON "Photo"("aiStatus");

-- CreateIndex: Order
CREATE INDEX IF NOT EXISTS "Order_status_idx"     ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx"  ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex: Commission
CREATE INDEX IF NOT EXISTS "Commission_userId_idx" ON "Commission"("userId");
CREATE INDEX IF NOT EXISTS "Commission_month_idx"  ON "Commission"("month");
CREATE INDEX IF NOT EXISTS "Commission_isPaid_idx" ON "Commission"("isPaid");

-- CreateIndex: ChatMember
CREATE INDEX IF NOT EXISTS "ChatMember_userId_idx" ON "ChatMember"("userId");

-- CreateIndex: ChatMessage (channelId + createdAt compound)
CREATE INDEX IF NOT EXISTS "ChatMessage_channelId_createdAt_idx" ON "ChatMessage"("channelId", "createdAt");

-- CreateIndex: HousingExpense
CREATE INDEX IF NOT EXISTS "HousingExpense_housingId_idx" ON "HousingExpense"("housingId");
CREATE INDEX IF NOT EXISTS "HousingExpense_date_idx"      ON "HousingExpense"("date");

-- CreateIndex: OperatingExpense
CREATE INDEX IF NOT EXISTS "OperatingExpense_category_idx"   ON "OperatingExpense"("category");
CREATE INDEX IF NOT EXISTS "OperatingExpense_date_idx"       ON "OperatingExpense"("date");
CREATE INDEX IF NOT EXISTS "OperatingExpense_locationId_idx" ON "OperatingExpense"("locationId");

-- CreateIndex: SyncQueue
CREATE INDEX IF NOT EXISTS "SyncQueue_status_idx"   ON "SyncQueue"("status");
CREATE INDEX IF NOT EXISTS "SyncQueue_priority_idx" ON "SyncQueue"("priority");

-- CreateIndex: XpLog
CREATE INDEX IF NOT EXISTS "XpLog_userId_idx"    ON "XpLog"("userId");
CREATE INDEX IF NOT EXISTS "XpLog_createdAt_idx" ON "XpLog"("createdAt");

-- CreateIndex: DailyChallenge
CREATE INDEX IF NOT EXISTS "DailyChallenge_date_idx" ON "DailyChallenge"("date");

-- CreateIndex: AIInsight
CREATE INDEX IF NOT EXISTS "AIInsight_type_idx"     ON "AIInsight"("type");
CREATE INDEX IF NOT EXISTS "AIInsight_priority_idx" ON "AIInsight"("priority");

-- CreateIndex: PhotoAnalysis
CREATE INDEX IF NOT EXISTS "PhotoAnalysis_photographerId_createdAt_idx" ON "PhotoAnalysis"("photographerId", "createdAt");

-- CreateIndex: TrainingAssignment
CREATE INDEX IF NOT EXISTS "TrainingAssignment_userId_status_idx" ON "TrainingAssignment"("userId", "status");

-- CreateIndex: WeeklySkillReport
CREATE INDEX IF NOT EXISTS "WeeklySkillReport_userId_weekStart_idx" ON "WeeklySkillReport"("userId", "weekStart");

-- CreateIndex: VideoReel
CREATE INDEX IF NOT EXISTS "VideoReel_galleryId_idx" ON "VideoReel"("galleryId");
CREATE INDEX IF NOT EXISTS "VideoReel_status_idx"    ON "VideoReel"("status");

-- CreateIndex: MagicElement unique slug
CREATE UNIQUE INDEX IF NOT EXISTS "MagicElement_slug_key" ON "MagicElement"("slug");

-- ════════════════════════════════════════════════════════════
-- SECTION 5: FOREIGN KEYS FOR NEW TABLES
-- ════════════════════════════════════════════════════════════

-- AddForeignKey: ChatChannel → Location
ALTER TABLE "ChatChannel" ADD CONSTRAINT "ChatChannel_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: ChatMember → ChatChannel
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_channelId_fkey"
    FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ChatMember → User
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: ChatMessage → ChatChannel (new FK; old schema had plain TEXT channelId)
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_channelId_fkey"
    FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: HousingExpense → StaffHousing
ALTER TABLE "HousingExpense" ADD CONSTRAINT "HousingExpense_housingId_fkey"
    FOREIGN KEY ("housingId") REFERENCES "StaffHousing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CashRegister → Location
ALTER TABLE "CashRegister" ADD CONSTRAINT "CashRegister_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CashTransaction → CashRegister
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_cashRegisterId_fkey"
    FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CashHandover → CashRegister
ALTER TABLE "CashHandover" ADD CONSTRAINT "CashHandover_cashRegisterId_fkey"
    FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CashExpense → CashRegister
ALTER TABLE "CashExpense" ADD CONSTRAINT "CashExpense_cashRegisterId_fkey"
    FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: DownloadLog → Gallery
ALTER TABLE "DownloadLog" ADD CONSTRAINT "DownloadLog_galleryId_fkey"
    FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: GalleryViewLog → Gallery
ALTER TABLE "GalleryViewLog" ADD CONSTRAINT "GalleryViewLog_galleryId_fkey"
    FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: PhotoSet → Gallery
ALTER TABLE "PhotoSet" ADD CONSTRAINT "PhotoSet_galleryId_fkey"
    FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Photo → PhotoSet (setId)
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_setId_fkey"
    FOREIGN KEY ("setId") REFERENCES "PhotoSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: FulfillmentOrder → Order
ALTER TABLE "FulfillmentOrder" ADD CONSTRAINT "FulfillmentOrder_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: FulfillmentOrder → PrintLabConfig
ALTER TABLE "FulfillmentOrder" ADD CONSTRAINT "FulfillmentOrder_printLabId_fkey"
    FOREIGN KEY ("printLabId") REFERENCES "PrintLabConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: UserBadge → User
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: UserBadge → Badge
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey"
    FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: XpLog → User
ALTER TABLE "XpLog" ADD CONSTRAINT "XpLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: PhotoAnalysis → Photo
ALTER TABLE "PhotoAnalysis" ADD CONSTRAINT "PhotoAnalysis_photoId_fkey"
    FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PhotoAnalysis → User (photographer)
ALTER TABLE "PhotoAnalysis" ADD CONSTRAINT "PhotoAnalysis_photographerId_fkey"
    FOREIGN KEY ("photographerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: PhotographerSkillProfile → User
ALTER TABLE "PhotographerSkillProfile" ADD CONSTRAINT "PhotographerSkillProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: TrainingAssignment → User
ALTER TABLE "TrainingAssignment" ADD CONSTRAINT "TrainingAssignment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: TrainingAssignment → AcademyModule
ALTER TABLE "TrainingAssignment" ADD CONSTRAINT "TrainingAssignment_moduleId_fkey"
    FOREIGN KEY ("moduleId") REFERENCES "AcademyModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: WeeklySkillReport → User
ALTER TABLE "WeeklySkillReport" ADD CONSTRAINT "WeeklySkillReport_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ZoneAssignment → User
ALTER TABLE "ZoneAssignment" ADD CONSTRAINT "ZoneAssignment_photographerId_fkey"
    FOREIGN KEY ("photographerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: AppointmentOutcome → User (photographer)
ALTER TABLE "AppointmentOutcome" ADD CONSTRAINT "AppointmentOutcome_photographerId_fkey"
    FOREIGN KEY ("photographerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Appointment → Location (new locationId column)
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: PricingConfig → Location (new locationId column)
ALTER TABLE "PricingConfig" ADD CONSTRAINT "PricingConfig_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: VideoReel → Gallery
ALTER TABLE "VideoReel" ADD CONSTRAINT "VideoReel_galleryId_fkey"
    FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

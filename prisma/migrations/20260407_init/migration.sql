-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('CEO', 'OPERATIONS_MANAGER', 'SUPERVISOR', 'PHOTOGRAPHER', 'SALES_STAFF', 'RECEPTIONIST', 'ACADEMY_TRAINEE');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('HEADQUARTERS', 'FRANCHISE');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('HOTEL', 'WATER_PARK', 'ATTRACTION', 'SELF_SERVICE');

-- CreateEnum
CREATE TYPE "DigitalPassType" AS ENUM ('BASIC', 'UNLIMITED', 'VIP');

-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('HOOK_ONLY', 'PREVIEW_ECOM', 'PAID', 'PARTIAL_PAID', 'DIGITAL_PASS', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('RAW_CLIP', 'SLOW_MOTION', 'AUTO_REEL', 'HIGHLIGHT');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('HOOK_GALLERY', 'QR_CODE', 'VIP_BOOKING', 'WALK_IN', 'PRE_ARRIVAL', 'WEBSITE');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('SINGLE_PHOTO', 'FULL_GALLERY', 'PARTIAL_GALLERY', 'PRINTED_ALBUM', 'VIDEO_CLIP', 'AUTO_REEL', 'MAGIC_SHOT', 'DIGITAL_PASS', 'SOCIAL_MEDIA_PACKAGE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE_ONLINE', 'STRIPE_TERMINAL', 'CASH');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PHOTO_SALE', 'DIGITAL_PASS_SALE', 'APPOINTMENT_BOOKING', 'QR_REFERRAL', 'SLEEPING_MONEY');

-- CreateEnum
CREATE TYPE "QRCodeType" AS ENUM ('HOTEL_ROOM', 'RECEPTION_DESK', 'LOBBY_SIGN', 'WRISTBAND', 'WELCOME_ARCHWAY');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AIActionType" AS ENUM ('STAFF_PROMOTION_SUGGESTION', 'PRICING_OPTIMIZATION', 'PARTNER_DISCOVERY', 'SEO_UPDATE', 'MARKETING_CAMPAIGN', 'BOOKING_BOOST', 'PHOTOGRAPHER_PERFORMANCE_FLAG', 'FRANCHISE_LEAD');

-- CreateEnum
CREATE TYPE "MagicElementType" AS ENUM ('THREE_D_CHARACTER', 'AR_OVERLAY', 'BACKGROUND_REPLACE', 'GRAPHIC_OVERLAY');

-- CreateEnum
CREATE TYPE "AcademyModuleType" AS ENUM ('ONBOARDING', 'SALES_TRAINING', 'PHOTOGRAPHY_TECHNIQUE', 'SOFTWARE_TRAINING', 'COMPLIANCE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'FILLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('RECEIVED', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CameraType" AS ENUM ('SPEED_CAM', 'RIDE_CAM', 'ENTRANCE_CAM', 'ROAMING');

-- CreateEnum
CREATE TYPE "PrintStatus" AS ENUM ('PENDING', 'PRINTING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SaleOrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "parentOrgId" TEXT,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'STARTER',
    "saasCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "sleepingMoneyShare" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "pin" TEXT,
    "role" "StaffRole" NOT NULL,
    "orgId" TEXT NOT NULL,
    "locationId" TEXT,
    "isRepeater" BOOLEAN NOT NULL DEFAULT false,
    "repeaterYears" INTEGER NOT NULL DEFAULT 0,
    "salary" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "orgId" TEXT NOT NULL,
    "address" TEXT,
    "partnerCommission" DOUBLE PRECISION,
    "rentCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "roomNumber" TEXT,
    "faceVector" BYTEA,
    "wristbandCode" TEXT,
    "nfcTag" TEXT,
    "hasDigitalPass" BOOLEAN NOT NULL DEFAULT false,
    "digitalPassType" "DigitalPassType",
    "locationId" TEXT,
    "cartAbandoned" BOOLEAN NOT NULL DEFAULT false,
    "cartAbandonedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "magicLinkToken" TEXT NOT NULL,
    "status" "GalleryStatus" NOT NULL,
    "locationId" TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "roomNumber" TEXT,
    "hookImageId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "partialPurchase" BOOLEAN NOT NULL DEFAULT false,
    "purchasedCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "sweepUpSentAt" TIMESTAMP(3),
    "discountPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "s3Key_highRes" TEXT NOT NULL,
    "s3Key_raw" TEXT,
    "cloudinaryId" TEXT,
    "isHookImage" BOOLEAN NOT NULL DEFAULT false,
    "isFavorited" BOOLEAN NOT NULL DEFAULT false,
    "isPurchased" BOOLEAN NOT NULL DEFAULT false,
    "isRetouched" BOOLEAN NOT NULL DEFAULT false,
    "aiCulled" BOOLEAN NOT NULL DEFAULT false,
    "aiCullReason" TEXT,
    "hasMagicElement" BOOLEAN NOT NULL DEFAULT false,
    "magicElementId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "type" "VideoType" NOT NULL,
    "duration" INTEGER,
    "isAutoReel" BOOLEAN NOT NULL DEFAULT false,
    "musicTrackId" TEXT,
    "graphicOverlay" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "assignedPhotographerId" TEXT NOT NULL,
    "source" "BookingSource" NOT NULL,
    "qrCodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "cashPin" TEXT,
    "status" "OrderStatus" NOT NULL,
    "isAutomatedSale" BOOLEAN NOT NULL DEFAULT false,
    "discountApplied" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "OrderItemType" NOT NULL,
    "photoId" TEXT,
    "videoId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "CommissionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "month" TEXT,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "QRCodeType" NOT NULL,
    "locationId" TEXT NOT NULL,
    "assignedToStaffId" TEXT,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNumber" TEXT,
    "purchaseCost" DOUBLE PRECISION,
    "locationId" TEXT NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentAssignment" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "EquipmentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffHousing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "monthlyCost" DOUBLE PRECISION NOT NULL,
    "documentation" TEXT,

    CONSTRAINT "StaffHousing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffTransfer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT true,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "seoKeywords" TEXT[],
    "featuredPhotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGrowthLog" (
    "id" TEXT NOT NULL,
    "type" "AIActionType" NOT NULL,
    "description" TEXT NOT NULL,
    "result" TEXT,
    "dataSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIGrowthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "B2BDelivery" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "photoCount" INTEGER NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "rentDiscountPercent" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "B2BDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicElement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MagicElementType" NOT NULL,
    "assetUrl" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MagicElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyModule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "AcademyModuleType" NOT NULL,
    "contentUrl" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademyModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,

    CONSTRAINT "AcademyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "locationId" TEXT,
    "requirements" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantEmail" TEXT NOT NULL,
    "cvUrl" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camera" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" "CameraType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastPingAt" TIMESTAMP(3),
    "captureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KioskDevice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastPingAt" TIMESTAMP(3),
    "todaySalesCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KioskDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "PrintStatus" NOT NULL DEFAULT 'PENDING',
    "photoIds" TEXT[],
    "printSize" TEXT NOT NULL DEFAULT '4x6',
    "copies" INTEGER NOT NULL DEFAULT 1,
    "printedAt" TIMESTAMP(3),
    "printedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrder" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "photoIds" TEXT[],
    "totalCents" INTEGER NOT NULL,
    "status" "SaleOrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "receivedCents" INTEGER,
    "changeCents" INTEGER,
    "staffId" TEXT,
    "receiptCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SaleOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingHistory" (
    "id" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "oldPrice" DOUBLE PRECISION NOT NULL,
    "newPrice" DOUBLE PRECISION NOT NULL,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "discountPct" DOUBLE PRECISION NOT NULL,
    "delayDays" INTEGER NOT NULL,
    "template" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Gallery_magicLinkToken_key" ON "Gallery"("magicLinkToken");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_galleryId_key" ON "Appointment"("galleryId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_galleryId_key" ON "Order"("galleryId");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_code_key" ON "QRCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StaffHousing_userId_key" ON "StaffHousing"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Camera_externalId_key" ON "Camera"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "KioskDevice_externalId_key" ON "KioskDevice"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingConfig_productKey_key" ON "PricingConfig"("productKey");

-- CreateIndex
CREATE UNIQUE INDEX "SaleOrder_receiptCode_key" ON "SaleOrder"("receiptCode");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_parentOrgId_fkey" FOREIGN KEY ("parentOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_assignedPhotographerId_fkey" FOREIGN KEY ("assignedPhotographerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAssignment" ADD CONSTRAINT "EquipmentAssignment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAssignment" ADD CONSTRAINT "EquipmentAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffHousing" ADD CONSTRAINT "StaffHousing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "B2BDelivery" ADD CONSTRAINT "B2BDelivery_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Camera" ADD CONSTRAINT "Camera_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskDevice" ADD CONSTRAINT "KioskDevice_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


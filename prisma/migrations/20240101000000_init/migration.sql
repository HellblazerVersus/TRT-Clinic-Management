-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PROVIDER');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'UNPAID');

-- CreateEnum
CREATE TYPE "ProtocolStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "RenewalStatus" AS ENUM ('PENDING', 'DISPENSED', 'OVERDUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('DOSE', 'REFILL', 'LAB', 'BILLING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PROVIDER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "intakeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateOfBirth" TIMESTAMP(3),
    "baselineLabs" JSONB,
    "consentSigned" BOOLEAN NOT NULL DEFAULT false,
    "consentSignedAt" TIMESTAMP(3),
    "notes" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
    "subscriptionPlan" TEXT,
    "nextBillingDate" TIMESTAMP(3),
    "labDueDate" TIMESTAMP(3),
    "alertFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "compound" TEXT NOT NULL,
    "compoundLabel" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextDoseDate" TIMESTAMP(3),
    "status" "ProtocolStatus" NOT NULL DEFAULT 'ACTIVE',
    "prescriber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "marker" TEXT NOT NULL,
    "markerLabel" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "referenceMin" DOUBLE PRECISION,
    "referenceMax" DOUBLE PRECISION,
    "labName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RxRenewal" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "compound" TEXT NOT NULL,
    "compoundLabel" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "dispenseDate" TIMESTAMP(3),
    "prescriber" TEXT NOT NULL,
    "scheduleClass" TEXT NOT NULL DEFAULT 'III',
    "deaLotNumber" TEXT,
    "pharmacyName" TEXT,
    "renewalDueDate" TIMESTAMP(3) NOT NULL,
    "status" "RenewalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RxRenewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'sms',
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Patient_stripeCustomerId_key" ON "Patient"("stripeCustomerId");
CREATE UNIQUE INDEX "Patient_stripeSubscriptionId_key" ON "Patient"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Patient_subscriptionStatus_idx" ON "Patient"("subscriptionStatus");
CREATE INDEX "Protocol_patientId_idx" ON "Protocol"("patientId");
CREATE INDEX "Protocol_nextDoseDate_idx" ON "Protocol"("nextDoseDate");
CREATE INDEX "Protocol_status_idx" ON "Protocol"("status");
CREATE INDEX "LabResult_patientId_idx" ON "LabResult"("patientId");
CREATE INDEX "LabResult_patientId_marker_idx" ON "LabResult"("patientId", "marker");
CREATE INDEX "LabResult_date_idx" ON "LabResult"("date");
CREATE INDEX "RxRenewal_patientId_idx" ON "RxRenewal"("patientId");
CREATE INDEX "RxRenewal_renewalDueDate_idx" ON "RxRenewal"("renewalDueDate");
CREATE INDEX "RxRenewal_status_idx" ON "RxRenewal"("status");
CREATE INDEX "ReminderLog_patientId_idx" ON "ReminderLog"("patientId");
CREATE INDEX "ReminderLog_sentAt_idx" ON "ReminderLog"("sentAt");

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RxRenewal" ADD CONSTRAINT "RxRenewal_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

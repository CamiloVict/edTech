-- CreateEnum
CREATE TYPE "AppointmentPaymentStatus" AS ENUM ('NONE', 'REQUIRES_ACTION', 'AUTHORIZED', 'CAPTURED', 'CANCELED', 'FAILED');

-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "consumer_profiles" ADD COLUMN "stripe_customer_id" TEXT;

-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN "stripe_connect_account_id" TEXT,
ADD COLUMN "stripe_charges_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stripe_payouts_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN "quoted_amount_minor" INTEGER,
ADD COLUMN "quoted_currency" TEXT,
ADD COLUMN "quoted_rate_unit" "RateUnit",
ADD COLUMN "provider_rate_id" TEXT;

-- CreateTable
CREATE TABLE "appointment_payments" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "stripe_payment_intent_id" TEXT,
    "status" "AppointmentPaymentStatus" NOT NULL DEFAULT 'NONE',
    "amount_minor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "application_fee_minor" INTEGER NOT NULL,
    "last_stripe_event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_processed_events" (
    "id" TEXT NOT NULL,
    "stripe_event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_processed_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consumer_profiles_stripe_customer_id_key" ON "consumer_profiles"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_stripe_connect_account_id_key" ON "provider_profiles"("stripe_connect_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_payments_appointment_id_key" ON "appointment_payments"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_payments_stripe_payment_intent_id_key" ON "appointment_payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "appointment_payments_stripe_payment_intent_id_idx" ON "appointment_payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_processed_events_stripe_event_id_key" ON "stripe_processed_events"("stripe_event_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_rate_id_fkey" FOREIGN KEY ("provider_rate_id") REFERENCES "provider_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_payments" ADD CONSTRAINT "appointment_payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

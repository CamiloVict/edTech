-- CreateEnum
CREATE TYPE "RateUnit" AS ENUM ('HOUR', 'SESSION', 'DAY');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED_BY_FAMILY', 'CANCELLED_BY_PROVIDER');

-- CreateTable
CREATE TABLE "provider_rates" (
    "id" TEXT NOT NULL,
    "provider_profile_id" TEXT NOT NULL,
    "label" TEXT,
    "amount_minor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "unit" "RateUnit" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_availability_blocks" (
    "id" TEXT NOT NULL,
    "provider_profile_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "is_all_day" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_availability_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "provider_profile_id" TEXT NOT NULL,
    "consumer_profile_id" TEXT NOT NULL,
    "child_id" TEXT,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "note_from_family" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_rates_provider_profile_id_idx" ON "provider_rates"("provider_profile_id");

-- CreateIndex
CREATE INDEX "provider_availability_blocks_provider_profile_id_starts_at_idx" ON "provider_availability_blocks"("provider_profile_id", "starts_at");

-- CreateIndex
CREATE INDEX "appointments_provider_profile_id_starts_at_idx" ON "appointments"("provider_profile_id", "starts_at");

-- CreateIndex
CREATE INDEX "appointments_consumer_profile_id_starts_at_idx" ON "appointments"("consumer_profile_id", "starts_at");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- AddForeignKey
ALTER TABLE "provider_rates" ADD CONSTRAINT "provider_rates_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_availability_blocks" ADD CONSTRAINT "provider_availability_blocks_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_consumer_profile_id_fkey" FOREIGN KEY ("consumer_profile_id") REFERENCES "consumer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE SET NULL ON UPDATE CASCADE;

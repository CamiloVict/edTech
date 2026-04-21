-- CreateEnum
CREATE TYPE "ProviderOfferType" AS ENUM ('ONE_TO_ONE', 'WORKSHOP', 'MINI_COURSE', 'AGE_PROGRAM', 'LEARNING_PATH', 'EXPERIENCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProviderOfferStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "offer_title_snapshot" TEXT,
ADD COLUMN     "provider_offer_id" TEXT;

-- CreateTable
CREATE TABLE "provider_offers" (
    "id" TEXT NOT NULL,
    "provider_profile_id" TEXT NOT NULL,
    "type" "ProviderOfferType" NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "age_bands" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modality" "ServiceMode" NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "price_minor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "methodology_note" TEXT NOT NULL DEFAULT '',
    "suggested_frequency" TEXT NOT NULL,
    "max_seats" INTEGER,
    "status" "ProviderOfferStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_offers_provider_profile_id_status_idx" ON "provider_offers"("provider_profile_id", "status");

-- CreateIndex
CREATE INDEX "appointments_provider_offer_id_idx" ON "appointments"("provider_offer_id");

-- AddForeignKey
ALTER TABLE "provider_offers" ADD CONSTRAINT "provider_offers_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_offer_id_fkey" FOREIGN KEY ("provider_offer_id") REFERENCES "provider_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

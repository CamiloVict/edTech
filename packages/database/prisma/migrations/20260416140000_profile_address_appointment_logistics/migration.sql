-- CreateEnum
CREATE TYPE "DwellingType" AS ENUM ('HOUSE', 'APARTMENT');

-- CreateEnum
CREATE TYPE "InPersonVenueHost" AS ENUM ('CONSUMER', 'PROVIDER');

-- AlterTable
ALTER TABLE "consumer_profiles" ADD COLUMN "street_address" TEXT,
ADD COLUMN "postal_code" TEXT,
ADD COLUMN "unit_or_building" TEXT,
ADD COLUMN "dwelling_type" "DwellingType";

-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN "street_address" TEXT,
ADD COLUMN "postal_code" TEXT,
ADD COLUMN "unit_or_building" TEXT,
ADD COLUMN "dwelling_type" "DwellingType";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN "meeting_url" TEXT,
ADD COLUMN "in_person_venue_host" "InPersonVenueHost" NOT NULL DEFAULT 'CONSUMER';

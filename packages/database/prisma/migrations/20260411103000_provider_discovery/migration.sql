-- CreateEnum
CREATE TYPE "ProviderKind" AS ENUM ('TEACHER', 'BABYSITTER');

-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "rating_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availability_summary" TEXT,
ADD COLUMN     "kinds" "ProviderKind"[] DEFAULT ARRAY['TEACHER']::"ProviderKind"[];

-- CreateIndex
CREATE INDEX "provider_profiles_is_available_idx" ON "provider_profiles"("is_available");

-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'COMPLETED';

-- CreateEnum
CREATE TYPE "AppointmentReviewAuthor" AS ENUM ('CONSUMER', 'PROVIDER');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN "consumer_review_prompt_dismissals" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "appointments" ADD COLUMN "provider_review_prompt_dismissals" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "appointment_reviews" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "author_role" "AppointmentReviewAuthor" NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_reviews_appointment_id_author_role_key" ON "appointment_reviews"("appointment_id", "author_role");

-- CreateIndex
CREATE INDEX "appointment_reviews_appointment_id_idx" ON "appointment_reviews"("appointment_id");

-- AddForeignKey
ALTER TABLE "appointment_reviews" ADD CONSTRAINT "appointment_reviews_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

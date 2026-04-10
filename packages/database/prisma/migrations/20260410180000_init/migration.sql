-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CONSUMER', 'PROVIDER');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('PENDING_ROLE', 'PENDING_PROFILE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ServiceMode" AS ENUM ('IN_PERSON', 'ONLINE', 'HYBRID');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole",
    "onboarding_step" "OnboardingStep" NOT NULL DEFAULT 'PENDING_ROLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumer_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "relationship_to_child" TEXT,
    "is_profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT,
    "bio" TEXT,
    "years_of_experience" INTEGER,
    "focus_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "service_mode" "ServiceMode",
    "city" TEXT,
    "is_profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "consumer_profile_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "interests" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "consumer_profiles_user_id_key" ON "consumer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_user_id_key" ON "provider_profiles"("user_id");

-- CreateIndex
CREATE INDEX "children_consumer_profile_id_idx" ON "children"("consumer_profile_id");

-- AddForeignKey
ALTER TABLE "consumer_profiles" ADD CONSTRAINT "consumer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_consumer_profile_id_fkey" FOREIGN KEY ("consumer_profile_id") REFERENCES "consumer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

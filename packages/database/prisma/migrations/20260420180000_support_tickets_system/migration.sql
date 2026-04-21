-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'PENDING_USER', 'PENDING_AGENT', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "SupportResolutionKind" AS ENUM ('NONE', 'AUTO', 'HUMAN');

-- CreateEnum
CREATE TYPE "SupportMessageAuthor" AS ENUM ('SYSTEM', 'USER', 'AGENT');

-- CreateTable
CREATE TABLE "support_complaint_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label_es" TEXT NOT NULL,
    "description_es" TEXT,
    "parent_code" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "flow_hint_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_complaint_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_resolution_rules" (
    "id" TEXT NOT NULL,
    "category_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions_json" JSONB NOT NULL DEFAULT '{}',
    "action_type" TEXT NOT NULL,
    "action_payload" JSONB,
    "auto_confidence" DECIMAL(4,3) NOT NULL DEFAULT 0.7,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_resolution_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "provider_profile_id" TEXT NOT NULL,
    "category_code" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL,
    "resolution_kind" "SupportResolutionKind" NOT NULL,
    "formal_complaint" BOOLEAN NOT NULL DEFAULT false,
    "formal_tracking_number" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "proposed_resolution" JSONB,
    "auto_confidence" DECIMAL(4,3),
    "abuse_score_snapshot" DECIMAL(4,3),
    "escalation_reason" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_messages" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "author_type" "SupportMessageAuthor" NOT NULL,
    "author_user_id" TEXT,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_evidence" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "uploaded_by_user_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_complaint_categories_code_key" ON "support_complaint_categories"("code");

-- CreateIndex
CREATE INDEX "support_complaint_categories_parent_code_idx" ON "support_complaint_categories"("parent_code");

-- CreateIndex
CREATE INDEX "support_resolution_rules_category_code_active_idx" ON "support_resolution_rules"("category_code", "active");

-- CreateIndex
CREATE INDEX "support_resolution_rules_priority_idx" ON "support_resolution_rules"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_formal_tracking_number_key" ON "support_tickets"("formal_tracking_number");

-- CreateIndex
CREATE INDEX "support_tickets_appointment_id_idx" ON "support_tickets"("appointment_id");

-- CreateIndex
CREATE INDEX "support_tickets_created_by_user_id_created_at_idx" ON "support_tickets"("created_by_user_id", "created_at");

-- CreateIndex
CREATE INDEX "support_tickets_provider_profile_id_status_idx" ON "support_tickets"("provider_profile_id", "status");

-- CreateIndex
CREATE INDEX "support_ticket_messages_ticket_id_created_at_idx" ON "support_ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE INDEX "support_ticket_evidence_ticket_id_idx" ON "support_ticket_evidence"("ticket_id");

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_provider_profile_id_fkey" FOREIGN KEY ("provider_profile_id") REFERENCES "provider_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_evidence" ADD CONSTRAINT "support_ticket_evidence_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_evidence" ADD CONSTRAINT "support_ticket_evidence_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

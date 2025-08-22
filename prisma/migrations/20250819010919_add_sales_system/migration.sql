/*
  Warnings:

  - Added the required column `updated_at` to the `contacts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('draft', 'open', 'paid', 'overdue', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('cash', 'bank_transfer', 'credit_card', 'check', 'stripe', 'other');

-- CreateEnum
CREATE TYPE "public"."DocumentCategory" AS ENUM ('contract', 'invoice', 'receipt', 'photo', 'report', 'legal', 'maintenance', 'other');

-- CreateEnum
CREATE TYPE "public"."EntityType" AS ENUM ('property', 'unit', 'contact', 'invoice', 'ticket', 'payment', 'lead', 'deal', 'agent');

-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'viewing_scheduled', 'viewing_completed', 'offer_made', 'negotiating', 'contract_signed', 'closed_won', 'closed_lost', 'on_hold');

-- CreateEnum
CREATE TYPE "public"."LeadSource" AS ENUM ('website', 'referral', 'social_media', 'advertising', 'walk_in', 'phone_call', 'email', 'agent_network', 'other');

-- CreateEnum
CREATE TYPE "public"."SaleType" AS ENUM ('full_payment', 'installment_plan', 'mortgage_assisted', 'rent_to_own');

-- CreateEnum
CREATE TYPE "public"."DealStatus" AS ENUM ('draft', 'active', 'pending_approval', 'approved', 'contract_signed', 'payment_pending', 'completed', 'cancelled', 'on_hold');

-- CreateEnum
CREATE TYPE "public"."PaymentPlanStatus" AS ENUM ('draft', 'active', 'completed', 'defaulted', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('pending', 'approved', 'paid', 'disputed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ContactType" ADD VALUE 'owner';
ALTER TYPE "public"."ContactType" ADD VALUE 'agent';
ALTER TYPE "public"."ContactType" ADD VALUE 'emergency';

-- AlterTable
ALTER TABLE "public"."contacts" ADD COLUMN     "budget" DECIMAL(12,2),
ADD COLUMN     "is_qualified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lead_source" "public"."LeadSource",
ADD COLUMN     "preferences" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;

-- AlterTable
ALTER TABLE "public"."units" ADD COLUMN     "assigned_agent_id" UUID,
ADD COLUMN     "is_for_rent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_for_sale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sale_price" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "public"."sales_agents" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "license_number" TEXT,
    "commission_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.03,
    "territory" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "total_sales" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_commission" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sales_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "contact_id" UUID,
    "unit_id" UUID,
    "property_id" UUID,
    "assigned_agent_id" UUID,
    "status" "public"."LeadStatus" NOT NULL DEFAULT 'new',
    "source" "public"."LeadSource" NOT NULL DEFAULT 'website',
    "score" INTEGER NOT NULL DEFAULT 0,
    "budget" DECIMAL(12,2),
    "timeline" TEXT,
    "notes" TEXT,
    "last_contact_date" TIMESTAMPTZ,
    "next_follow_up_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_activities" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales_deals" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "lead_id" UUID,
    "unit_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "deal_number" TEXT NOT NULL,
    "sale_type" "public"."SaleType" NOT NULL DEFAULT 'full_payment',
    "sale_price" DECIMAL(12,2) NOT NULL,
    "contract_date" DATE,
    "closing_date" DATE,
    "status" "public"."DealStatus" NOT NULL DEFAULT 'draft',
    "down_payment" DECIMAL(12,2),
    "financing_amount" DECIMAL(12,2),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sales_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_plans" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "deal_id" UUID NOT NULL,
    "status" "public"."PaymentPlanStatus" NOT NULL DEFAULT 'draft',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "down_payment" DECIMAL(12,2) NOT NULL,
    "remaining_amount" DECIMAL(12,2) NOT NULL,
    "installment_count" INTEGER NOT NULL,
    "installment_amount" DECIMAL(12,2) NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "start_date" DATE NOT NULL,
    "late_fee_amount" DECIMAL(12,2),
    "grace_period_days" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_milestones" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "milestone_number" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_date" DATE,
    "paid_amount" DECIMAL(12,2),
    "late_fee_applied" BOOLEAN NOT NULL DEFAULT false,
    "late_fee_amount" DECIMAL(12,2),
    "invoice_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commissions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "deal_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'sales',
    "rate" DECIMAL(5,4) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "public"."CommissionStatus" NOT NULL DEFAULT 'pending',
    "paid_date" DATE,
    "paid_amount" DECIMAL(12,2),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."viewing_appointments" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "agent_id" UUID,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "viewing_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "contact_id" UUID,
    "unit_id" UUID,
    "issue_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'draft',
    "stripe_payment_intent_id" TEXT,
    "deal_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "paid_at" TIMESTAMPTZ NOT NULL,
    "reference" TEXT,
    "stripe_payment_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "entity_type" "public"."EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "category" "public"."DocumentCategory" NOT NULL DEFAULT 'other',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "width" INTEGER,
    "height" INTEGER,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_status_history" (
    "id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "from_status" "public"."UnitStatus" NOT NULL,
    "to_status" "public"."UnitStatus" NOT NULL,
    "changed_by_user_id" TEXT NOT NULL,
    "changed_at" TIMESTAMPTZ NOT NULL,
    "notes" TEXT,

    CONSTRAINT "unit_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "entity_type" "public"."EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stripe_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_agents_user_id_key" ON "public"."sales_agents"("user_id");

-- CreateIndex
CREATE INDEX "sales_agents_organization_id_idx" ON "public"."sales_agents"("organization_id");

-- CreateIndex
CREATE INDEX "sales_agents_is_active_idx" ON "public"."sales_agents"("is_active");

-- CreateIndex
CREATE INDEX "sales_agents_created_at_idx" ON "public"."sales_agents"("created_at");

-- CreateIndex
CREATE INDEX "leads_organization_id_idx" ON "public"."leads"("organization_id");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "public"."leads"("status");

-- CreateIndex
CREATE INDEX "leads_assigned_agent_id_idx" ON "public"."leads"("assigned_agent_id");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "public"."leads"("created_at");

-- CreateIndex
CREATE INDEX "lead_activities_lead_id_idx" ON "public"."lead_activities"("lead_id");

-- CreateIndex
CREATE INDEX "lead_activities_created_at_idx" ON "public"."lead_activities"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sales_deals_deal_number_key" ON "public"."sales_deals"("deal_number");

-- CreateIndex
CREATE INDEX "sales_deals_organization_id_idx" ON "public"."sales_deals"("organization_id");

-- CreateIndex
CREATE INDEX "sales_deals_status_idx" ON "public"."sales_deals"("status");

-- CreateIndex
CREATE INDEX "sales_deals_agent_id_idx" ON "public"."sales_deals"("agent_id");

-- CreateIndex
CREATE INDEX "sales_deals_created_at_idx" ON "public"."sales_deals"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_plans_deal_id_key" ON "public"."payment_plans"("deal_id");

-- CreateIndex
CREATE INDEX "payment_plans_organization_id_idx" ON "public"."payment_plans"("organization_id");

-- CreateIndex
CREATE INDEX "payment_plans_status_idx" ON "public"."payment_plans"("status");

-- CreateIndex
CREATE INDEX "payment_plans_start_date_idx" ON "public"."payment_plans"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "payment_milestones_invoice_id_key" ON "public"."payment_milestones"("invoice_id");

-- CreateIndex
CREATE INDEX "payment_milestones_payment_plan_id_idx" ON "public"."payment_milestones"("payment_plan_id");

-- CreateIndex
CREATE INDEX "payment_milestones_due_date_idx" ON "public"."payment_milestones"("due_date");

-- CreateIndex
CREATE INDEX "payment_milestones_is_paid_idx" ON "public"."payment_milestones"("is_paid");

-- CreateIndex
CREATE UNIQUE INDEX "payment_milestones_payment_plan_id_milestone_number_key" ON "public"."payment_milestones"("payment_plan_id", "milestone_number");

-- CreateIndex
CREATE INDEX "commissions_organization_id_idx" ON "public"."commissions"("organization_id");

-- CreateIndex
CREATE INDEX "commissions_agent_id_idx" ON "public"."commissions"("agent_id");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "public"."commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_created_at_idx" ON "public"."commissions"("created_at");

-- CreateIndex
CREATE INDEX "viewing_appointments_organization_id_idx" ON "public"."viewing_appointments"("organization_id");

-- CreateIndex
CREATE INDEX "viewing_appointments_lead_id_idx" ON "public"."viewing_appointments"("lead_id");

-- CreateIndex
CREATE INDEX "viewing_appointments_scheduled_at_idx" ON "public"."viewing_appointments"("scheduled_at");

-- CreateIndex
CREATE INDEX "viewing_appointments_status_idx" ON "public"."viewing_appointments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "public"."invoices"("number");

-- CreateIndex
CREATE INDEX "invoices_organization_id_idx" ON "public"."invoices"("organization_id");

-- CreateIndex
CREATE INDEX "invoices_status_due_date_idx" ON "public"."invoices"("status", "due_date");

-- CreateIndex
CREATE INDEX "invoices_created_at_idx" ON "public"."invoices"("created_at");

-- CreateIndex
CREATE INDEX "invoices_deal_id_idx" ON "public"."invoices"("deal_id");

-- CreateIndex
CREATE INDEX "payments_organization_id_idx" ON "public"."payments"("organization_id");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "public"."payments"("created_at");

-- CreateIndex
CREATE INDEX "documents_organization_id_idx" ON "public"."documents"("organization_id");

-- CreateIndex
CREATE INDEX "documents_entity_type_entity_id_idx" ON "public"."documents"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "documents_created_at_idx" ON "public"."documents"("created_at");

-- CreateIndex
CREATE INDEX "unit_status_history_unit_id_changed_at_idx" ON "public"."unit_status_history"("unit_id", "changed_at");

-- CreateIndex
CREATE INDEX "activity_logs_organization_id_idx" ON "public"."activity_logs"("organization_id");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "public"."activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "public"."activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "contacts_organization_id_idx" ON "public"."contacts"("organization_id");

-- CreateIndex
CREATE INDEX "contacts_type_idx" ON "public"."contacts"("type");

-- CreateIndex
CREATE INDEX "contacts_lead_source_idx" ON "public"."contacts"("lead_source");

-- CreateIndex
CREATE INDEX "contacts_created_at_idx" ON "public"."contacts"("created_at");

-- CreateIndex
CREATE INDEX "properties_organization_id_idx" ON "public"."properties"("organization_id");

-- CreateIndex
CREATE INDEX "properties_created_at_idx" ON "public"."properties"("created_at");

-- CreateIndex
CREATE INDEX "units_status_idx" ON "public"."units"("status");

-- CreateIndex
CREATE INDEX "units_is_for_sale_idx" ON "public"."units"("is_for_sale");

-- CreateIndex
CREATE INDEX "units_assigned_agent_id_idx" ON "public"."units"("assigned_agent_id");

-- CreateIndex
CREATE INDEX "units_created_at_idx" ON "public"."units"("created_at");

-- AddForeignKey
ALTER TABLE "public"."units" ADD CONSTRAINT "units_assigned_agent_id_fkey" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."sales_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_agents" ADD CONSTRAINT "sales_agents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_agents" ADD CONSTRAINT "sales_agents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_assigned_agent_id_fkey" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."sales_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_activities" ADD CONSTRAINT "lead_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_deals" ADD CONSTRAINT "sales_deals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_deals" ADD CONSTRAINT "sales_deals_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_deals" ADD CONSTRAINT "sales_deals_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_deals" ADD CONSTRAINT "sales_deals_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_deals" ADD CONSTRAINT "sales_deals_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."sales_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_plans" ADD CONSTRAINT "payment_plans_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_plans" ADD CONSTRAINT "payment_plans_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."sales_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_milestones" ADD CONSTRAINT "payment_milestones_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_milestones" ADD CONSTRAINT "payment_milestones_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commissions" ADD CONSTRAINT "commissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commissions" ADD CONSTRAINT "commissions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."sales_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commissions" ADD CONSTRAINT "commissions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."sales_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."viewing_appointments" ADD CONSTRAINT "viewing_appointments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."viewing_appointments" ADD CONSTRAINT "viewing_appointments_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."viewing_appointments" ADD CONSTRAINT "viewing_appointments_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."viewing_appointments" ADD CONSTRAINT "viewing_appointments_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."sales_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_status_history" ADD CONSTRAINT "unit_status_history_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_status_history" ADD CONSTRAINT "unit_status_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

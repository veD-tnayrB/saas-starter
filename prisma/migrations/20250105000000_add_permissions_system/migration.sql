-- CreateAppRole
CREATE TABLE "app_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_roles_name_key" ON "app_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "app_roles_priority_key" ON "app_roles"("priority");

-- CreateIndex
CREATE INDEX "app_roles_priority_idx" ON "app_roles"("priority");

-- CreateAction
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "actions_slug_key" ON "actions"("slug");

-- CreateIndex
CREATE INDEX "actions_category_idx" ON "actions"("category");

-- CreateIndex
CREATE INDEX "actions_slug_idx" ON "actions"("slug");

-- CreateSubscriptionPlan
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "stripe_price_id_monthly" TEXT,
    "stripe_price_id_yearly" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX "subscription_plans_name_idx" ON "subscription_plans"("name");

-- CreatePlanActionPermission
CREATE TABLE "plan_action_permissions" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_action_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_action_permissions_plan_id_action_id_key" ON "plan_action_permissions"("plan_id", "action_id");

-- CreateIndex
CREATE INDEX "plan_action_permissions_plan_id_idx" ON "plan_action_permissions"("plan_id");

-- CreateIndex
CREATE INDEX "plan_action_permissions_action_id_idx" ON "plan_action_permissions"("action_id");

-- CreateRoleActionPermission
CREATE TABLE "role_action_permissions" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_action_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_action_permissions_plan_id_role_id_action_id_key" ON "role_action_permissions"("plan_id", "role_id", "action_id");

-- CreateIndex
CREATE INDEX "role_action_permissions_plan_id_role_id_idx" ON "role_action_permissions"("plan_id", "role_id");

-- CreateIndex
CREATE INDEX "role_action_permissions_action_id_idx" ON "role_action_permissions"("action_id");

-- AddColumn
ALTER TABLE "users" ADD COLUMN "subscription_plan_id" TEXT;

-- CreateIndex
CREATE INDEX "users_subscription_plan_id_idx" ON "users"("subscription_plan_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate ProjectMember: Add new columns with nullable first
ALTER TABLE "project_members" ADD COLUMN "project_id" TEXT;
ALTER TABLE "project_members" ADD COLUMN "user_id" TEXT;
ALTER TABLE "project_members" ADD COLUMN "role_id" TEXT;

-- Create AppRoles first (we'll need them for the role_id migration)
-- Insert default roles that will be used for migration
INSERT INTO "app_roles" ("id", "name", "priority", "description", "created_at", "updated_at")
VALUES 
  ('temp-owner', 'OWNER', 0, 'Full control over the project', NOW(), NOW()),
  ('temp-admin', 'ADMIN', 1, 'Can manage members and settings', NOW(), NOW()),
  ('temp-member', 'MEMBER', 2, 'Standard access', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- Migrate existing data: Copy from old columns to new columns
UPDATE "project_members" SET "project_id" = "projectId" WHERE "project_id" IS NULL;
UPDATE "project_members" SET "user_id" = "userId" WHERE "user_id" IS NULL;

-- Migrate role enum to role_id
UPDATE "project_members" pm
SET "role_id" = (
  SELECT ar.id 
  FROM "app_roles" ar 
  WHERE ar.name = pm."role"::text
)
WHERE pm."role_id" IS NULL;

-- Make columns NOT NULL
ALTER TABLE "project_members" ALTER COLUMN "project_id" SET NOT NULL;
ALTER TABLE "project_members" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "project_members" ALTER COLUMN "role_id" SET NOT NULL;

-- Drop old columns
ALTER TABLE "project_members" DROP COLUMN "projectId";
ALTER TABLE "project_members" DROP COLUMN "userId";
ALTER TABLE "project_members" DROP COLUMN "role";

-- Rename columns to match schema (they're already snake_case)
-- The columns are already named correctly, but we need to ensure the constraints

-- Add unique constraint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_user_id_key" UNIQUE ("project_id", "user_id");

-- Add indexes
CREATE INDEX IF NOT EXISTS "project_members_project_id_idx" ON "project_members"("project_id");
CREATE INDEX IF NOT EXISTS "project_members_user_id_idx" ON "project_members"("user_id");
CREATE INDEX IF NOT EXISTS "project_members_role_id_idx" ON "project_members"("role_id");

-- Add foreign key constraints
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate ProjectInvitation: Add new columns
ALTER TABLE "project_invitations" ADD COLUMN "project_id" TEXT;
ALTER TABLE "project_invitations" ADD COLUMN "role_id" TEXT;
ALTER TABLE "project_invitations" ADD COLUMN "invited_by_id" TEXT;

-- Migrate existing data
UPDATE "project_invitations" SET "project_id" = "projectId";
UPDATE "project_invitations" SET "invited_by_id" = "invitedById";

-- Migrate role enum to role_id for invitations
UPDATE "project_invitations" pi
SET "role_id" = (
  SELECT ar.id 
  FROM "app_roles" ar 
  WHERE ar.name = pi."role"::text
)
WHERE pi."role_id" IS NULL;

-- Make columns NOT NULL
ALTER TABLE "project_invitations" ALTER COLUMN "project_id" SET NOT NULL;
ALTER TABLE "project_invitations" ALTER COLUMN "role_id" SET NOT NULL;
ALTER TABLE "project_invitations" ALTER COLUMN "invited_by_id" SET NOT NULL;

-- Drop old columns
ALTER TABLE "project_invitations" DROP COLUMN "projectId";
ALTER TABLE "project_invitations" DROP COLUMN "invitedById";
ALTER TABLE "project_invitations" DROP COLUMN "role";

-- Add indexes
CREATE INDEX IF NOT EXISTS "project_invitations_role_id_idx" ON "project_invitations"("role_id");

-- Add foreign key constraints
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old enum (if it exists and is not used elsewhere)
-- Note: We'll keep it for now in case there are other references, but it should be removed
-- DROP TYPE IF EXISTS "ProjectRole";


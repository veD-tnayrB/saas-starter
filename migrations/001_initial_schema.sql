-- Initial schema migration
-- This migration creates all tables using SQL definitions managed via Kysely
-- All table and column names use snake_case

-- Enable UUID extension for generating IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: users (must be created first as other tables reference it)
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "email_verified" TIMESTAMP(3),
  "image" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "stripe_price_id" TEXT,
  "stripe_current_period_end" TIMESTAMP(3),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_stripe_customer_id_key" ON "users"("stripe_customer_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");

-- Table: accounts (depends on users)
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts"("user_id");

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Table: sessions (depends on users)
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT NOT NULL,
  "session_token" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sessions_session_token_key" ON "sessions"("session_token");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Table: verification_tokens
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier", "token")
);

CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");

-- Table: app_roles
CREATE TABLE IF NOT EXISTS "app_roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priority" INTEGER NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "app_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "app_roles_name_key" ON "app_roles"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "app_roles_priority_key" ON "app_roles"("priority");
CREATE INDEX IF NOT EXISTS "app_roles_priority_idx" ON "app_roles"("priority");

-- Table: actions
CREATE TABLE IF NOT EXISTS "actions" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "actions_slug_key" ON "actions"("slug");
CREATE INDEX IF NOT EXISTS "actions_category_idx" ON "actions"("category");
CREATE INDEX IF NOT EXISTS "actions_slug_idx" ON "actions"("slug");

-- Table: subscription_plans
CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "description" TEXT,
  "stripe_price_id_monthly" TEXT,
  "stripe_price_id_yearly" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_name_key" ON "subscription_plans"("name");
CREATE INDEX IF NOT EXISTS "subscription_plans_name_idx" ON "subscription_plans"("name");

-- Table: plan_action_permissions
CREATE TABLE IF NOT EXISTS "plan_action_permissions" (
  "id" TEXT NOT NULL,
  "plan_id" TEXT NOT NULL,
  "action_id" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plan_action_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "plan_action_permissions_plan_id_action_id_key" ON "plan_action_permissions"("plan_id", "action_id");
CREATE INDEX IF NOT EXISTS "plan_action_permissions_plan_id_idx" ON "plan_action_permissions"("plan_id");
CREATE INDEX IF NOT EXISTS "plan_action_permissions_action_id_idx" ON "plan_action_permissions"("action_id");

ALTER TABLE "plan_action_permissions" ADD CONSTRAINT "plan_action_permissions_plan_id_fkey" 
  FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plan_action_permissions" ADD CONSTRAINT "plan_action_permissions_action_id_fkey" 
  FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Table: role_action_permissions
CREATE TABLE IF NOT EXISTS "role_action_permissions" (
  "id" TEXT NOT NULL,
  "plan_id" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "action_id" TEXT NOT NULL,
  "allowed" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "role_action_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "role_action_permissions_plan_id_role_id_action_id_key" ON "role_action_permissions"("plan_id", "role_id", "action_id");
CREATE INDEX IF NOT EXISTS "role_action_permissions_plan_id_role_id_idx" ON "role_action_permissions"("plan_id", "role_id");
CREATE INDEX IF NOT EXISTS "role_action_permissions_action_id_idx" ON "role_action_permissions"("action_id");

ALTER TABLE "role_action_permissions" ADD CONSTRAINT "role_action_permissions_plan_id_fkey" 
  FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_action_permissions" ADD CONSTRAINT "role_action_permissions_role_id_fkey" 
  FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_action_permissions" ADD CONSTRAINT "role_action_permissions_action_id_fkey" 
  FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Table: projects
CREATE TABLE IF NOT EXISTS "projects" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "owner_id" TEXT NOT NULL,
  "subscription_plan_id" TEXT,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "projects_owner_id_idx" ON "projects"("owner_id");
CREATE INDEX IF NOT EXISTS "projects_subscription_plan_id_idx" ON "projects"("subscription_plan_id");

ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" 
  FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_subscription_plan_id_fkey" 
  FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Table: project_members
CREATE TABLE IF NOT EXISTS "project_members" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");
CREATE INDEX IF NOT EXISTS "project_members_project_id_idx" ON "project_members"("project_id");
CREATE INDEX IF NOT EXISTS "project_members_user_id_idx" ON "project_members"("user_id");
CREATE INDEX IF NOT EXISTS "project_members_role_id_idx" ON "project_members"("role_id");

ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" 
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_role_id_fkey" 
  FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Table: project_invitations
CREATE TABLE IF NOT EXISTS "project_invitations" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "invited_by_id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "project_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_invitations_token_key" ON "project_invitations"("token");
CREATE INDEX IF NOT EXISTS "project_invitations_project_id_idx" ON "project_invitations"("project_id");
CREATE INDEX IF NOT EXISTS "project_invitations_email_idx" ON "project_invitations"("email");
CREATE INDEX IF NOT EXISTS "project_invitations_token_idx" ON "project_invitations"("token");
CREATE INDEX IF NOT EXISTS "project_invitations_role_id_idx" ON "project_invitations"("role_id");

ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_project_id_fkey" 
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_invited_by_id_fkey" 
  FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_invitations" ADD CONSTRAINT "project_invitations_role_id_fkey" 
  FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migration: Add core projects and modules support
-- This migration adds is_core field to projects and creates modules tables

-- Add is_core field to projects table
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "is_core" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "projects_is_core_idx" ON "projects"("is_core");

-- Table: modules
CREATE TABLE IF NOT EXISTS "modules" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "modules_slug_key" ON "modules"("slug");
CREATE INDEX IF NOT EXISTS "modules_slug_idx" ON "modules"("slug");
CREATE INDEX IF NOT EXISTS "modules_is_active_idx" ON "modules"("is_active");

-- Table: module_actions (many-to-many relationship)
CREATE TABLE IF NOT EXISTS "module_actions" (
  "id" TEXT NOT NULL,
  "module_id" TEXT NOT NULL,
  "action_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "module_actions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "module_actions_module_id_action_id_key" ON "module_actions"("module_id", "action_id");
CREATE INDEX IF NOT EXISTS "module_actions_module_id_idx" ON "module_actions"("module_id");
CREATE INDEX IF NOT EXISTS "module_actions_action_id_idx" ON "module_actions"("action_id");

ALTER TABLE "module_actions" ADD CONSTRAINT "module_actions_module_id_fkey" 
  FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "module_actions" ADD CONSTRAINT "module_actions_action_id_fkey" 
  FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default core modules
-- These modules are only accessible by users in projects with is_core = true
INSERT INTO "modules" ("id", "slug", "name", "description", "icon", "is_active", "created_at", "updated_at")
VALUES 
  (gen_random_uuid()::text, 'roles-management', 'Roles Management', 'Manage application roles and their permissions', 'users', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'actions-management', 'Actions Management', 'Manage application actions and permissions', 'zap', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'modules-management', 'Modules Management', 'Manage application modules and their associated actions', 'package', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'permissions-management', 'Permissions Management', 'Manage role-action permissions and plan configurations', 'shield', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Note: Actions will be associated to modules through the module_actions table
-- This can be done via the UI or through additional migration scripts


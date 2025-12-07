-- Migration: Multi-roles support for project members
-- This migration allows users to have multiple roles within the same project

-- Step 1: Remove the unique constraint on (project_id, user_id)
-- This allows multiple project_member records per user-project pair
ALTER TABLE "project_members" DROP CONSTRAINT IF EXISTS "project_members_project_id_user_id_key";

-- Step 2: Create new table for project member roles (many-to-many)
CREATE TABLE IF NOT EXISTS "project_member_roles" (
  "id" TEXT NOT NULL,
  "project_member_id" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_member_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_member_roles_project_member_id_role_id_key" 
  ON "project_member_roles"("project_member_id", "role_id");
CREATE INDEX IF NOT EXISTS "project_member_roles_project_member_id_idx" 
  ON "project_member_roles"("project_member_id");
CREATE INDEX IF NOT EXISTS "project_member_roles_role_id_idx" 
  ON "project_member_roles"("role_id");

ALTER TABLE "project_member_roles" ADD CONSTRAINT "project_member_roles_project_member_id_fkey" 
  FOREIGN KEY ("project_member_id") REFERENCES "project_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_member_roles" ADD CONSTRAINT "project_member_roles_role_id_fkey" 
  FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 3: Migrate existing data
-- For each existing project_member, create a corresponding project_member_role
INSERT INTO "project_member_roles" ("id", "project_member_id", "role_id", "created_at")
SELECT 
  gen_random_uuid()::text,
  pm.id,
  pm.role_id,
  pm.created_at
FROM "project_members" pm
WHERE pm.role_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM "project_member_roles" pmr 
    WHERE pmr.project_member_id = pm.id 
      AND pmr.role_id = pm.role_id
  );

-- Step 4: Make role_id nullable in project_members for backward compatibility
-- We'll keep it for now but it will be deprecated
ALTER TABLE "project_members" ALTER COLUMN "role_id" DROP NOT NULL;

-- Step 5: Update project_invitations to support multiple roles
-- Create new table for invitation roles
CREATE TABLE IF NOT EXISTS "project_invitation_roles" (
  "id" TEXT NOT NULL,
  "project_invitation_id" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_invitation_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_invitation_roles_project_invitation_id_role_id_key" 
  ON "project_invitation_roles"("project_invitation_id", "role_id");
CREATE INDEX IF NOT EXISTS "project_invitation_roles_project_invitation_id_idx" 
  ON "project_invitation_roles"("project_invitation_id");
CREATE INDEX IF NOT EXISTS "project_invitation_roles_role_id_idx" 
  ON "project_invitation_roles"("role_id");

ALTER TABLE "project_invitation_roles" ADD CONSTRAINT "project_invitation_roles_project_invitation_id_fkey" 
  FOREIGN KEY ("project_invitation_id") REFERENCES "project_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_invitation_roles" ADD CONSTRAINT "project_invitation_roles_role_id_fkey" 
  FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Migrate existing invitation data
-- For each existing project_invitation, create a corresponding project_invitation_role
INSERT INTO "project_invitation_roles" ("id", "project_invitation_id", "role_id", "created_at")
SELECT 
  gen_random_uuid()::text,
  pi.id,
  pi.role_id,
  pi.created_at
FROM "project_invitations" pi
WHERE pi.role_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM "project_invitation_roles" pir 
    WHERE pir.project_invitation_id = pi.id 
      AND pir.role_id = pi.role_id
  );

-- Step 7: Make role_id nullable in project_invitations for backward compatibility
ALTER TABLE "project_invitations" ALTER COLUMN "role_id" DROP NOT NULL;






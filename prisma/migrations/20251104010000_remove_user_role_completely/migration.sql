-- Remove User.role column completely
-- Roles are now project-specific only (ProjectMember.role)

-- Step 1: Drop the UserRole enum if it exists
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Step 2: Drop the role column from users table
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";


-- Fix ownerId column name to owner_id in projects table
-- The original migration created it as "ownerId" but we need snake_case

-- Step 1: Rename the column from ownerId to owner_id
ALTER TABLE "projects" RENAME COLUMN "ownerId" TO "owner_id";

-- Step 2: Drop the old index
DROP INDEX IF EXISTS "projects_ownerId_idx";

-- Step 3: Create new index with correct name
CREATE INDEX "projects_owner_id_idx" ON "projects"("owner_id");

-- Step 4: Drop the old foreign key constraint
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_ownerId_fkey";

-- Step 5: Add new foreign key constraint with correct column name
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


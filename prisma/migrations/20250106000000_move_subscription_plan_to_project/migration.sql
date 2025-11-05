-- Move subscription_plan_id from users to projects table

-- Step 1: Add subscription_plan_id column to projects table
ALTER TABLE "projects" ADD COLUMN "subscription_plan_id" TEXT;

-- Step 2: Create index on projects.subscription_plan_id
CREATE INDEX "projects_subscription_plan_id_idx" ON "projects"("subscription_plan_id");

-- Step 3: Add foreign key constraint to projects.subscription_plan_id
ALTER TABLE "projects" ADD CONSTRAINT "projects_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Migrate data: Copy subscription_plan_id from users to their owned projects
-- For each user, assign their subscription plan to all their owned projects
-- Note: ownerId in Prisma maps to owner_id in the database
UPDATE "projects" 
SET "subscription_plan_id" = (
  SELECT "subscription_plan_id" 
  FROM "users" 
  WHERE "users"."id" = "projects"."owner_id"
)
WHERE EXISTS (
  SELECT 1 
  FROM "users" 
  WHERE "users"."id" = "projects"."owner_id" 
  AND "users"."subscription_plan_id" IS NOT NULL
);

-- Step 5: Remove subscription_plan_id from users table
-- First, drop the foreign key constraint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_subscription_plan_id_fkey";

-- Then, drop the index
DROP INDEX IF EXISTS "users_subscription_plan_id_idx";

-- Finally, drop the column
ALTER TABLE "users" DROP COLUMN IF EXISTS "subscription_plan_id";


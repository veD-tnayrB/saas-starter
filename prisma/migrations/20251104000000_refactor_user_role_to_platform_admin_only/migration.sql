-- Step 1: Update existing data - convert OWNER and MEMBER to NULL (only ADMIN remains)
UPDATE "users" SET "role" = NULL WHERE "role" IN ('OWNER', 'MEMBER');

-- Step 2: Alter UserRole enum to only have ADMIN
-- First, convert to text, update enum, then convert back
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;

-- Drop old enum and create new one
DROP TYPE IF EXISTS "UserRole" CASCADE;
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- Convert back to enum (only ADMIN values will remain, others are now NULL)
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING (
  CASE 
    WHEN "role" = 'ADMIN' THEN 'ADMIN'::"UserRole"
    ELSE NULL
  END
);

-- Make role nullable (no default)
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;


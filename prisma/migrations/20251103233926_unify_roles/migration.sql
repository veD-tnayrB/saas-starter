-- Step 1: Update existing data (convert to text first, then update)
-- Convert USER to MEMBER in users table
ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
UPDATE "users" SET "role" = 'MEMBER' WHERE "role" = 'USER';

-- Step 2: Update ProjectRole enum if it has VIEWER (from old migrations)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectRole') THEN
    -- Check if VIEWER exists in the enum by trying to convert
    IF EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'VIEWER' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectRole')
    ) THEN
      -- Convert to text, update data, recreate enum
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_members') THEN
        ALTER TABLE "project_members" ALTER COLUMN "role" TYPE TEXT;
        UPDATE "project_members" SET "role" = 'MEMBER' WHERE "role" = 'VIEWER';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_invitations') THEN
        ALTER TABLE "project_invitations" ALTER COLUMN "role" TYPE TEXT;
        UPDATE "project_invitations" SET "role" = 'MEMBER' WHERE "role" = 'VIEWER';
      END IF;
      DROP TYPE "ProjectRole" CASCADE;
      CREATE TYPE "ProjectRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_members') THEN
        ALTER TABLE "project_members" ALTER COLUMN "role" TYPE "ProjectRole" USING ("role"::"ProjectRole");
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_invitations') THEN
        ALTER TABLE "project_invitations" ALTER COLUMN "role" TYPE "ProjectRole" USING ("role"::"ProjectRole");
      END IF;
    END IF;
  END IF;
END $$;


-- Step 3: Recreate UserRole enum with new values
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
DROP TYPE IF EXISTS "UserRole" CASCADE;
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::"UserRole");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

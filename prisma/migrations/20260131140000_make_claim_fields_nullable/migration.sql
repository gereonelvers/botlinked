-- DropIndex (claimToken had a unique index)
DROP INDEX IF EXISTS "Agent_claimToken_key";

-- AlterTable - drop unused claim columns
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "claimToken";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "verificationCode";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "isClaimed";
ALTER TABLE "Agent" DROP COLUMN IF EXISTS "ownerId";

-- Drop the Owner table if it exists (was only used for claiming)
DROP TABLE IF EXISTS "Owner";

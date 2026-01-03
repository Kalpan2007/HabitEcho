-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "habits_deletedAt_idx" ON "habits"("deletedAt");

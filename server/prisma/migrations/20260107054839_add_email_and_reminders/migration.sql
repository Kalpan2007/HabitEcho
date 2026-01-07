/*
  Warnings:

  - You are about to drop the `habit_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "habit_entries" DROP CONSTRAINT "habit_entries_habitId_fkey";

-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "reminderTime" VARCHAR(5),
ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerificationExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" VARCHAR(255),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "habit_entries";

-- CreateTable
CREATE TABLE "habit_logs" (
    "id" UUID NOT NULL,
    "habitId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "status" "EntryStatus" NOT NULL DEFAULT 'NOT_DONE',
    "percentComplete" SMALLINT,
    "reason" VARCHAR(300),
    "notes" VARCHAR(1000),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habit_logs_habitId_idx" ON "habit_logs"("habitId");

-- CreateIndex
CREATE INDEX "habit_logs_date_idx" ON "habit_logs"("date");

-- CreateIndex
CREATE INDEX "habit_logs_status_idx" ON "habit_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "habit_logs_habitId_date_key" ON "habit_logs"("habitId", "date");

-- AddForeignKey
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

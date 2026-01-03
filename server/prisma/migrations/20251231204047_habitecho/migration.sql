-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('STUDENT', 'ENGINEER', 'DOCTOR', 'OTHER');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('DONE', 'NOT_DONE', 'PARTIAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "occupation" "Occupation" NOT NULL,
    "dateOfBirth" DATE,
    "age" SMALLINT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_records" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "frequency" "Frequency" NOT NULL,
    "scheduleDays" JSONB,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_entries" (
    "id" UUID NOT NULL,
    "habitId" UUID NOT NULL,
    "entryDate" DATE NOT NULL,
    "status" "EntryStatus" NOT NULL,
    "percentComplete" SMALLINT,
    "reason" VARCHAR(300),
    "notes" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phoneNumber_idx" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "otp_records_userId_idx" ON "otp_records"("userId");

-- CreateIndex
CREATE INDEX "otp_records_type_idx" ON "otp_records"("type");

-- CreateIndex
CREATE INDEX "otp_records_expiresAt_idx" ON "otp_records"("expiresAt");

-- CreateIndex
CREATE INDEX "habits_userId_idx" ON "habits"("userId");

-- CreateIndex
CREATE INDEX "habits_isActive_idx" ON "habits"("isActive");

-- CreateIndex
CREATE INDEX "habits_startDate_idx" ON "habits"("startDate");

-- CreateIndex
CREATE INDEX "habits_endDate_idx" ON "habits"("endDate");

-- CreateIndex
CREATE INDEX "habits_createdAt_idx" ON "habits"("createdAt");

-- CreateIndex
CREATE INDEX "habit_entries_habitId_idx" ON "habit_entries"("habitId");

-- CreateIndex
CREATE INDEX "habit_entries_entryDate_idx" ON "habit_entries"("entryDate");

-- CreateIndex
CREATE INDEX "habit_entries_status_idx" ON "habit_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "habit_entries_habitId_entryDate_key" ON "habit_entries"("habitId", "entryDate");

-- AddForeignKey
ALTER TABLE "otp_records" ADD CONSTRAINT "otp_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_entries" ADD CONSTRAINT "habit_entries_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

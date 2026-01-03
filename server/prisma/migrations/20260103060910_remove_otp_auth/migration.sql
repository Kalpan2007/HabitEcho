/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `otp_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "otp_records" DROP CONSTRAINT "otp_records_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerified";

-- DropTable
DROP TABLE "otp_records";

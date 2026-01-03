/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_phoneNumber_idx";

-- DropIndex
DROP INDEX "users_phoneNumber_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "phoneNumber",
DROP COLUMN "phoneVerified";

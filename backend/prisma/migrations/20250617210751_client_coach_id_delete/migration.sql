/*
  Warnings:

  - Made the column `coachId` on table `Clients` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Clients" DROP CONSTRAINT "Clients_coachId_fkey";

-- DropIndex
DROP INDEX "Clients_coachId_key";

-- AlterTable
ALTER TABLE "Clients" ALTER COLUMN "coachId" SET NOT NULL;

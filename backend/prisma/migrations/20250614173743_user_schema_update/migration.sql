/*
  Warnings:

  - Added the required column `email` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clients" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MeanPlans" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

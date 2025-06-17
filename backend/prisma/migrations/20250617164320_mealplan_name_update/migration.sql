/*
  Warnings:

  - You are about to drop the `MeanPlans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MeanPlans" DROP CONSTRAINT "MeanPlans_clientId_fkey";

-- DropForeignKey
ALTER TABLE "MeanPlans" DROP CONSTRAINT "MeanPlans_createdBy_fkey";

-- DropTable
DROP TABLE "MeanPlans";

-- CreateTable
CREATE TABLE "MealPlans" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "meals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MealPlans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MealPlans" ADD CONSTRAINT "MealPlans_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlans" ADD CONSTRAINT "MealPlans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

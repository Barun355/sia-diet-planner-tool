-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'TEAM', 'ADMIN');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "contactNumber" INTEGER NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeanPlans" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "meals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeanPlans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clients_coachId_key" ON "Clients"("coachId");

-- AddForeignKey
ALTER TABLE "Clients" ADD CONSTRAINT "Clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clients" ADD CONSTRAINT "Clients_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeanPlans" ADD CONSTRAINT "MeanPlans_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeanPlans" ADD CONSTRAINT "MeanPlans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

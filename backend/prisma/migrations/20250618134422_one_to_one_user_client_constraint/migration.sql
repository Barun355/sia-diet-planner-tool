/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Clients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Clients_userId_key" ON "Clients"("userId");

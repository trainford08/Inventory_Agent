/*
  Warnings:

  - Added the required column `updatedAt` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LastActor" AS ENUM ('AGENT', 'HUMAN');

-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "lastActor" "LastActor",
ADD COLUMN     "lastActorId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

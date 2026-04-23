-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "MigrationApproach" AS ENUM ('MOVES', 'STAYS', 'BOTH', 'MIXED');

-- AlterTable
ALTER TABLE "JtbdEntry" ADD COLUMN     "migrationApproach" "MigrationApproach";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "effortConfidence" "Confidence",
ADD COLUMN     "effortEstimateHighWeeks" INTEGER,
ADD COLUMN     "effortEstimateLowWeeks" INTEGER,
ADD COLUMN     "effortProgressWeeks" DOUBLE PRECISION,
ADD COLUMN     "engineerCount" INTEGER,
ADD COLUMN     "healthStatus" "HealthStatus",
ADD COLUMN     "securityClassification" TEXT,
ADD COLUMN     "slackWeeks" INTEGER,
ADD COLUMN     "targetCutoverAt" TIMESTAMP(3),
ADD COLUMN     "tier" "Tier";

-- CreateIndex
CREATE INDEX "Team_healthStatus_idx" ON "Team"("healthStatus");

-- CreateIndex
CREATE INDEX "Team_targetCutoverAt_idx" ON "Team"("targetCutoverAt");

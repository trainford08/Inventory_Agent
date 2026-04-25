/*
  Warnings:

  - You are about to drop the column `migrationApproach` on the `Customization` table. All the data in the column will be lost.
  - Added the required column `name` to the `Customization` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Customization` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CustomizationCategory" AS ENUM ('BOARDS', 'PIPELINES', 'REPOS', 'DASHBOARDS', 'EXTENSIONS', 'PROCESS', 'SECURITY');

-- CreateEnum
CREATE TYPE "CustomizationCommonality" AS ENUM ('MOST', 'SOME', 'RARE');

-- CreateEnum
CREATE TYPE "GithubParity" AS ENUM ('MATCH', 'PARTIAL', 'GAP', 'BETTER');

-- CreateEnum
CREATE TYPE "MigrationStrategy" AS ENUM ('S01_PROTECT_IN_PLACE', 'S02_TRANSLATE_TO_GITHUB', 'S03_RETIRE', 'S04_REBUILD_WITH_LOSS', 'S05_BUILD_GLUE', 'S06_UPSTREAM', 'S07_CONSOLIDATE_THIRD_PARTY');

-- AlterTable
ALTER TABLE "Customization" DROP COLUMN "migrationApproach",
ADD COLUMN     "catalogId" TEXT,
ADD COLUMN     "hybridPlacement" "MigrationApproach",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "parity" "GithubParity",
ADD COLUMN     "strategy" "MigrationStrategy",
DROP COLUMN "category",
ADD COLUMN     "category" "CustomizationCategory" NOT NULL;

-- CreateTable
CREATE TABLE "CustomizationCatalog" (
    "id" TEXT NOT NULL,
    "catalogCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "CustomizationCategory" NOT NULL,
    "commonality" "CustomizationCommonality" NOT NULL,
    "parity" "GithubParity" NOT NULL,
    "strategy" "MigrationStrategy" NOT NULL,
    "hybridPlacement" "MigrationApproach" NOT NULL,
    "jobsToBeDone" TEXT NOT NULL,
    "githubEquivalent" TEXT NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "CustomizationCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomizationCatalog_catalogCode_key" ON "CustomizationCatalog"("catalogCode");

-- CreateIndex
CREATE INDEX "CustomizationCatalog_category_idx" ON "CustomizationCatalog"("category");

-- CreateIndex
CREATE INDEX "Customization_teamId_idx" ON "Customization"("teamId");

-- CreateIndex
CREATE INDEX "Customization_catalogId_idx" ON "Customization"("catalogId");

-- AddForeignKey
ALTER TABLE "Customization" ADD CONSTRAINT "Customization_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "CustomizationCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

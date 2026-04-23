-- CreateEnum
CREATE TYPE "RunnerType" AS ENUM ('MICROSOFT_HOSTED', 'SELF_HOSTED', 'MIXED');

-- CreateEnum
CREATE TYPE "ServiceConnectionType" AS ENUM ('AZURE_RM', 'AZURE_CONTAINER_REGISTRY', 'DOCKER_HUB', 'GITHUB', 'KUBERNETES', 'NUGET_FEED', 'NPM_FEED', 'SSH', 'GENERIC');

-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "branchProtected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "commits90d" INTEGER,
ADD COLUMN     "contributorCount" INTEGER,
ADD COLUMN     "hasLfs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasWiki" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "languageBreakdown" JSONB,
ADD COLUMN     "lfsSizeGb" DOUBLE PRECISION,
ADD COLUMN     "loc" INTEGER,
ADD COLUMN     "submoduleUrls" TEXT[],
ADD COLUMN     "wikiPageCount" INTEGER;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "buildArtifactCount" INTEGER,
ADD COLUMN     "wikiPageCount" INTEGER,
ADD COLUMN     "workItemsActive" INTEGER,
ADD COLUMN     "workItemsClosed90d" INTEGER;

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "agentPool" TEXT,
ADD COLUMN     "averageDurationMin" INTEGER,
ADD COLUMN     "deprecatedTasks" TEXT[],
ADD COLUMN     "failsLast30d" INTEGER,
ADD COLUMN     "runnerType" "RunnerType" NOT NULL DEFAULT 'MICROSOFT_HOSTED',
ADD COLUMN     "stageCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "triggersPerWeek" INTEGER,
ADD COLUMN     "usesVariableGroups" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AdoProject" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" TEXT NOT NULL,
    "repoCount" INTEGER NOT NULL,
    "pipelineCount" INTEGER NOT NULL,
    "boardCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdoProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceConnection" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ServiceConnectionType" NOT NULL,
    "targetService" TEXT NOT NULL,
    "authMethod" TEXT NOT NULL,
    "hasStoredCredential" BOOLEAN NOT NULL DEFAULT false,
    "usedByCount" INTEGER NOT NULL DEFAULT 0,
    "lastRotatedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseDefinition" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stages" INTEGER NOT NULL,
    "isClassic" BOOLEAN NOT NULL DEFAULT true,
    "hasManualGates" BOOLEAN NOT NULL DEFAULT false,
    "gateTypes" TEXT[],
    "deployTargets" TEXT[],
    "lastRunAt" TIMESTAMP(3),

    CONSTRAINT "ReleaseDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extension" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hasGitHubEquivalent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "Extension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdoProject_teamId_idx" ON "AdoProject"("teamId");

-- CreateIndex
CREATE INDEX "ServiceConnection_teamId_idx" ON "ServiceConnection"("teamId");

-- CreateIndex
CREATE INDEX "ReleaseDefinition_teamId_idx" ON "ReleaseDefinition"("teamId");

-- CreateIndex
CREATE INDEX "Extension_teamId_idx" ON "Extension"("teamId");

-- CreateIndex
CREATE INDEX "Repo_codebaseId_idx" ON "Repo"("codebaseId");

-- CreateIndex
CREATE INDEX "Workflow_teamId_idx" ON "Workflow"("teamId");

-- AddForeignKey
ALTER TABLE "AdoProject" ADD CONSTRAINT "AdoProject_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceConnection" ADD CONSTRAINT "ServiceConnection_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseDefinition" ADD CONSTRAINT "ReleaseDefinition_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extension" ADD CONSTRAINT "Extension_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

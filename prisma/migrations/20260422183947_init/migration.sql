-- CreateEnum
CREATE TYPE "Cohort" AS ENUM ('UNASSIGNED', 'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT');

-- CreateEnum
CREATE TYPE "MigrationState" AS ENUM ('NOT_STARTED', 'DISCOVERING', 'REVIEWING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "WorkflowType" AS ENUM ('BUILD', 'RELEASE', 'TEST', 'DEPLOY', 'OTHER');

-- CreateEnum
CREATE TYPE "CustomizationStatus" AS ENUM ('UNKNOWN', 'AGENT_HANDLED', 'NEEDS_HUMAN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('OPEN', 'MITIGATED', 'ACCEPTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FindingSource" AS ENUM ('ADO_API', 'INFERRED', 'NEEDS_INPUT');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CORRECTED', 'OVERRIDDEN');

-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adoOrgSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "championId" TEXT,
    "cohort" "Cohort" NOT NULL DEFAULT 'UNASSIGNED',
    "wave" INTEGER,
    "migrationState" "MigrationState" NOT NULL DEFAULT 'NOT_STARTED',
    "latestFindingsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Codebase" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "primaryLang" TEXT,
    "usesLfs" BOOLEAN NOT NULL DEFAULT false,
    "totalSizeGb" DOUBLE PRECISION,

    CONSTRAINT "Codebase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL,
    "codebaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "sizeGb" DOUBLE PRECISION,
    "hasSubmodules" BOOLEAN NOT NULL DEFAULT false,
    "primaryOwner" TEXT,
    "lastCommitAt" TIMESTAMP(3),

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkflowType" NOT NULL,
    "isClassic" BOOLEAN NOT NULL DEFAULT false,
    "customTasks" TEXT[],

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JtbdEntry" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "jtbdCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "performed" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT,
    "notes" TEXT,

    CONSTRAINT "JtbdEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customization" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "migrationApproach" TEXT,
    "status" "CustomizationStatus" NOT NULL DEFAULT 'UNKNOWN',

    CONSTRAINT "Customization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "confidence" "Confidence" NOT NULL DEFAULT 'MEDIUM',
    "mitigation" TEXT,
    "status" "RiskStatus" NOT NULL DEFAULT 'OPEN',
    "category" TEXT NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ownership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "primaryOwnerEmail" TEXT,
    "onCallGroup" TEXT,
    "escalationContact" TEXT,

    CONSTRAINT "Ownership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "triggeredBy" TEXT NOT NULL,
    "scopeTeamId" TEXT NOT NULL,
    "autoPopulatedCount" INTEGER NOT NULL DEFAULT 0,
    "needsInputCount" INTEGER NOT NULL DEFAULT 0,
    "anomalyCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fieldPath" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "value" TEXT,
    "source" "FindingSource" NOT NULL,
    "confidence" "Confidence" NOT NULL DEFAULT 'HIGH',
    "triedNote" TEXT,
    "status" "FindingStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Org_name_key" ON "Org"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Org_adoOrgSlug_key" ON "Org"("adoOrgSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Team_championId_key" ON "Team"("championId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_latestFindingsId_key" ON "Team"("latestFindingsId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Codebase_teamId_key" ON "Codebase"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Ownership_teamId_key" ON "Ownership"("teamId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_championId_fkey" FOREIGN KEY ("championId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_latestFindingsId_fkey" FOREIGN KEY ("latestFindingsId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Codebase" ADD CONSTRAINT "Codebase_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repo" ADD CONSTRAINT "Repo_codebaseId_fkey" FOREIGN KEY ("codebaseId") REFERENCES "Codebase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JtbdEntry" ADD CONSTRAINT "JtbdEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customization" ADD CONSTRAINT "Customization_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

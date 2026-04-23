-- CreateEnum
CREATE TYPE "EvidenceKind" AS ENUM ('FILE', 'FOLDER', 'URL', 'API_RESPONSE', 'CONFIG', 'LOG', 'SNIPPET');

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "kind" "EvidenceKind" NOT NULL,
    "path" TEXT NOT NULL,
    "snippet" TEXT,
    "metadata" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evidence_findingId_idx" ON "Evidence"("findingId");

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

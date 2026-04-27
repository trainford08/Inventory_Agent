-- CreateTable
CREATE TABLE "AdaConversation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdaConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdaConversation_teamId_key" ON "AdaConversation"("teamId");

-- AddForeignKey
ALTER TABLE "AdaConversation" ADD CONSTRAINT "AdaConversation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

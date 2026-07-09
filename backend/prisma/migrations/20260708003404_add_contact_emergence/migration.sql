-- AlterTable
ALTER TABLE "User" ALTER COLUMN "sexo" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ContactEmergence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "telefono" TEXT,

    CONSTRAINT "ContactEmergence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactEmergence_userId_idx" ON "ContactEmergence"("userId");

-- AddForeignKey
ALTER TABLE "ContactEmergence" ADD CONSTRAINT "ContactEmergence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

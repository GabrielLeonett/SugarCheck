-- CreateTable
CREATE TABLE "Glucose" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "valueMgdl" DOUBLE PRECISION NOT NULL,
    "mealTag" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Glucose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HbA1c" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "valuePercent" DOUBLE PRECISION NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HbA1c_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Glucose_userId_idx" ON "Glucose"("userId");

-- CreateIndex
CREATE INDEX "Glucose_userId_date_idx" ON "Glucose"("userId", "date");

-- CreateIndex
CREATE INDEX "HbA1c_userId_idx" ON "HbA1c"("userId");

-- AddForeignKey
ALTER TABLE "Glucose" ADD CONSTRAINT "Glucose_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HbA1c" ADD CONSTRAINT "HbA1c_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

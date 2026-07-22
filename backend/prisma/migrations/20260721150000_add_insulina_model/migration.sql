-- CreateTable
CREATE TABLE "Insulina" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dosis" DOUBLE PRECISION NOT NULL,
    "unidades" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "contexto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insulina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Insulina_userId_idx" ON "Insulina"("userId");

-- CreateIndex
CREATE INDEX "Insulina_userId_fecha_idx" ON "Insulina"("userId", "fecha");

-- AddForeignKey
ALTER TABLE "Insulina" ADD CONSTRAINT "Insulina_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

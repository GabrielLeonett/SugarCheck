-- CreateTable
-- NOTE: la tabla ya existía en la base de datos de desarrollo (creada fuera de
-- las migraciones), por eso se usa IF NOT EXISTS para que esta migración sea
-- segura tanto en bases existentes como en despliegues nuevos.
CREATE TABLE IF NOT EXISTS "CaminoProgreso" (
    "userId" TEXT NOT NULL,
    "ultimoNivelCompletado" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaminoProgreso_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CaminoProgreso_userId_fkey'
    ) THEN
        ALTER TABLE "CaminoProgreso"
            ADD CONSTRAINT "CaminoProgreso_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AlterTable
ALTER TABLE "Preference" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'es',
ADD COLUMN     "profileImg" TEXT NOT NULL DEFAULT '../../../assets/profile/GlucoAstro.png',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';

/*
  Warnings:

  - You are about to drop the column `locale` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `Preference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Preference" DROP COLUMN "locale",
DROP COLUMN "theme";

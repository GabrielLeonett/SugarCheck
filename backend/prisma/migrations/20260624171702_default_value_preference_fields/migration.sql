-- AlterTable
ALTER TABLE "Preference" ALTER COLUMN "unitMeasure" SET DEFAULT 'mg/dL',
ALTER COLUMN "thresholds" SET DEFAULT '{"hypo": 90, "hiper": 160}',
ALTER COLUMN "insulinRatios" SET DEFAULT '{"breakfast": 100, "lunch": 100, "dinner": 100}',
ALTER COLUMN "sensitivity" SET DEFAULT 1.0;

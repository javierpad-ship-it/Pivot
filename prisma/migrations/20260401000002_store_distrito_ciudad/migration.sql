-- Replace location with distrito and ciudad
ALTER TABLE "Store" ADD COLUMN "distrito" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Store" ADD COLUMN "ciudad" TEXT NOT NULL DEFAULT '';
UPDATE "Store" SET "distrito" = "location", "ciudad" = "location";
ALTER TABLE "Store" DROP COLUMN "location";

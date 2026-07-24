-- AlterTable
ALTER TABLE "MembresiaDisenoTarjeta"
  ADD COLUMN "beneficioBronce" TEXT,
  ADD COLUMN "beneficioPlata" TEXT,
  ADD COLUMN "beneficioOro" TEXT,
  ADD COLUMN "beneficioPlatino" TEXT;

-- AlterTable: agrega portalToken, respaldando filas existentes antes de exigir unicidad
ALTER TABLE "MembresiaCliente" ADD COLUMN "portalToken" TEXT;

UPDATE "MembresiaCliente" SET "portalToken" = gen_random_uuid()::text WHERE "portalToken" IS NULL;

ALTER TABLE "MembresiaCliente" ALTER COLUMN "portalToken" SET NOT NULL;
ALTER TABLE "MembresiaCliente" ALTER COLUMN "portalToken" SET DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "MembresiaCliente_portalToken_key" ON "MembresiaCliente"("portalToken");

-- CreateTable
CREATE TABLE "MembresiaDisenoTarjeta" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "nombrePrograma" TEXT NOT NULL,
    "descripcion" TEXT,
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "colorFondo" TEXT NOT NULL DEFAULT '#1a73e8',
    "colorTexto" TEXT NOT NULL DEFAULT '#ffffff',
    "totalEstampitas" INTEGER,
    "premioDescripcion" TEXT,
    "googleClassId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembresiaDisenoTarjeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembresiaWalletConfig" (
    "id" TEXT NOT NULL,
    "googleIssuerId" TEXT,
    "googleServiceAccountJsonEnc" TEXT,
    "appleTeamId" TEXT,
    "applePassTypeId" TEXT,
    "appleCertP12Enc" TEXT,
    "appleCertPasswordEnc" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembresiaWalletConfig_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "MembresiaCliente"
  ADD COLUMN "estampitas" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "premiosCanjeados" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "walletDisenoId" TEXT,
  ADD COLUMN "googleObjectId" TEXT,
  ADD COLUMN "applePassSerial" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MembresiaCliente_googleObjectId_key" ON "MembresiaCliente"("googleObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "MembresiaCliente_applePassSerial_key" ON "MembresiaCliente"("applePassSerial");

-- AddForeignKey
ALTER TABLE "MembresiaCliente" ADD CONSTRAINT "MembresiaCliente_walletDisenoId_fkey" FOREIGN KEY ("walletDisenoId") REFERENCES "MembresiaDisenoTarjeta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CuotaVentas" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "semana" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuotaVentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaReal" (
    "id" TEXT NOT NULL,
    "cuotaId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "empleado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentaReal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CuotaVentas_storeId_semana_anio_key" ON "CuotaVentas"("storeId", "semana", "anio");

-- AddForeignKey
ALTER TABLE "CuotaVentas" ADD CONSTRAINT "CuotaVentas_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaReal" ADD CONSTRAINT "VentaReal_cuotaId_fkey" FOREIGN KEY ("cuotaId") REFERENCES "CuotaVentas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

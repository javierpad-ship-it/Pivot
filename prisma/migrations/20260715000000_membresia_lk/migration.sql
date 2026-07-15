-- CreateTable
CREATE TABLE "MembresiaCliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT,
    "telefono" TEXT,
    "storeId" TEXT,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "puntosAcumulados" INTEGER NOT NULL DEFAULT 0,
    "nivel" TEXT NOT NULL DEFAULT 'BRONCE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembresiaCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembresiaMovimiento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "montoCompra" DOUBLE PRECISION,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembresiaMovimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembresiaCliente_dni_key" ON "MembresiaCliente"("dni");

-- AddForeignKey
ALTER TABLE "MembresiaCliente" ADD CONSTRAINT "MembresiaCliente_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembresiaMovimiento" ADD CONSTRAINT "MembresiaMovimiento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "MembresiaCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mundo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mundo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Linea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mundoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Linea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountTask" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "lineaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountRecord" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "countedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CountRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemStock" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "lineaId" TEXT NOT NULL,
    "systemQuantity" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Mundo_name_key" ON "Mundo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Linea_name_mundoId_key" ON "Linea"("name", "mundoId");

-- CreateIndex
CREATE UNIQUE INDEX "CountTask_storeId_brandId_lineaId_key" ON "CountTask"("storeId", "brandId", "lineaId");

-- CreateIndex
CREATE UNIQUE INDEX "CountRecord_taskId_key" ON "CountRecord"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemStock_storeId_brandId_lineaId_key" ON "SystemStock"("storeId", "brandId", "lineaId");

-- AddForeignKey
ALTER TABLE "Linea" ADD CONSTRAINT "Linea_mundoId_fkey" FOREIGN KEY ("mundoId") REFERENCES "Mundo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountTask" ADD CONSTRAINT "CountTask_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountTask" ADD CONSTRAINT "CountTask_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountTask" ADD CONSTRAINT "CountTask_lineaId_fkey" FOREIGN KEY ("lineaId") REFERENCES "Linea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountRecord" ADD CONSTRAINT "CountRecord_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CountTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemStock" ADD CONSTRAINT "SystemStock_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemStock" ADD CONSTRAINT "SystemStock_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemStock" ADD CONSTRAINT "SystemStock_lineaId_fkey" FOREIGN KEY ("lineaId") REFERENCES "Linea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

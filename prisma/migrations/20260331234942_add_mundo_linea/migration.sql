/*
  Warnings:

  - You are about to drop the `ItemCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `categoryId` on the `CountTask` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `SystemStock` table. All the data in the column will be lost.
  - Added the required column `lineaId` to the `CountTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineaId` to the `SystemStock` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ItemCategory_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ItemCategory";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Mundo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Linea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mundoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Linea_mundoId_fkey" FOREIGN KEY ("mundoId") REFERENCES "Mundo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CountTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "lineaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CountTask_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CountTask_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CountTask_lineaId_fkey" FOREIGN KEY ("lineaId") REFERENCES "Linea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CountTask" ("brandId", "createdAt", "id", "status", "storeId", "updatedAt") SELECT "brandId", "createdAt", "id", "status", "storeId", "updatedAt" FROM "CountTask";
DROP TABLE "CountTask";
ALTER TABLE "new_CountTask" RENAME TO "CountTask";
CREATE UNIQUE INDEX "CountTask_storeId_brandId_lineaId_key" ON "CountTask"("storeId", "brandId", "lineaId");
CREATE TABLE "new_SystemStock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "lineaId" TEXT NOT NULL,
    "systemQuantity" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SystemStock_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SystemStock_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SystemStock_lineaId_fkey" FOREIGN KEY ("lineaId") REFERENCES "Linea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SystemStock" ("brandId", "id", "storeId", "systemQuantity", "updatedAt") SELECT "brandId", "id", "storeId", "systemQuantity", "updatedAt" FROM "SystemStock";
DROP TABLE "SystemStock";
ALTER TABLE "new_SystemStock" RENAME TO "SystemStock";
CREATE UNIQUE INDEX "SystemStock_storeId_brandId_lineaId_key" ON "SystemStock"("storeId", "brandId", "lineaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Mundo_name_key" ON "Mundo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Linea_name_mundoId_key" ON "Linea"("name", "mundoId");

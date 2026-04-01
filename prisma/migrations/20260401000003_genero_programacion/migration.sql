-- Genero
CREATE TABLE "Genero" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Genero_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Genero_name_key" ON "Genero"("name");

-- Programacion (matriz semanal Lun-Jue)
CREATE TABLE "Programacion" (
  "id" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "brandId" TEXT NOT NULL,
  "lineaId" TEXT NOT NULL,
  "generoId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Programacion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Programacion_store_day_brand_linea_genero_key" ON "Programacion"("storeId", "dayOfWeek", "brandId", "lineaId", "generoId");

ALTER TABLE "Programacion" ADD CONSTRAINT "Programacion_storeId_fkey"  FOREIGN KEY ("storeId")  REFERENCES "Store"("id")  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Programacion" ADD CONSTRAINT "Programacion_brandId_fkey"  FOREIGN KEY ("brandId")  REFERENCES "Brand"("id")  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Programacion" ADD CONSTRAINT "Programacion_lineaId_fkey"  FOREIGN KEY ("lineaId")  REFERENCES "Linea"("id")  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Programacion" ADD CONSTRAINT "Programacion_generoId_fkey" FOREIGN KEY ("generoId") REFERENCES "Genero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ConteoRegistro (conteos diarios de la matriz)
CREATE TABLE "ConteoRegistro" (
  "id" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "brandId" TEXT NOT NULL,
  "lineaId" TEXT NOT NULL,
  "generoId" TEXT NOT NULL,
  "fecha" DATE NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "empleado" TEXT NOT NULL,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConteoRegistro_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ConteoRegistro_store_brand_linea_genero_fecha_key" ON "ConteoRegistro"("storeId", "brandId", "lineaId", "generoId", "fecha");

ALTER TABLE "ConteoRegistro" ADD CONSTRAINT "ConteoRegistro_storeId_fkey"  FOREIGN KEY ("storeId")  REFERENCES "Store"("id")  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConteoRegistro" ADD CONSTRAINT "ConteoRegistro_brandId_fkey"  FOREIGN KEY ("brandId")  REFERENCES "Brand"("id")  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConteoRegistro" ADD CONSTRAINT "ConteoRegistro_lineaId_fkey"  FOREIGN KEY ("lineaId")  REFERENCES "Linea"("id")  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConteoRegistro" ADD CONSTRAINT "ConteoRegistro_generoId_fkey" FOREIGN KEY ("generoId") REFERENCES "Genero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

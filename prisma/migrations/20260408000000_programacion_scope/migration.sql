-- Refactor Programacion: remove storeId, add scope field, create ProgramacionTienda junction table
-- Existing rows (which all have a storeId) are migrated to scope='SOME' + ProgramacionTienda entries

-- Step 1: Add scope column with default 'SOME' so existing rows keep their store-specific meaning
ALTER TABLE "Programacion" ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'SOME';

-- Step 2: Create ProgramacionTienda junction table
CREATE TABLE "ProgramacionTienda" (
    "id" TEXT NOT NULL,
    "programacionId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    CONSTRAINT "ProgramacionTienda_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProgramacionTienda_programacionId_storeId_key" UNIQUE ("programacionId", "storeId")
);

-- Step 3: Migrate data
-- For each unique (dayOfWeek, brandId, lineaId, generoId) keep the min(id) row as canonical.
-- Insert ProgramacionTienda entries pointing to the canonical row for every storeId in the group.
INSERT INTO "ProgramacionTienda" ("id", "programacionId", "storeId")
SELECT
    gen_random_uuid()::text,
    (SELECT MIN(p2.id)
     FROM "Programacion" p2
     WHERE p2."dayOfWeek" = p."dayOfWeek"
       AND p2."brandId"   = p."brandId"
       AND p2."lineaId"   = p."lineaId"
       AND p2."generoId"  = p."generoId"),
    p."storeId"
FROM "Programacion" p;

-- Step 4: Delete duplicate (non-canonical) rows
DELETE FROM "Programacion"
WHERE id NOT IN (
    SELECT MIN(id)
    FROM "Programacion"
    GROUP BY "dayOfWeek", "brandId", "lineaId", "generoId"
);

-- Step 5: Drop old unique index and foreign key on storeId
DROP INDEX IF EXISTS "Programacion_store_day_brand_linea_genero_key";
ALTER TABLE "Programacion" DROP CONSTRAINT IF EXISTS "Programacion_storeId_fkey";

-- Step 6: Drop storeId column
ALTER TABLE "Programacion" DROP COLUMN "storeId";

-- Step 7: Add new unique constraint
CREATE UNIQUE INDEX "Programacion_dayOfWeek_brandId_lineaId_generoId_key"
    ON "Programacion"("dayOfWeek", "brandId", "lineaId", "generoId");

-- Step 8: Add foreign keys to ProgramacionTienda
ALTER TABLE "ProgramacionTienda"
    ADD CONSTRAINT "ProgramacionTienda_programacionId_fkey"
    FOREIGN KEY ("programacionId") REFERENCES "Programacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgramacionTienda"
    ADD CONSTRAINT "ProgramacionTienda_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

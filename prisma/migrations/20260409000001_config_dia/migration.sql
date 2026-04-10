-- CreateTable
CREATE TABLE "ConfigDia" (
    "dayOfWeek" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ConfigDia_pkey" PRIMARY KEY ("dayOfWeek")
);

-- Seed all 7 days; Lunes–Jueves enabled by default (matches previous hardcoded behavior)
INSERT INTO "ConfigDia" ("dayOfWeek", "name", "enabled") VALUES
  (1, 'Lunes',      true),
  (2, 'Martes',     true),
  (3, 'Miércoles',  true),
  (4, 'Jueves',     true),
  (5, 'Viernes',    false),
  (6, 'Sábado',     false),
  (7, 'Domingo',    false);

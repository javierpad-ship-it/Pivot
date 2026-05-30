-- AlterTable: Zona - add responsable and supervisor aprobador
ALTER TABLE "Zona" ADD COLUMN IF NOT EXISTS "responsableZonaId" TEXT;
ALTER TABLE "Zona" ADD COLUMN IF NOT EXISTS "supervisorAprobadorId" TEXT;

-- AlterTable: Store - add formato direccion and titular references
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "formatoDireccion" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "gerenteTitularId" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "jefeTurnoTitularId" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "cantSupervisoresTesoros" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "tieneSupervisorAsesoria" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: Persona
CREATE TABLE IF NOT EXISTS "Persona" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "tiendaBaseId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Persona_codigo_key" ON "Persona"("codigo");
CREATE UNIQUE INDEX IF NOT EXISTS "Persona_dni_key" ON "Persona"("dni");

-- CreateTable: RolPersona
CREATE TABLE IF NOT EXISTS "RolPersona" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    CONSTRAINT "RolPersona_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "RolPersona_personaId_rol_key" ON "RolPersona"("personaId", "rol");

-- CreateTable: ElegibilidadCobertura
CREATE TABLE IF NOT EXISTS "ElegibilidadCobertura" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "rolHabilita" TEXT NOT NULL,
    CONSTRAINT "ElegibilidadCobertura_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ElegibilidadCobertura_personaId_rolHabilita_key" ON "ElegibilidadCobertura"("personaId", "rolHabilita");

-- CreateTable: ProgramacionDescanso
CREATE TABLE IF NOT EXISTS "ProgramacionDescanso" (
    "id" TEXT NOT NULL,
    "zonaId" TEXT NOT NULL,
    "periodoInicio" DATE NOT NULL,
    "periodoFin" DATE NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "motivoRechazo" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "aprobadoPorId" TEXT,
    "aprobadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramacionDescanso_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RegistroDescanso
CREATE TABLE IF NOT EXISTS "RegistroDescanso" (
    "id" TEXT NOT NULL,
    "programacionId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "tipoMovimiento" TEXT NOT NULL,
    "coberturaId" TEXT,
    "observacion" TEXT,
    "fecha" DATE NOT NULL,
    "alertaSabadoAceptada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroDescanso_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AuditoriaDescanso
CREATE TABLE IF NOT EXISTS "AuditoriaDescanso" (
    "id" TEXT NOT NULL,
    "programacionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "valorAnterior" JSONB,
    "valorNuevo" JSONB,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditoriaDescanso_pkey" PRIMARY KEY ("id")
);

-- Foreign keys: Persona
ALTER TABLE "Persona" DROP CONSTRAINT IF EXISTS "Persona_tiendaBaseId_fkey";
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_tiendaBaseId_fkey"
  FOREIGN KEY ("tiendaBaseId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: Store new cols
ALTER TABLE "Store" DROP CONSTRAINT IF EXISTS "Store_gerenteTitularId_fkey";
ALTER TABLE "Store" ADD CONSTRAINT "Store_gerenteTitularId_fkey"
  FOREIGN KEY ("gerenteTitularId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Store" DROP CONSTRAINT IF EXISTS "Store_jefeTurnoTitularId_fkey";
ALTER TABLE "Store" ADD CONSTRAINT "Store_jefeTurnoTitularId_fkey"
  FOREIGN KEY ("jefeTurnoTitularId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: RolPersona
ALTER TABLE "RolPersona" DROP CONSTRAINT IF EXISTS "RolPersona_personaId_fkey";
ALTER TABLE "RolPersona" ADD CONSTRAINT "RolPersona_personaId_fkey"
  FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: ElegibilidadCobertura
ALTER TABLE "ElegibilidadCobertura" DROP CONSTRAINT IF EXISTS "ElegibilidadCobertura_personaId_fkey";
ALTER TABLE "ElegibilidadCobertura" ADD CONSTRAINT "ElegibilidadCobertura_personaId_fkey"
  FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: ProgramacionDescanso
ALTER TABLE "ProgramacionDescanso" DROP CONSTRAINT IF EXISTS "ProgramacionDescanso_zonaId_fkey";
ALTER TABLE "ProgramacionDescanso" ADD CONSTRAINT "ProgramacionDescanso_zonaId_fkey"
  FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProgramacionDescanso" DROP CONSTRAINT IF EXISTS "ProgramacionDescanso_creadoPorId_fkey";
ALTER TABLE "ProgramacionDescanso" ADD CONSTRAINT "ProgramacionDescanso_creadoPorId_fkey"
  FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProgramacionDescanso" DROP CONSTRAINT IF EXISTS "ProgramacionDescanso_aprobadoPorId_fkey";
ALTER TABLE "ProgramacionDescanso" ADD CONSTRAINT "ProgramacionDescanso_aprobadoPorId_fkey"
  FOREIGN KEY ("aprobadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: RegistroDescanso
ALTER TABLE "RegistroDescanso" DROP CONSTRAINT IF EXISTS "RegistroDescanso_programacionId_fkey";
ALTER TABLE "RegistroDescanso" ADD CONSTRAINT "RegistroDescanso_programacionId_fkey"
  FOREIGN KEY ("programacionId") REFERENCES "ProgramacionDescanso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RegistroDescanso" DROP CONSTRAINT IF EXISTS "RegistroDescanso_storeId_fkey";
ALTER TABLE "RegistroDescanso" ADD CONSTRAINT "RegistroDescanso_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RegistroDescanso" DROP CONSTRAINT IF EXISTS "RegistroDescanso_personaId_fkey";
ALTER TABLE "RegistroDescanso" ADD CONSTRAINT "RegistroDescanso_personaId_fkey"
  FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RegistroDescanso" DROP CONSTRAINT IF EXISTS "RegistroDescanso_coberturaId_fkey";
ALTER TABLE "RegistroDescanso" ADD CONSTRAINT "RegistroDescanso_coberturaId_fkey"
  FOREIGN KEY ("coberturaId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: AuditoriaDescanso
ALTER TABLE "AuditoriaDescanso" DROP CONSTRAINT IF EXISTS "AuditoriaDescanso_programacionId_fkey";
ALTER TABLE "AuditoriaDescanso" ADD CONSTRAINT "AuditoriaDescanso_programacionId_fkey"
  FOREIGN KEY ("programacionId") REFERENCES "ProgramacionDescanso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditoriaDescanso" DROP CONSTRAINT IF EXISTS "AuditoriaDescanso_usuarioId_fkey";
ALTER TABLE "AuditoriaDescanso" ADD CONSTRAINT "AuditoriaDescanso_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

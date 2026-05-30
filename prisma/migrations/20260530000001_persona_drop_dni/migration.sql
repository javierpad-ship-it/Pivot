-- Remove DNI field from Persona — código de empleado y DNI son el mismo valor
DROP INDEX IF EXISTS "Persona_dni_key";
ALTER TABLE "Persona" DROP COLUMN IF EXISTS "dni";

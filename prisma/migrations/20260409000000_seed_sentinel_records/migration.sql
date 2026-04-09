-- Sentinel records for "TODOS" (all brands / all géneros) in schedules
-- These are referenced by Programacion records when scope = all brands or all géneros

INSERT INTO "Brand" (id, name)
VALUES ('brand-all', 'TODOS')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Genero" (id, name, "createdAt")
VALUES ('genero-all', 'TODOS', NOW())
ON CONFLICT (id) DO NOTHING;

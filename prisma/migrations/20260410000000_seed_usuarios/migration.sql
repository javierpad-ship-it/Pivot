-- Seed initial zones (idempotent: skips if id OR name already exists)
INSERT INTO "Zona" (id, name, "createdAt")
VALUES
  ('zona-sur-oriente',  'Zona Sur Oriente',  NOW()),
  ('zona-centro-norte', 'Zona Centro Norte', NOW())
ON CONFLICT DO NOTHING;

-- Seed initial users with bcrypt-hashed passwords (idempotent: skips if id already exists)
-- Passwords: jperezalbela=220922, all others=1234
INSERT INTO "Usuario" (id, nombre, username, password, rol, activo, "storeId", "zonaId", "createdAt", "updatedAt")
VALUES
  ('usr-jperezalbela', 'J. Pérez Albela', 'jperezalbela', '$2b$10$hcLvEcnpwQLQafBuEptQfuWv7AlgOGNAuvRiCeNuqsncQQtzujBfm', 'SUPER_ADMIN',   true, NULL, NULL,                 NOW(), NOW()),
  ('usr-cpelaez',      'C. Peláez',       'cpelaez',      '$2b$10$v0A5ZSaMCPVgora1xDGd2uKB/xc7Thjox0iMCzI9KSXFYmm9Zkc72', 'ADMIN',         true, NULL, NULL,                 NOW(), NOW()),
  ('usr-admventas',    'Adm. Ventas',     'admventas',    '$2b$10$v0A5ZSaMCPVgora1xDGd2uKB/xc7Thjox0iMCzI9KSXFYmm9Zkc72', 'PROGRAMADOR',   true, NULL, NULL,                 NOW(), NOW()),
  ('usr-jbarraga',     'J. Barraga',      'jbarraga',     '$2b$10$v0A5ZSaMCPVgora1xDGd2uKB/xc7Thjox0iMCzI9KSXFYmm9Zkc72', 'GERENTE_ZONAL', true, NULL, 'zona-sur-oriente',  NOW(), NOW()),
  ('usr-mvasquez',     'M. Vásquez',      'mvasquez',     '$2b$10$v0A5ZSaMCPVgora1xDGd2uKB/xc7Thjox0iMCzI9KSXFYmm9Zkc72', 'GERENTE_ZONAL', true, NULL, 'zona-centro-norte', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- AlterTable
ALTER TABLE "Store"
  ADD COLUMN "direccion" TEXT,
  ADD COLUMN "latitud" DOUBLE PRECISION,
  ADD COLUMN "longitud" DOUBLE PRECISION;

-- Carga inicial de direcciones/coordenadas de las tiendas Lukers.
-- Best-effort: matchea por palabra distintiva del nombre y solo si esa tienda
-- aún no tiene coordenadas. Si el nombre no coincide con ninguna tienda
-- existente, no pasa nada (se puede completar desde HQ > Mantenimiento > Tiendas).

UPDATE "Store" SET
  "direccion" = 'JR DE LA UNION 449, CERCADO DE LIMA, LIMA, LIMA',
  "latitud" = -12.046661129635583, "longitud" = -77.0317000558908
WHERE name ILIKE '%union%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'AV. ALFREDO MENDIOLA 3688 - INDEPENDENCIA',
  "latitud" = -11.992163731466887, "longitud" = -77.06332117241672
WHERE name ILIKE '%mendiola%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'AV. A. UGARTE NRO. 1234 (NUMEROS 1234-1236) BREÑA - LIMA',
  "latitud" = -12.055185352485235, "longitud" = -77.04222304117025
WHERE name ILIKE '%ugarte%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'AV. DE LA MARINA NRO. 1666 COOP. PUEBLO LIBRE, LIMA - PUEBLO LIBRE',
  "latitud" = -12.0780129, "longitud" = -77.0805764
WHERE name ILIKE '%marina%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'JR. SARGENTO FERNANDO LORES N° 162, IQUITOS, MAYNAS, DPTO. LORETO',
  "latitud" = -3.74953508377075, "longitud" = -73.2434844970703
WHERE name ILIKE '%iquitos%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'AV. PROLONGACION IQUITOS 2635 - URB SAN EUGENIO - LINCE',
  "latitud" = -12.089417076023242, "longitud" = -77.02923184773277
WHERE name ILIKE '%lince%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'AV. EL SOL NRO. 1175 URB. LA CAMPIÑA, LIMA - CHORRILLOS',
  "latitud" = -12.1754935, "longitud" = -76.997623221
WHERE name ILIKE '%sol%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'JR. MARTÍNEZ DE COMPAGÑÓN N° 246, TARAPOTO, PROV. Y DPTO. DE SAN MARTÍN',
  "latitud" = -6.488566962486386, "longitud" = -76.36165225025658
WHERE name ILIKE '%tarapoto%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'AV. LUIS GONZALES 1285, ESQ. CON AV. PEDRO LUIS GALLO, CHICLAYO - LAMBAYEQUE',
  "latitud" = -6.767957299886955, "longitud" = -79.84207317015444
WHERE name ILIKE '%chiclayo%' AND "latitud" IS NULL;

UPDATE "Store" SET
  "direccion" = 'CALLE PIZARRO 519 - TRUJILLO - LA LIBERTAD',
  "latitud" = -8.1113947, "longitud" = -79.02748
WHERE name ILIKE '%pizarro%' AND "latitud" IS NULL;

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Stores
  const stores = await Promise.all([
    prisma.store.upsert({
      where: { id: "store-downtown" },
      update: {},
      create: { id: "store-downtown", name: "Downtown Flagship", location: "New York, NY" },
    }),
    prisma.store.upsert({
      where: { id: "store-westside" },
      update: {},
      create: { id: "store-westside", name: "Westside Mall", location: "Los Angeles, CA" },
    }),
    prisma.store.upsert({
      where: { id: "store-northgate" },
      update: {},
      create: { id: "store-northgate", name: "Northgate Center", location: "Chicago, IL" },
    }),
  ]);

  // Brands
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { name: "AlphaWear" }, update: {}, create: { id: "brand-alphawear", name: "AlphaWear" } }),
    prisma.brand.upsert({ where: { name: "BetaSport" }, update: {}, create: { id: "brand-betasport", name: "BetaSport" } }),
    prisma.brand.upsert({ where: { name: "GammaHome" }, update: {}, create: { id: "brand-gammahome", name: "GammaHome" } }),
    prisma.brand.upsert({ where: { name: "DeltaElectronics" }, update: {}, create: { id: "brand-deltaelectronics", name: "DeltaElectronics" } }),
    prisma.brand.upsert({ where: { name: "EpsilonBeauty" }, update: {}, create: { id: "brand-epsilonbeauty", name: "EpsilonBeauty" } }),
  ]);

  // Mundos
  const mundos = await Promise.all([
    prisma.mundo.upsert({ where: { name: "Moda" }, update: {}, create: { id: "mundo-moda", name: "Moda" } }),
    prisma.mundo.upsert({ where: { name: "Electrónica" }, update: {}, create: { id: "mundo-electronica", name: "Electrónica" } }),
    prisma.mundo.upsert({ where: { name: "Hogar" }, update: {}, create: { id: "mundo-hogar", name: "Hogar" } }),
    prisma.mundo.upsert({ where: { name: "Belleza" }, update: {}, create: { id: "mundo-belleza", name: "Belleza" } }),
  ]);

  // Líneas (2 per mundo)
  const lineas = await Promise.all([
    // Moda
    prisma.linea.upsert({ where: { name_mundoId: { name: "Ropa Hombre", mundoId: "mundo-moda" } }, update: {}, create: { id: "linea-ropa-hombre", name: "Ropa Hombre", mundoId: "mundo-moda" } }),
    prisma.linea.upsert({ where: { name_mundoId: { name: "Ropa Mujer", mundoId: "mundo-moda" } }, update: {}, create: { id: "linea-ropa-mujer", name: "Ropa Mujer", mundoId: "mundo-moda" } }),
    // Electrónica
    prisma.linea.upsert({ where: { name_mundoId: { name: "Audio & Video", mundoId: "mundo-electronica" } }, update: {}, create: { id: "linea-audio", name: "Audio & Video", mundoId: "mundo-electronica" } }),
    prisma.linea.upsert({ where: { name_mundoId: { name: "Smartphones", mundoId: "mundo-electronica" } }, update: {}, create: { id: "linea-smartphones", name: "Smartphones", mundoId: "mundo-electronica" } }),
    // Hogar
    prisma.linea.upsert({ where: { name_mundoId: { name: "Cocina", mundoId: "mundo-hogar" } }, update: {}, create: { id: "linea-cocina", name: "Cocina", mundoId: "mundo-hogar" } }),
    prisma.linea.upsert({ where: { name_mundoId: { name: "Decoración", mundoId: "mundo-hogar" } }, update: {}, create: { id: "linea-decoracion", name: "Decoración", mundoId: "mundo-hogar" } }),
    // Belleza
    prisma.linea.upsert({ where: { name_mundoId: { name: "Skincare", mundoId: "mundo-belleza" } }, update: {}, create: { id: "linea-skincare", name: "Skincare", mundoId: "mundo-belleza" } }),
    prisma.linea.upsert({ where: { name_mundoId: { name: "Maquillaje", mundoId: "mundo-belleza" } }, update: {}, create: { id: "linea-maquillaje", name: "Maquillaje", mundoId: "mundo-belleza" } }),
  ]);

  // System stock: sample entries (stores x brands x first linea of each mundo)
  const sampleLineas = ["linea-ropa-hombre", "linea-audio", "linea-cocina", "linea-skincare"];
  const stockQtys = [
    [85, 110, 76, 62],
    [98, 124, 53, 81],
    [104, 91, 148, 113],
  ];

  for (let si = 0; si < stores.length; si++) {
    for (let bi = 0; bi < brands.length; bi++) {
      for (let li = 0; li < sampleLineas.length; li++) {
        const qty = stockQtys[si][li] + bi * 10;
        await prisma.systemStock.upsert({
          where: { storeId_brandId_lineaId: { storeId: stores[si].id, brandId: brands[bi].id, lineaId: sampleLineas[li] } },
          update: { systemQuantity: qty },
          create: { storeId: stores[si].id, brandId: brands[bi].id, lineaId: sampleLineas[li], systemQuantity: qty },
        });
      }
    }
  }

  // Count tasks: 6 COMPLETED, 6 PENDING
  const taskDefs = [
    { storeId: "store-downtown", brandId: "brand-alphawear", lineaId: "linea-ropa-hombre", status: "COMPLETED", qty: 88, employee: "Maria Garcia" },
    { storeId: "store-downtown", brandId: "brand-betasport", lineaId: "linea-audio", status: "COMPLETED", qty: 55, employee: "James Chen" },
    { storeId: "store-westside", brandId: "brand-gammahome", lineaId: "linea-cocina", status: "COMPLETED", qty: 45, employee: "Lisa Park" },
    { storeId: "store-westside", brandId: "brand-deltaelectronics", lineaId: "linea-ropa-hombre", status: "COMPLETED", qty: 98, employee: "Tom Rivera" },
    { storeId: "store-northgate", brandId: "brand-epsilonbeauty", lineaId: "linea-skincare", status: "COMPLETED", qty: 120, employee: "Sarah Kim" },
    { storeId: "store-northgate", brandId: "brand-alphawear", lineaId: "linea-audio", status: "COMPLETED", qty: 80, employee: "David Osei" },
    { storeId: "store-downtown", brandId: "brand-gammahome", lineaId: "linea-skincare", status: "PENDING", qty: null, employee: null },
    { storeId: "store-downtown", brandId: "brand-epsilonbeauty", lineaId: "linea-cocina", status: "PENDING", qty: null, employee: null },
    { storeId: "store-westside", brandId: "brand-alphawear", lineaId: "linea-skincare", status: "PENDING", qty: null, employee: null },
    { storeId: "store-westside", brandId: "brand-betasport", lineaId: "linea-ropa-hombre", status: "PENDING", qty: null, employee: null },
    { storeId: "store-northgate", brandId: "brand-deltaelectronics", lineaId: "linea-cocina", status: "PENDING", qty: null, employee: null },
    { storeId: "store-northgate", brandId: "brand-betasport", lineaId: "linea-audio", status: "PENDING", qty: null, employee: null },
  ];

  for (const def of taskDefs) {
    const taskId = `task-${def.storeId}-${def.brandId}-${def.lineaId}`;
    const task = await prisma.countTask.upsert({
      where: { storeId_brandId_lineaId: { storeId: def.storeId, brandId: def.brandId, lineaId: def.lineaId } },
      update: { status: def.status },
      create: { id: taskId, storeId: def.storeId, brandId: def.brandId, lineaId: def.lineaId, status: def.status },
    });

    if (def.status === "COMPLETED" && def.qty !== null && def.employee !== null) {
      await prisma.countRecord.upsert({
        where: { taskId: task.id },
        update: { quantity: def.qty, employeeName: def.employee },
        create: { taskId: task.id, quantity: def.qty, employeeName: def.employee, countedAt: new Date(Date.now() - Math.random() * 86400000) },
      });
    }
  }

  console.log("Seed completo: 3 tiendas, 5 marcas, 4 mundos, 8 líneas, 12 tareas.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

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

  // Categories
  const categories = await Promise.all([
    prisma.itemCategory.upsert({ where: { name: "Apparel" }, update: {}, create: { id: "cat-apparel", name: "Apparel" } }),
    prisma.itemCategory.upsert({ where: { name: "Electronics" }, update: {}, create: { id: "cat-electronics", name: "Electronics" } }),
    prisma.itemCategory.upsert({ where: { name: "Home Goods" }, update: {}, create: { id: "cat-homegoods", name: "Home Goods" } }),
    prisma.itemCategory.upsert({ where: { name: "Beauty & Personal Care" }, update: {}, create: { id: "cat-beauty", name: "Beauty & Personal Care" } }),
  ]);

  // System stock for all store x brand x category combinations
  const stockSeeds: { qty: number }[][][] = [
    // Downtown
    [[{ qty: 85 }, { qty: 42 }, { qty: 130 }, { qty: 67 }],
     [{ qty: 110 }, { qty: 58 }, { qty: 95 }, { qty: 203 }],
     [{ qty: 76 }, { qty: 120 }, { qty: 44 }, { qty: 88 }],
     [{ qty: 155 }, { qty: 33 }, { qty: 77 }, { qty: 190 }],
     [{ qty: 62 }, { qty: 148 }, { qty: 105 }, { qty: 55 }]],
    // Westside
    [[{ qty: 98 }, { qty: 61 }, { qty: 145 }, { qty: 72 }],
     [{ qty: 124 }, { qty: 39 }, { qty: 87 }, { qty: 166 }],
     [{ qty: 53 }, { qty: 108 }, { qty: 195 }, { qty: 41 }],
     [{ qty: 177 }, { qty: 22 }, { qty: 64 }, { qty: 139 }],
     [{ qty: 81 }, { qty: 115 }, { qty: 93 }, { qty: 48 }]],
    // Northgate
    [[{ qty: 104 }, { qty: 75 }, { qty: 118 }, { qty: 59 }],
     [{ qty: 91 }, { qty: 162 }, { qty: 73 }, { qty: 136 }],
     [{ qty: 148 }, { qty: 29 }, { qty: 101 }, { qty: 84 }],
     [{ qty: 67 }, { qty: 143 }, { qty: 55 }, { qty: 172 }],
     [{ qty: 113 }, { qty: 88 }, { qty: 127 }, { qty: 36 }]],
  ];

  for (let si = 0; si < stores.length; si++) {
    for (let bi = 0; bi < brands.length; bi++) {
      for (let ci = 0; ci < categories.length; ci++) {
        const qty = stockSeeds[si][bi][ci].qty;
        await prisma.systemStock.upsert({
          where: {
            storeId_brandId_categoryId: {
              storeId: stores[si].id,
              brandId: brands[bi].id,
              categoryId: categories[ci].id,
            },
          },
          update: { systemQuantity: qty },
          create: {
            storeId: stores[si].id,
            brandId: brands[bi].id,
            categoryId: categories[ci].id,
            systemQuantity: qty,
          },
        });
      }
    }
  }

  // Count tasks — 6 COMPLETED (with records), 6 PENDING
  const taskDefs = [
    // COMPLETED tasks — quantity slightly offset to show discrepancies
    { storeId: "store-downtown", brandId: "brand-alphawear", categoryId: "cat-apparel", status: "COMPLETED", qty: 88, employee: "Maria Garcia" },
    { storeId: "store-downtown", brandId: "brand-betasport", categoryId: "cat-electronics", status: "COMPLETED", qty: 55, employee: "James Chen" },
    { storeId: "store-westside", brandId: "brand-gammahome", categoryId: "cat-homegoods", status: "COMPLETED", qty: 180, employee: "Lisa Park" },
    { storeId: "store-westside", brandId: "brand-deltaelectronics", categoryId: "cat-apparel", status: "COMPLETED", qty: 98, employee: "Tom Rivera" },
    { storeId: "store-northgate", brandId: "brand-epsilonbeauty", categoryId: "cat-beauty", status: "COMPLETED", qty: 36, employee: "Sarah Kim" },
    { storeId: "store-northgate", brandId: "brand-alphawear", categoryId: "cat-electronics", status: "COMPLETED", qty: 80, employee: "David Osei" },
    // PENDING tasks
    { storeId: "store-downtown", brandId: "brand-gammahome", categoryId: "cat-beauty", status: "PENDING", qty: null, employee: null },
    { storeId: "store-downtown", brandId: "brand-epsilonbeauty", categoryId: "cat-homegoods", status: "PENDING", qty: null, employee: null },
    { storeId: "store-westside", brandId: "brand-alphawear", categoryId: "cat-beauty", status: "PENDING", qty: null, employee: null },
    { storeId: "store-westside", brandId: "brand-betasport", categoryId: "cat-apparel", status: "PENDING", qty: null, employee: null },
    { storeId: "store-northgate", brandId: "brand-deltaelectronics", categoryId: "cat-homegoods", status: "PENDING", qty: null, employee: null },
    { storeId: "store-northgate", brandId: "brand-betasport", categoryId: "cat-electronics", status: "PENDING", qty: null, employee: null },
  ];

  for (const def of taskDefs) {
    const taskId = `task-${def.storeId}-${def.brandId}-${def.categoryId}`;
    const task = await prisma.countTask.upsert({
      where: {
        storeId_brandId_categoryId: {
          storeId: def.storeId,
          brandId: def.brandId,
          categoryId: def.categoryId,
        },
      },
      update: { status: def.status },
      create: {
        id: taskId,
        storeId: def.storeId,
        brandId: def.brandId,
        categoryId: def.categoryId,
        status: def.status,
      },
    });

    if (def.status === "COMPLETED" && def.qty !== null && def.employee !== null) {
      await prisma.countRecord.upsert({
        where: { taskId: task.id },
        update: { quantity: def.qty, employeeName: def.employee },
        create: {
          taskId: task.id,
          quantity: def.qty,
          employeeName: def.employee,
          countedAt: new Date(Date.now() - Math.random() * 86400000),
        },
      });
    }
  }

  console.log("Seed complete: 3 stores, 5 brands, 4 categories, 60 stock entries, 12 tasks (6 completed, 6 pending)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "./prisma";
import type { ReportRow } from "@/types";

interface ReportFilters {
  storeId?: string;
  brandId?: string;
  lineaId?: string;
}

export async function getReportData(filters: ReportFilters = {}): Promise<ReportRow[]> {
  const tasks = await prisma.countTask.findMany({
    where: {
      status: "COMPLETED",
      ...(filters.storeId ? { storeId: filters.storeId } : {}),
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.lineaId ? { lineaId: filters.lineaId } : {}),
    },
    include: {
      store: true,
      brand: true,
      linea: { include: { mundo: true } },
      countRecord: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const stockEntries = await prisma.systemStock.findMany({
    where: {
      OR: tasks.map((t) => ({ storeId: t.storeId, brandId: t.brandId, lineaId: t.lineaId })),
    },
  });

  const stockMap: Record<string, Record<string, Record<string, number>>> = {};
  for (const s of stockEntries) {
    if (!stockMap[s.storeId]) stockMap[s.storeId] = {};
    if (!stockMap[s.storeId][s.brandId]) stockMap[s.storeId][s.brandId] = {};
    stockMap[s.storeId][s.brandId][s.lineaId] = s.systemQuantity;
  }

  return tasks
    .filter((t) => t.countRecord !== null)
    .map((t) => {
      const record = t.countRecord!;
      const sysQty = stockMap[t.storeId]?.[t.brandId]?.[t.lineaId] ?? null;
      const discrepancy = sysQty !== null ? record.quantity - sysQty : null;
      const discrepancyPercent =
        sysQty !== null && sysQty > 0
          ? Math.round((Math.abs(discrepancy!) / sysQty) * 100)
          : null;

      return {
        taskId: t.id,
        store: { id: t.store.id, name: t.store.name, location: t.store.location },
        brand: { id: t.brand.id, name: t.brand.name },
        mundo: { id: t.linea.mundo.id, name: t.linea.mundo.name },
        linea: { id: t.linea.id, name: t.linea.name },
        countedQuantity: record.quantity,
        systemQuantity: sysQty,
        discrepancy,
        discrepancyPercent,
        employeeName: record.employeeName,
        countedAt: record.countedAt.toISOString(),
      };
    });
}

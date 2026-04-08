import { prisma } from "@/lib/prisma";
import { MarcasClient } from "@/components/hq/maintenance/MarcasClient";

export const dynamic = "force-dynamic";

export default async function MarcasPage() {
  const marcas = await prisma.brand.findMany({ where: { id: { not: "brand-all" } }, orderBy: { name: "asc" } });
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
        <p className="text-sm text-gray-500 mt-1">Administra las marcas del sistema</p>
      </div>
      <MarcasClient marcas={marcas} />
    </div>
  );
}

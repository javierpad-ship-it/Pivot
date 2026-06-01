import { prisma } from "@/lib/prisma";
import { EmpresasClient } from "@/components/hq/maintenance/EmpresasClient";

export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stores: true } } },
  });
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <p className="text-sm text-gray-500 mt-1">Administra las empresas del sistema</p>
      </div>
      <EmpresasClient empresas={empresas.map((e) => ({ id: e.id, name: e.name, storeCount: e._count.stores }))} />
    </div>
  );
}

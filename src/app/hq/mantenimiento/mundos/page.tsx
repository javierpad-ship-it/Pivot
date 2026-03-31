import { prisma } from "@/lib/prisma";
import { MundosClient } from "@/components/hq/maintenance/MundosClient";

export const dynamic = "force-dynamic";

export default async function MundosPage() {
  const mundos = await prisma.mundo.findMany({
    orderBy: { name: "asc" },
    include: { lineas: { orderBy: { name: "asc" } } },
  });
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mundos</h1>
        <p className="text-sm text-gray-500 mt-1">Administra los mundos del sistema</p>
      </div>
      <MundosClient mundos={mundos} />
    </div>
  );
}

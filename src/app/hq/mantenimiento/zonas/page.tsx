import { prisma } from "@/lib/prisma";
import { ZonasClient } from "@/components/hq/maintenance/ZonasClient";

export const dynamic = "force-dynamic";

export default async function ZonasPage() {
  const [zonas, stores] = await Promise.all([
    prisma.zona.findMany({
      orderBy: { name: "asc" },
      include: { stores: { orderBy: { name: "asc" } } },
    }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Zonas</h1>
        <p className="text-sm text-gray-500 mt-1">Administra las zonas y asigna tiendas a cada una</p>
      </div>
      <ZonasClient zonas={zonas} stores={stores} />
    </div>
  );
}

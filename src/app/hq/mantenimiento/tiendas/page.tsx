import { prisma } from "@/lib/prisma";
import { TiendasClient } from "@/components/hq/maintenance/TiendasClient";

export const dynamic = "force-dynamic";

export default async function TiendasPage() {
  const [tiendas, empresas] = await Promise.all([
    prisma.store.findMany({
      orderBy: { name: "asc" },
      include: { empresa: true },
    }),
    prisma.empresa.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tiendas</h1>
        <p className="text-sm text-gray-500 mt-1">Administra las tiendas del sistema</p>
      </div>
      <TiendasClient tiendas={tiendas} empresas={empresas} />
    </div>
  );
}

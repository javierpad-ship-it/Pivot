import { prisma } from "@/lib/prisma";
import { GenerosClient } from "@/components/hq/maintenance/GenerosClient";

export const dynamic = "force-dynamic";

export default async function GenerosPage() {
  const generos = await prisma.genero.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { programaciones: true } } },
  });
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Géneros</h1>
        <p className="text-sm text-gray-500 mt-1">Administra los géneros del sistema</p>
      </div>
      <GenerosClient generos={generos} />
    </div>
  );
}

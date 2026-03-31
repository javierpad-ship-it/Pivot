import { prisma } from "@/lib/prisma";
import { LineasClient } from "@/components/hq/maintenance/LineasClient";

export const dynamic = "force-dynamic";

export default async function LineasPage() {
  const [lineas, mundos] = await Promise.all([
    prisma.linea.findMany({
      orderBy: [{ mundo: { name: "asc" } }, { name: "asc" }],
      include: { mundo: true },
    }),
    prisma.mundo.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Líneas</h1>
        <p className="text-sm text-gray-500 mt-1">Administra las líneas de producto por mundo</p>
      </div>
      <LineasClient lineas={lineas} mundos={mundos} />
    </div>
  );
}

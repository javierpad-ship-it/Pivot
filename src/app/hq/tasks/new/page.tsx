import { prisma } from "@/lib/prisma";
import { NewTaskForm } from "@/components/hq/NewTaskForm";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const [stores, brands, lineas] = await Promise.all([
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.linea.findMany({
      orderBy: [{ mundo: { name: "asc" } }, { name: "asc" }],
      include: { mundo: true },
    }),
  ]);

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Tarea de Conteo</h1>
        <p className="text-sm text-gray-500 mt-1">Asigna una tarea de conteo cíclico a una tienda</p>
      </div>
      <NewTaskForm stores={stores} brands={brands} lineas={lineas} />
    </div>
  );
}

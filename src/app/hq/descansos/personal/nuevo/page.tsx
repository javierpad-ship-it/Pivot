import { prisma } from "@/lib/prisma";
import { PersonaForm } from "@/components/hq/descansos/PersonaForm";

export const dynamic = "force-dynamic";

export default async function NuevaPersonaPage() {
  const stores = await prisma.store.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Persona</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registra un colaborador para programación de descansos</p>
      </div>
      <PersonaForm persona={null} stores={stores} />
    </div>
  );
}

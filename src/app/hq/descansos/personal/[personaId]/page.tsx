import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PersonaForm } from "@/components/hq/descansos/PersonaForm";

export const dynamic = "force-dynamic";

export default async function EditPersonaPage({ params }: { params: { personaId: string } }) {
  const [persona, stores] = await Promise.all([
    prisma.persona.findUnique({
      where: { id: params.personaId },
      include: { roles: true, elegibilidades: true },
    }),
    prisma.store.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!persona) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Personal</h1>
        <p className="text-sm text-gray-500 mt-0.5">{persona.nombreCompleto}</p>
      </div>
      <PersonaForm
        persona={{
          ...persona,
          roles: persona.roles.map((r) => r.rol),
          elegibilidades: persona.elegibilidades.map((e) => e.rolHabilita),
        }}
        stores={stores}
      />
    </div>
  );
}

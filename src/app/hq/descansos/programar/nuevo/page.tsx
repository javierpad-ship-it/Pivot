import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";
import { redirect } from "next/navigation";
import { NuevaProgramacionForm } from "@/components/hq/descansos/NuevaProgramacionForm";

export const dynamic = "force-dynamic";

export default async function NuevaProgramacionPage() {
  const user = getSession();
  if (!user) redirect("/login");

  const zonas = await prisma.zona.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
    where: user.rol === "GERENTE_ZONAL" && user.zonaId ? { id: user.zonaId } : undefined,
  });

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Programación</h1>
        <p className="text-sm text-gray-500 mt-0.5">Define el período y la zona para iniciar la programación de descansos</p>
      </div>
      <NuevaProgramacionForm zonas={zonas} usuarioId={user.id} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { UsuariosClient } from "@/components/hq/maintenance/UsuariosClient";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const [usuarios, stores, zonas] = await Promise.all([
    prisma.usuario.findMany({
      include: {
        store: { select: { id: true, name: true } },
        zona:  { select: { id: true, name: true } },
      },
      orderBy: [{ rol: "asc" }, { nombre: "asc" }],
    }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.zona.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona los usuarios del sistema</p>
      </div>
      <UsuariosClient
        initialUsuarios={usuarios.map(({ password: _, ...u }) => u)}
        stores={stores}
        zonas={zonas}
      />
    </div>
  );
}

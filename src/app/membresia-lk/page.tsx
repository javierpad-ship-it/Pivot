import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";
import { MembresiaClient } from "@/components/membresia-lk/MembresiaClient";

export const dynamic = "force-dynamic";

export default async function MembresiaLkPage() {
  const user = getSession()!;
  const isTienda = user.rol === "TIENDA";

  const [clientes, stores] = await Promise.all([
    prisma.membresiaCliente.findMany({
      where: isTienda ? { storeId: user.storeId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { store: true },
    }),
    isTienda ? Promise.resolve([]) : prisma.store.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-brand text-2xl font-black text-gray-900">Membresía LK</h1>
        <p className="text-sm text-gray-500 mt-1">Programa de fidelización de clientes</p>
      </div>
      <MembresiaClient
        clientes={clientes}
        stores={stores}
        fixedStoreId={isTienda ? user.storeId : null}
      />
    </div>
  );
}

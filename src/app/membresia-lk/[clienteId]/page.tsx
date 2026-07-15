import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session-server";
import { ClienteDetailClient } from "@/components/membresia-lk/ClienteDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: { clienteId: string };
}

export default async function ClienteDetailPage({ params }: Props) {
  const user = getSession()!;

  const cliente = await prisma.membresiaCliente.findUnique({
    where: { id: params.clienteId },
    include: {
      store: true,
      movimientos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!cliente) notFound();
  if (user.rol === "TIENDA" && cliente.storeId !== user.storeId) notFound();

  return (
    <ClienteDetailClient
      cliente={{
        ...cliente,
        movimientos: cliente.movimientos.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
      }}
    />
  );
}

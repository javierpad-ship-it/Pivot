import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProgramadoCountForm } from "@/components/store/ProgramadoCountForm";

export const dynamic = "force-dynamic";

interface Props {
  params: { storeId: string; progId: string };
  searchParams: { fecha?: string };
}

export default async function ProgramadoCountPage({ params, searchParams }: Props) {
  const [item, store] = await Promise.all([
    prisma.programacion.findUnique({
      where: { id: params.progId },
      include: {
        brand: true,
        linea: { include: { mundo: true } },
        genero: true,
        tiendas: { select: { storeId: true } },
      },
    }),
    prisma.store.findUnique({ where: { id: params.storeId } }),
  ]);

  if (!item || !store) notFound();

  // Verify this store can count this item (scope=ALL or store is in tiendas list)
  const storeAssigned =
    item.scope === "ALL" ||
    item.tiendas.some((t) => t.storeId === params.storeId);
  if (!storeAssigned) notFound();

  const fecha = searchParams.fecha ?? new Date().toISOString().split("T")[0];

  const existing = await prisma.conteoRegistro.findUnique({
    where: {
      storeId_brandId_lineaId_generoId_fecha: {
        storeId: params.storeId,
        brandId: item.brandId,
        lineaId: item.lineaId,
        generoId: item.generoId,
        fecha: new Date(fecha),
      },
    },
  });

  return (
    <div className="p-5 pb-10 max-w-md">
      <ProgramadoCountForm
        storeId={params.storeId}
        storeName={store.name}
        brandId={item.brandId}
        brandName={item.brand.name}
        lineaId={item.lineaId}
        lineaName={item.linea.name}
        mundoName={item.linea.mundo.name}
        generoId={item.generoId}
        generoName={item.genero.name}
        fecha={fecha}
        existingCantidad={existing?.cantidad ?? null}
        existingEmpleado={existing?.empleado ?? null}
      />
    </div>
  );
}

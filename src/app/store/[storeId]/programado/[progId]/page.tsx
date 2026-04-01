import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProgramadoCountForm } from "@/components/store/ProgramadoCountForm";

export const dynamic = "force-dynamic";

interface Props {
  params: { storeId: string; progId: string };
  searchParams: { fecha?: string };
}

export default async function ProgramadoCountPage({ params, searchParams }: Props) {
  const item = await prisma.programacion.findUnique({
    where: { id: params.progId },
    include: {
      store: true,
      brand: true,
      linea: { include: { mundo: true } },
      genero: true,
    },
  });

  if (!item || item.storeId !== params.storeId) notFound();

  const fecha = searchParams.fecha ?? new Date().toISOString().split("T")[0];

  // Check if already counted for this date
  const existing = await prisma.conteoRegistro.findUnique({
    where: {
      storeId_brandId_lineaId_generoId_fecha: {
        storeId: item.storeId,
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
        storeId={item.storeId}
        storeName={item.store.name}
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

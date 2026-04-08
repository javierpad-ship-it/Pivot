import { prisma } from "@/lib/prisma";
import { ProgramacionClient } from "@/components/hq/ProgramacionClient";

export const dynamic = "force-dynamic";

export default async function ProgramacionPage() {
  const [stores, brands, lineas, generos, items] = await Promise.all([
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.linea.findMany({
      orderBy: [{ mundo: { name: "asc" } }, { name: "asc" }],
      include: { mundo: true },
    }),
    prisma.genero.findMany({ orderBy: { name: "asc" } }),
    prisma.programacion.findMany({
      include: {
        brand: true,
        linea: { include: { mundo: true } },
        genero: true,
        tiendas: { include: { store: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { brand: { name: "asc" } }],
    }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Programación Semanal</h1>
        <p className="text-sm text-gray-500 mt-1">
          Conteos por día (Lunes a Jueves) — para todas o algunas tiendas
        </p>
      </div>
      <ProgramacionClient
        stores={stores}
        brands={brands}
        lineas={lineas}
        generos={generos}
        initialItems={items as Parameters<typeof ProgramacionClient>[0]["initialItems"]}
      />
    </div>
  );
}

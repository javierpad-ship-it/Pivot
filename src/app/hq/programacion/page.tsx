import { prisma } from "@/lib/prisma";
import { ProgramacionClient } from "@/components/hq/ProgramacionClient";

export const dynamic = "force-dynamic";

const SHORT: Record<number, string> = { 1: "L", 2: "M", 3: "Mi", 4: "J", 5: "V", 6: "S", 7: "D" };

export default async function ProgramacionPage() {
  const [enabledDias, stores, brands, lineas, generos, items] = await Promise.all([
    prisma.configDia.findMany({ where: { enabled: true }, orderBy: { dayOfWeek: "asc" } }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { id: { not: "brand-all" } }, orderBy: { name: "asc" } }),
    prisma.linea.findMany({
      orderBy: [{ mundo: { name: "asc" } }, { name: "asc" }],
      include: { mundo: true },
    }),
    prisma.genero.findMany({ where: { id: { not: "genero-all" } }, orderBy: { name: "asc" } }),
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

  const days = enabledDias.map((d) => ({ value: d.dayOfWeek, label: d.name, short: SHORT[d.dayOfWeek] ?? d.name[0] }));

  const dayNames = enabledDias.map((d) => d.name).join(", ");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Programación Semanal</h1>
        <p className="text-sm text-gray-500 mt-1">
          {dayNames ? `Conteos por día (${dayNames}) — para todas o algunas tiendas` : "No hay días habilitados. Configura los días en Mantenimiento → Días de conteo."}
        </p>
      </div>
      <ProgramacionClient
        days={days}
        stores={stores}
        brands={brands}
        lineas={lineas}
        generos={generos}
        initialItems={items as Parameters<typeof ProgramacionClient>[0]["initialItems"]}
      />
    </div>
  );
}

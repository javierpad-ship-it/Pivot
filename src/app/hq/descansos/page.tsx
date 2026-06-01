import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";
import { CalendarioOperativo } from "@/components/hq/descansos/CalendarioOperativo";

export const dynamic = "force-dynamic";

// Get the Monday of the week containing the given date
function getMondayOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DescansosDashboard({
  searchParams,
}: {
  searchParams: { semana?: string; zonaId?: string };
}) {
  const user = getSession();

  const semanaStr = searchParams.semana ?? new Date().toISOString().split("T")[0];
  const lunes = getMondayOfWeek(new Date(semanaStr + "T12:00:00"));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  const zonaFilter =
    user?.rol === "GERENTE_ZONAL" && user.zonaId
      ? user.zonaId
      : searchParams.zonaId ?? undefined;

  const [zonas, registros] = await Promise.all([
    prisma.zona.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.registroDescanso.findMany({
      where: {
        fecha: { gte: lunes, lte: domingo },
        store: zonaFilter ? { zonaId: zonaFilter } : undefined,
        programacion: { estado: "APROBADO" },
      },
      include: {
        store: { select: { name: true, zonaId: true } },
        persona: { select: { nombreCompleto: true } },
        cobertura: { select: { nombreCompleto: true } },
      },
      orderBy: [{ storeId: "asc" }, { fecha: "asc" }, { cargo: "asc" }],
    }),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendario Operativo</h1>
        <p className="text-sm text-gray-500 mt-0.5">Descansos aprobados de la semana</p>
      </div>
      <CalendarioOperativo
        lunes={lunes.toISOString().split("T")[0]}
        zonas={zonas}
        zonaIdSelected={zonaFilter ?? ""}
        registros={registros.map((r) => ({
          id: r.id,
          fecha: r.fecha instanceof Date
            ? r.fecha.toISOString().split("T")[0]
            : String(r.fecha),
          storeName: r.store.name,
          zonaId: r.store.zonaId ?? "",
          personaNombre: r.persona.nombreCompleto,
          coberturaNombre: r.cobertura?.nombreCompleto ?? null,
          cargo: r.cargo,
          tipoMovimiento: r.tipoMovimiento,
        }))}
      />
    </div>
  );
}

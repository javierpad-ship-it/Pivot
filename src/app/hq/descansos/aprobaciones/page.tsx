import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ESTADO_COLORS } from "@/lib/descansos-constants";

export const dynamic = "force-dynamic";

export default async function AprobacionesPage() {
  const pendientes = await prisma.programacionDescanso.findMany({
    where: { estado: "PENDIENTE_APROBACION" },
    orderBy: { updatedAt: "asc" },
    include: {
      zona: { select: { name: true } },
      creadoPor: { select: { nombre: true } },
      _count: { select: { registros: true } },
    },
  });

  const recientes = await prisma.programacionDescanso.findMany({
    where: { estado: { in: ["APROBADO", "RECHAZADO"] } },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
      zona: { select: { name: true } },
      creadoPor: { select: { nombre: true } },
      aprobadoPor: { select: { nombre: true } },
    },
  });

  function fmtDate(d: Date) {
    return new Date(d).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aprobaciones</h1>
        <p className="text-sm text-gray-500 mt-0.5">Revisa y aprueba programaciones de descansos pendientes</p>
      </div>

      {/* Pendientes */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Pendientes ({pendientes.length})
      </h2>
      {pendientes.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-6 text-center text-green-700 text-sm mb-6">
          No hay programaciones pendientes de aprobación
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {pendientes.map((p) => (
            <Link key={p.id} href={`/hq/descansos/programar/${p.id}`}
              className="flex items-center gap-4 bg-white border border-yellow-200 rounded-xl px-5 py-4 hover:shadow-sm hover:border-yellow-400 transition-all">
              <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{p.zona.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS.PENDIENTE_APROBACION}`}>
                    Pendiente
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {fmtDate(p.periodoInicio)} — {fmtDate(p.periodoFin)}
                  <span className="mx-2 text-gray-300">·</span>
                  {p._count.registros} registros
                  <span className="mx-2 text-gray-300">·</span>
                  Enviado por {p.creadoPor.nombre}
                </p>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg flex-shrink-0">
                Revisar →
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Historial reciente */}
      {recientes.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Historial reciente</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zona</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Período</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aprobador</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recientes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.zona.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {fmtDate(p.periodoInicio)} — {fmtDate(p.periodoFin)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[p.estado]}`}>
                        {p.estado === "APROBADO" ? "Aprobado" : "Rechazado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.aprobadoPor?.nombre ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/hq/descansos/programar/${p.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

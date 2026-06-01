import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getSession } from "@/lib/session-server";
import { ESTADO_LABELS, ESTADO_COLORS } from "@/lib/descansos-constants";

export const dynamic = "force-dynamic";

export default async function ProgramarPage() {
  const user = getSession();

  const where =
    user?.rol === "GERENTE_ZONAL" && user.zonaId
      ? { zonaId: user.zonaId }
      : {};

  const programaciones = await prisma.programacionDescanso.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      zona: { select: { name: true } },
      creadoPor: { select: { nombre: true } },
      _count: { select: { registros: true } },
    },
  });

  function fmtDate(d: Date) {
    return new Date(d).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programaciones de Descansos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Crea y gestiona programaciones de descansos por zona</p>
        </div>
        <Link
          href="/hq/descansos/programar/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Programación
        </Link>
      </div>

      {programaciones.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No hay programaciones registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {programaciones.map((p) => (
            <Link
              key={p.id}
              href={`/hq/descansos/programar/${p.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 hover:shadow-sm hover:border-blue-300 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{p.zona.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[p.estado]}`}>
                    {ESTADO_LABELS[p.estado]}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {fmtDate(p.periodoInicio)} — {fmtDate(p.periodoFin)}
                  <span className="mx-2 text-gray-300">·</span>
                  {p._count.registros} registro{p._count.registros !== 1 ? "s" : ""}
                  <span className="mx-2 text-gray-300">·</span>
                  Creado por {p.creadoPor.nombre}
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

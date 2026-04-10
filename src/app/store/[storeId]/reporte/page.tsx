import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props { params: { storeId: string } }

export default async function ReporteTiendaPage({ params }: Props) {
  const store = await prisma.store.findUnique({ where: { id: params.storeId } });
  if (!store) notFound();

  // Find all unique (brand, linea, genero) combinations that have been counted
  const combinations = await prisma.conteoRegistro.groupBy({
    by: ["brandId", "lineaId", "generoId"],
    where: { storeId: params.storeId },
    orderBy: [{ brandId: "asc" }],
  });

  // For each combination get the last 2 counts (último y anterior)
  const reportItems = await Promise.all(
    combinations.map(async (combo) => {
      const counts = await prisma.conteoRegistro.findMany({
        where: {
          storeId: params.storeId,
          brandId: combo.brandId,
          lineaId: combo.lineaId,
          generoId: combo.generoId,
        },
        orderBy: { fecha: "desc" },
        take: 2,
        include: {
          brand: true,
          linea: { include: { mundo: true } },
          genero: true,
        },
      });
      return {
        current: counts[0],
        previous: counts[1] ?? null,
      };
    })
  );

  // Sort: items with differences first
  const sorted = [...reportItems].sort((a, b) => {
    const diffA = a.previous !== null ? Math.abs(a.current.cantidad - a.previous.cantidad) : 0;
    const diffB = b.previous !== null ? Math.abs(b.current.cantidad - b.previous.cantidad) : 0;
    return diffB - diffA;
  });

  const conDiferencia = reportItems.filter(
    (r) => r.previous !== null && r.current.cantidad !== r.previous.cantidad
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href={`/store/${params.storeId}`}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{store.name}</p>
            <p className="text-xs text-gray-400">Último conteo vs. anterior</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {reportItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No hay conteos registrados aún</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex gap-3">
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{reportItems.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Ítems contados</p>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{conDiferencia}</p>
                <p className="text-xs text-gray-500 mt-0.5">Con diferencia</p>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{reportItems.length - conDiferencia}</p>
                <p className="text-xs text-gray-500 mt-0.5">Sin cambio</p>
              </div>
            </div>

            {/* Items */}
            {sorted.map((r) => {
              const c = r.current;
              const diff = r.previous !== null ? c.cantidad - r.previous.cantidad : null;
              const pct = r.previous && r.previous.cantidad > 0
                ? Math.round((Math.abs(diff!) / r.previous.cantidad) * 100)
                : null;

              let diffColor = "text-gray-400";
              let diffBg = "bg-gray-50";
              if (diff !== null) {
                if (diff > 0) { diffColor = "text-green-700"; diffBg = "bg-green-50"; }
                else if (diff < 0) { diffColor = "text-red-600"; diffBg = "bg-red-50"; }
                else { diffColor = "text-gray-500"; diffBg = "bg-gray-50"; }
              }

              const fechaActual = new Date(c.fecha instanceof Date ? c.fecha : c.fecha + "T12:00:00")
                .toLocaleDateString("es", { day: "numeric", month: "short" });
              const fechaAnterior = r.previous
                ? new Date(r.previous.fecha instanceof Date ? r.previous.fecha : r.previous.fecha + "T12:00:00")
                    .toLocaleDateString("es", { day: "numeric", month: "short" })
                : null;

              return (
                <div key={`${c.brandId}|${c.lineaId}|${c.generoId}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Product header */}
                  <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {c.brandId === "brand-all" ? "Todas las marcas" : c.brand.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="text-gray-400">{c.linea.mundo.name} /</span> {c.linea.name}
                        </p>
                      </div>
                      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {c.generoId === "genero-all" ? "Todos" : c.genero.name}
                      </span>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100">
                    <div className="px-3 py-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{c.cantidad}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fechaActual}</p>
                    </div>
                    <div className="px-3 py-3 text-center">
                      {r.previous !== null ? (
                        <>
                          <p className="text-xl font-bold text-gray-400">{r.previous.cantidad}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{fechaAnterior}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-gray-300">—</p>
                          <p className="text-xs text-gray-400 mt-0.5">Sin anterior</p>
                        </>
                      )}
                    </div>
                    <div className={`px-3 py-3 text-center ${diffBg}`}>
                      {diff !== null ? (
                        <>
                          <p className={`text-xl font-bold ${diffColor}`}>
                            {diff > 0 ? "+" : ""}{diff}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {pct !== null ? `${pct}%` : "Dif."}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-gray-300">—</p>
                          <p className="text-xs text-gray-400 mt-0.5">Primer conteo</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">{c.empleado}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.creadoEn).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

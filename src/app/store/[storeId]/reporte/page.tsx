import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props { params: { storeId: string } }

export default async function ReporteDiarioPage({ params }: Props) {
  const store = await prisma.store.findUnique({ where: { id: params.storeId } });
  if (!store) notFound();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Today's conteos
  const conteos = await prisma.conteoRegistro.findMany({
    where: { storeId: params.storeId, fecha: new Date(todayStr) },
    include: {
      brand: true,
      linea: { include: { mundo: true } },
      genero: true,
    },
    orderBy: [{ brand: { name: "asc" } }],
  });

  // For each conteo, find the most recent previous one (same store+brand+linea+género, before today)
  const conteosConAnterior = await Promise.all(
    conteos.map(async (c) => {
      const anterior = await prisma.conteoRegistro.findFirst({
        where: {
          storeId: params.storeId,
          brandId: c.brandId,
          lineaId: c.lineaId,
          generoId: c.generoId,
          fecha: { lt: new Date(todayStr) },
        },
        orderBy: { fecha: "desc" },
      });
      return { ...c, anterior };
    })
  );

  const fechaDisplay = new Date(todayStr + "T12:00:00").toLocaleDateString("es", {
    weekday: "long", day: "numeric", month: "long",
  });

  const totalConteos = conteosConAnterior.length;
  const conDiferencia = conteosConAnterior.filter(
    (c) => c.anterior !== null && c.cantidad !== c.anterior.cantidad
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
            <p className="text-xs text-gray-400 capitalize">{fechaDisplay}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Summary chips */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalConteos}</p>
            <p className="text-xs text-gray-500 mt-0.5">Conteos del día</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{conDiferencia}</p>
            <p className="text-xs text-gray-500 mt-0.5">Con diferencia</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{totalConteos - conDiferencia}</p>
            <p className="text-xs text-gray-500 mt-0.5">Sin cambio</p>
          </div>
        </div>

        {/* Cards */}
        {conteosConAnterior.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            <p className="text-sm">No hay conteos registrados hoy</p>
          </div>
        ) : (
          conteosConAnterior.map((c) => {
            const diff = c.anterior !== null ? c.cantidad - c.anterior.cantidad : null;
            const pct = c.anterior && c.anterior.cantidad > 0
              ? Math.round((Math.abs(diff!) / c.anterior.cantidad) * 100)
              : null;

            let diffColor = "text-gray-400";
            let diffBg = "bg-gray-50";
            if (diff !== null) {
              if (diff > 0) { diffColor = "text-green-700"; diffBg = "bg-green-50"; }
              else if (diff < 0) { diffColor = "text-red-600"; diffBg = "bg-red-50"; }
              else { diffColor = "text-gray-500"; diffBg = "bg-gray-50"; }
            }

            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Product header */}
                <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{c.brand.name}</p>
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-400">{c.linea.mundo.name} /</span> {c.linea.name}
                      </p>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {c.genero.name}
                    </span>
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="px-3 py-3 text-center">
                    <p className="text-xl font-bold text-gray-900">{c.cantidad}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Hoy</p>
                  </div>
                  <div className="px-3 py-3 text-center">
                    {c.anterior !== null ? (
                      <>
                        <p className="text-xl font-bold text-gray-500">{c.anterior.cantidad}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Anterior</p>
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
                        <p className="text-xs text-gray-400 mt-0.5">Dif.</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer: employee + time */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">{c.empleado}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(c.creadoEn).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

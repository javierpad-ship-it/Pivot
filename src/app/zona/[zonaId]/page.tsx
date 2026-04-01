import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ZonaProgressPage({ params }: { params: { zonaId: string } }) {
  const zona = await prisma.zona.findUnique({
    where: { id: params.zonaId },
    include: {
      stores: {
        orderBy: { name: "asc" },
        include: {
          _count: { select: { countTasks: true } },
          countTasks: {
            select: { id: true, countRecord: { select: { id: true } } },
          },
        },
      },
    },
  });

  if (!zona) notFound();

  const storeStats = zona.stores.map((store) => {
    const total = store.countTasks.length;
    const done = store.countTasks.filter((t) => t.countRecord !== null).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { id: store.id, name: store.name, location: store.location, total, done, pct };
  });

  const totalAll = storeStats.reduce((s, t) => s + t.total, 0);
  const doneAll = storeStats.reduce((s, t) => s + t.done, 0);
  const pctAll = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/zona" className="text-sm text-teal-600 hover:text-teal-800 transition-colors">
            ← Zonas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{zona.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Avance de conteos por tienda</p>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Avance total de la zona</p>
            <span className="text-lg font-bold text-teal-700">{pctAll}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-teal-500 h-3 rounded-full transition-all"
              style={{ width: `${pctAll}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{doneAll} de {totalAll} tareas completadas</p>
        </div>

        {/* Per-store list */}
        {storeStats.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No hay tiendas asignadas a esta zona
          </div>
        ) : (
          <div className="space-y-3">
            {storeStats.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.location}</p>
                  </div>
                  <span className={`text-sm font-bold ${s.pct === 100 ? "text-green-600" : "text-gray-700"}`}>
                    {s.pct}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${s.pct === 100 ? "bg-green-500" : "bg-teal-500"}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                {s.total > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">{s.done} de {s.total} tareas completadas</p>
                )}
                {s.total === 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">Sin tareas asignadas</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

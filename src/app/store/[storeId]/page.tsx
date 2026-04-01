import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

interface Props { params: { storeId: string } }

const DAY_NAMES = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default async function StoreDashboard({ params }: Props) {
  const store = await prisma.store.findUnique({ where: { id: params.storeId } });
  if (!store) notFound();

  // Day logic (JS: 0=Sun, 1=Mon...6=Sat — our schema: 1=Mon...4=Thu)
  const today = new Date();
  const todayJs = today.getDay(); // 0-6
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const isScheduleDay = todayJs >= 1 && todayJs <= 4; // Mon-Thu

  // Yesterday for pending check
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayJs = yesterday.getDay();
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const isYesterdayScheduleDay = yesterdayJs >= 1 && yesterdayJs <= 4;

  const [tasks, todayItems, todayDone, yesterdayItems, yesterdayDone] = await Promise.all([
    // Individual tasks (existing system)
    prisma.countTask.findMany({
      where: { storeId: params.storeId },
      include: { brand: true, linea: { include: { mundo: true } }, countRecord: true },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    // Today's programmed items (only Mon-Thu)
    isScheduleDay
      ? prisma.programacion.findMany({
          where: { storeId: params.storeId, dayOfWeek: todayJs },
          include: { brand: true, linea: { include: { mundo: true } }, genero: true },
          orderBy: [{ brand: { name: "asc" } }],
        })
      : Promise.resolve([]),
    // Today's completed conteos
    isScheduleDay
      ? prisma.conteoRegistro.findMany({
          where: { storeId: params.storeId, fecha: new Date(todayStr) },
          select: { brandId: true, lineaId: true, generoId: true },
        })
      : Promise.resolve([]),
    // Yesterday's programmed items (for pending check)
    isYesterdayScheduleDay
      ? prisma.programacion.findMany({
          where: { storeId: params.storeId, dayOfWeek: yesterdayJs },
          include: { brand: true, linea: { include: { mundo: true } }, genero: true },
          orderBy: [{ brand: { name: "asc" } }],
        })
      : Promise.resolve([]),
    // Yesterday's completed conteos
    isYesterdayScheduleDay
      ? prisma.conteoRegistro.findMany({
          where: { storeId: params.storeId, fecha: new Date(yesterdayStr) },
          select: { brandId: true, lineaId: true, generoId: true },
        })
      : Promise.resolve([]),
  ]);

  const doneKey = (b: string, l: string, g: string) => `${b}|${l}|${g}`;
  const todayDoneSet = new Set(todayDone.map((r) => doneKey(r.brandId, r.lineaId, r.generoId)));
  const yesterdayDoneSet = new Set(yesterdayDone.map((r) => doneKey(r.brandId, r.lineaId, r.generoId)));

  const todayPending = todayItems.filter((i) => !todayDoneSet.has(doneKey(i.brandId, i.lineaId, i.generoId)));
  const todayCompleted = todayItems.filter((i) => todayDoneSet.has(doneKey(i.brandId, i.lineaId, i.generoId)));
  const yesterdayPending = yesterdayItems.filter((i) => !yesterdayDoneSet.has(doneKey(i.brandId, i.lineaId, i.generoId)));

  const pending = tasks.filter((t) => t.status === "PENDING");
  const completed = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div className="p-5 pb-10">
      <div className="flex items-center gap-3 py-4 mb-6">
        <Link href="/store" className="p-2 -ml-2 rounded-lg hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-sm text-gray-500">{store.distrito} · {store.ciudad}</p>
        </div>
      </div>

      {/* ---- PROGRAMACIÓN SEMANAL (Lun-Jue) ---- */}
      {(isScheduleDay || yesterdayPending.length > 0) && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Conteos Programados — {DAY_NAMES[todayJs]}
          </h2>

          {/* Pendientes de ayer */}
          {yesterdayPending.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-orange-600 mb-2">
                Pendientes de {DAY_NAMES[yesterdayJs]} ({yesterdayPending.length})
              </p>
              <div className="space-y-2">
                {yesterdayPending.map((item) => (
                  <Link
                    key={item.id}
                    href={`/store/${params.storeId}/programado/${item.id}?fecha=${yesterdayStr}`}
                    className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-3 hover:shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.brand.name}</p>
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-400">{item.linea.mundo.name} /</span> {item.linea.name}
                        <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{item.genero.name}</span>
                      </p>
                    </div>
                    <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">Pendiente →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ítems de hoy pendientes */}
          {isScheduleDay && todayPending.length > 0 && (
            <div className="space-y-2 mb-2">
              {todayPending.map((item) => (
                <Link
                  key={item.id}
                  href={`/store/${params.storeId}/programado/${item.id}?fecha=${todayStr}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-300 active:scale-[0.98] transition-all"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.brand.name}</p>
                    <p className="text-xs text-gray-500">
                      <span className="text-gray-400">{item.linea.mundo.name} /</span> {item.linea.name}
                      <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{item.genero.name}</span>
                    </p>
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Contar →</span>
                </Link>
              ))}
            </div>
          )}

          {/* Ítems de hoy completados */}
          {isScheduleDay && todayCompleted.length > 0 && (
            <div className="space-y-2">
              {todayCompleted.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.brand.name}</p>
                    <p className="text-xs text-gray-500">
                      <span className="text-gray-400">{item.linea.mundo.name} /</span> {item.linea.name}
                      <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{item.genero.name}</span>
                    </p>
                  </div>
                  <Badge variant="green">Contado</Badge>
                </div>
              ))}
            </div>
          )}

          {isScheduleDay && todayItems.length === 0 && yesterdayPending.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">No hay ítems programados para hoy</p>
          )}
        </div>
      )}

      {/* ---- TAREAS INDIVIDUALES ---- */}
      {tasks.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{pending.length}</p>
              <p className="text-xs text-yellow-600 mt-0.5">Tareas Pendientes</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{completed.length}</p>
              <p className="text-xs text-green-600 mt-0.5">Tareas Completadas</p>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Tareas Asignadas Pendientes ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((task) => (
                  <Link key={task.id} href={`/store/${params.storeId}/tasks/${task.id}`}
                    className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-blue-300 active:scale-[0.98] transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{task.brand.name}</p>
                        <p className="text-sm text-gray-500">
                          <span className="text-xs text-gray-400">{task.linea.mundo.name} /</span> {task.linea.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="yellow">Pendiente</Badge>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Tareas Completadas ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{task.brand.name}</p>
                        <p className="text-sm text-gray-500">
                          <span className="text-xs text-gray-400">{task.linea.mundo.name} /</span> {task.linea.name}
                        </p>
                      </div>
                      <Badge variant="green">Listo</Badge>
                    </div>
                    {task.countRecord && (
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Cantidad</p>
                          <p className="font-semibold text-gray-900">{task.countRecord.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Contado por</p>
                          <p className="font-medium text-gray-700">{task.countRecord.employeeName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tasks.length === 0 && !isScheduleDay && yesterdayPending.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">No hay tareas asignadas ni conteos programados.</p>
        </div>
      )}
    </div>
  );
}

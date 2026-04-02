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

  const today = new Date();
  const todayJs = today.getDay();
  const todayStr = today.toISOString().split("T")[0];
  const isScheduleDay = todayJs >= 1 && todayJs <= 4;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayJs = yesterday.getDay();
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const isYesterdayScheduleDay = yesterdayJs >= 1 && yesterdayJs <= 4;

  // Start of today (UTC) for filtering completed individual tasks
  const todayStart = new Date(today);
  todayStart.setUTCHours(0, 0, 0, 0);

  const [tasks, todayItems, todayDone, yesterdayItems, yesterdayDone] = await Promise.all([
    // Individual tasks: pending always shown, completed only if done today
    prisma.countTask.findMany({
      where: {
        storeId: params.storeId,
        OR: [
          { status: "PENDING" },
          { status: "COMPLETED", countRecord: { countedAt: { gte: todayStart } } },
        ],
      },
      include: { brand: true, linea: { include: { mundo: true } }, countRecord: true },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    isScheduleDay
      ? prisma.programacion.findMany({
          where: { storeId: params.storeId, dayOfWeek: todayJs },
          include: { brand: true, linea: { include: { mundo: true } }, genero: true },
          orderBy: [{ brand: { name: "asc" } }],
        })
      : Promise.resolve([]),
    isScheduleDay
      ? prisma.conteoRegistro.findMany({
          where: { storeId: params.storeId, fecha: new Date(todayStr) },
          select: { brandId: true, lineaId: true, generoId: true },
        })
      : Promise.resolve([]),
    isYesterdayScheduleDay
      ? prisma.programacion.findMany({
          where: { storeId: params.storeId, dayOfWeek: yesterdayJs },
          include: { brand: true, linea: { include: { mundo: true } }, genero: true },
          orderBy: [{ brand: { name: "asc" } }],
        })
      : Promise.resolve([]),
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
  const completedToday = tasks.filter((t) => t.status === "COMPLETED");

  const allProgrammedDone = isScheduleDay && todayItems.length > 0 && todayPending.length === 0;

  return (
    <div className="p-5 pb-10">
      <div className="flex items-center gap-3 py-4 mb-4">
        <Link href="/store" className="p-2 -ml-2 rounded-lg hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-sm text-gray-500">{store.distrito} · {store.ciudad}</p>
        </div>
        {/* Reporte button — always visible if there are any conteos today */}
        {(todayCompleted.length > 0 || completedToday.length > 0) && (
          <Link href={`/store/${params.storeId}/reporte`}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reporte
          </Link>
        )}
      </div>

      {/* All done banner */}
      {allProgrammedDone && yesterdayPending.length === 0 && (
        <Link href={`/store/${params.storeId}/reporte`}
          className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl p-4 mb-5 hover:bg-green-100 transition-colors">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">¡Todos los conteos completados!</p>
            <p className="text-xs text-green-600">Toca aquí para ver el reporte del día →</p>
          </div>
        </Link>
      )}

      {/* ---- PROGRAMACIÓN SEMANAL ---- */}
      {(isScheduleDay || yesterdayPending.length > 0) && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Conteos Programados — {DAY_NAMES[todayJs]}
          </h2>

          {yesterdayPending.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-orange-600 mb-2">
                Pendientes de {DAY_NAMES[yesterdayJs]} ({yesterdayPending.length})
              </p>
              <div className="space-y-2">
                {yesterdayPending.map((item) => (
                  <Link key={item.id}
                    href={`/store/${params.storeId}/programado/${item.id}?fecha=${yesterdayStr}`}
                    className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-3 hover:shadow-sm active:scale-[0.98] transition-all">
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

          {isScheduleDay && todayPending.length > 0 && (
            <div className="space-y-2 mb-2">
              {todayPending.map((item) => (
                <Link key={item.id}
                  href={`/store/${params.storeId}/programado/${item.id}?fecha=${todayStr}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-300 active:scale-[0.98] transition-all">
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

          {isScheduleDay && todayCompleted.length > 0 && (
            <div className="space-y-2">
              {todayCompleted.map((item) => (
                <div key={item.id}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
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
      {(pending.length > 0 || completedToday.length > 0) && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tareas Asignadas
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
            {completedToday.map((task) => (
              <div key={task.id} className="bg-green-50 rounded-xl border border-green-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{task.brand.name}</p>
                    <p className="text-sm text-gray-500">
                      <span className="text-xs text-gray-400">{task.linea.mundo.name} /</span> {task.linea.name}
                    </p>
                  </div>
                  <Badge variant="green">Listo hoy</Badge>
                </div>
                {task.countRecord && (
                  <div className="mt-2 pt-2 border-t border-green-100 flex gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Cantidad</p>
                      <p className="font-semibold text-gray-900">{task.countRecord.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Empleado</p>
                      <p className="font-medium text-gray-700">{task.countRecord.employeeName}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && !isScheduleDay && yesterdayPending.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">No hay tareas ni conteos programados para hoy.</p>
        </div>
      )}
    </div>
  );
}

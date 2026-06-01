import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["", "Lunes", "Martes", "Miércoles", "Jueves"];

export default async function HQDashboard() {
  const today = new Date();
  const todayJs = today.getDay(); // 0=Sun…6=Sat
  const todayStr = today.toISOString().split("T")[0];
  const isScheduleDay = todayJs >= 1 && todayJs <= 4;

  const [
    totalTasks, pendingTasks, completedTasks,
    totalProgramado, totalContado,
    recentConteos,
  ] = await Promise.all([
    prisma.countTask.count(),
    prisma.countTask.count({ where: { status: "PENDING" } }),
    prisma.countTask.count({ where: { status: "COMPLETED" } }),
    isScheduleDay ? prisma.programacion.count({ where: { dayOfWeek: todayJs } }) : Promise.resolve(0),
    isScheduleDay ? prisma.conteoRegistro.count({ where: { fecha: new Date(todayStr) } }) : Promise.resolve(0),
    prisma.conteoRegistro.findMany({
      take: 8,
      orderBy: { creadoEn: "desc" },
      include: { store: true, brand: true, linea: { include: { mundo: true } }, genero: true },
    }),
  ]);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de conteos cíclicos</p>
        </div>
        <Link href="/hq/programacion">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Programación
          </button>
        </Link>
      </div>

      {/* Programacion de hoy (solo Lun-Jue) */}
      {isScheduleDay && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Hoy — {DAY_NAMES[todayJs]}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Card><CardBody>
              <p className="text-sm text-gray-500">Programados hoy</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{totalProgramado}</p>
            </CardBody></Card>
            <Card><CardBody>
              <p className="text-sm text-gray-500">Contados hoy</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{totalContado}</p>
              {totalProgramado > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((totalContado / totalProgramado) * 100)}% completado
                </p>
              )}
            </CardBody></Card>
          </div>
        </div>
      )}

      {/* Tareas individuales */}
      <div className="grid grid-cols-3 gap-3 mb-6 sm:gap-4">
        <Card><CardBody>
          <p className="text-sm text-gray-500">Tareas Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalTasks}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingTasks}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-sm text-gray-500">Completadas</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completedTasks}</p>
        </CardBody></Card>
      </div>

      {/* Conteos recientes de la matriz */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Conteos Recientes (Programación)</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tienda</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Marca</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mundo / Línea</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Género</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Cantidad</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentConteos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No hay conteos registrados aún
                  </td>
                </tr>
              ) : recentConteos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.store.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.brand.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="text-xs text-gray-400">{c.linea.mundo.name} /</span> {c.linea.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="yellow">{c.genero.name}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.cantidad}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.fecha).toLocaleDateString("es")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link href="/hq/programacion">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer">
            <CardBody className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Programación</p>
                <p className="text-xs text-gray-500">Matriz semanal Lun-Jue</p>
              </div>
            </CardBody>
          </Card>
        </Link>
        <Link href="/hq/reports">
          <Card className="hover:border-green-300 transition-colors cursor-pointer">
            <CardBody className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Reportes</p>
                <p className="text-xs text-gray-500">Historial de conteos</p>
              </div>
            </CardBody>
          </Card>
        </Link>
        <Link href="/hq/mantenimiento">
          <Card className="hover:border-orange-300 transition-colors cursor-pointer">
            <CardBody className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Mantenimiento</p>
                <p className="text-xs text-gray-500">Tiendas, marcas, géneros…</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function HQDashboard() {
  const [total, pending, completed, recentTasks] = await Promise.all([
    prisma.countTask.count(),
    prisma.countTask.count({ where: { status: "PENDING" } }),
    prisma.countTask.count({ where: { status: "COMPLETED" } }),
    prisma.countTask.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { store: true, brand: true, linea: { include: { mundo: true } } },
    }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de tareas de conteo cíclico</p>
        </div>
        <Link href="/hq/tasks/new">
          <Button size="md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Tarea
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card><CardBody>
          <p className="text-sm text-gray-500">Total Tareas</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pending}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-sm text-gray-500">Completadas</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completed}</p>
        </CardBody></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tareas Recientes</h2>
            <Link href="/hq/tasks" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tienda</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Marca</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mundo / Línea</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Creada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{task.store.name}</td>
                  <td className="px-6 py-3 text-gray-600">{task.brand.name}</td>
                  <td className="px-6 py-3 text-gray-600">
                    <span className="text-xs text-gray-400">{task.linea.mundo.name} /</span> {task.linea.name}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={task.status === "COMPLETED" ? "green" : "yellow"}>
                      {task.status === "COMPLETED" ? "Completada" : "Pendiente"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{new Date(task.createdAt).toLocaleDateString("es")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Link href="/hq/tasks/new">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer">
            <CardBody className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Crear Tarea</p>
                <p className="text-xs text-gray-500">Asignar conteo a tienda</p>
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
                <p className="text-xs text-gray-500">Comparar vs stock sistema</p>
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
                <p className="text-xs text-gray-500">Tiendas, marcas, mundos, líneas</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}

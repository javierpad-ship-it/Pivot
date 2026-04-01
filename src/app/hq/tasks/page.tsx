import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { storeId?: string; status?: string; brandId?: string; lineaId?: string };
}

export default async function TasksPage({ searchParams }: Props) {
  const [tasks, stores, brands, lineas] = await Promise.all([
    prisma.countTask.findMany({
      where: {
        ...(searchParams.storeId ? { storeId: searchParams.storeId } : {}),
        ...(searchParams.status ? { status: searchParams.status } : {}),
        ...(searchParams.brandId ? { brandId: searchParams.brandId } : {}),
        ...(searchParams.lineaId ? { lineaId: searchParams.lineaId } : {}),
      },
      include: { store: true, brand: true, linea: { include: { mundo: true } }, countRecord: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.linea.findMany({ orderBy: [{ mundo: { name: "asc" } }, { name: "asc" }], include: { mundo: true } }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas de Conteo</h1>
          <p className="text-sm text-gray-500 mt-1">{tasks.length} tareas encontradas</p>
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

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <select name="storeId" defaultValue={searchParams.storeId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las tiendas</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="brandId" defaultValue={searchParams.brandId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las marcas</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select name="lineaId" defaultValue={searchParams.lineaId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las líneas</option>
          {lineas.map((l) => <option key={l.id} value={l.id}>{l.mundo.name} / {l.name}</option>)}
        </select>
        <select name="status" defaultValue={searchParams.status ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="COMPLETED">Completada</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          Filtrar
        </button>
        {(searchParams.storeId || searchParams.status || searchParams.brandId || searchParams.lineaId) && (
          <Link href="/hq/tasks" className="px-4 py-2 text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Limpiar
          </Link>
        )}
      </form>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tienda</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Marca</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mundo / Línea</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Cantidad</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Empleado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Creada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No hay tareas. <Link href="/hq/tasks/new" className="text-blue-600 hover:underline">Crear una.</Link>
                  </td>
                </tr>
              ) : tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-900">{task.store.name}</p>
                    <p className="text-xs text-gray-400">{task.store.distrito} · {task.store.ciudad}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-700">{task.brand.name}</td>
                  <td className="px-6 py-3 text-gray-700">
                    <span className="text-xs text-gray-400">{task.linea.mundo.name} /</span> {task.linea.name}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={task.status === "COMPLETED" ? "green" : "yellow"}>
                      {task.status === "COMPLETED" ? "Completada" : "Pendiente"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-gray-700">{task.countRecord ? task.countRecord.quantity : "—"}</td>
                  <td className="px-6 py-3 text-gray-700">{task.countRecord ? task.countRecord.employeeName : "—"}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{new Date(task.createdAt).toLocaleDateString("es")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

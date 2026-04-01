import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CountForm } from "@/components/store/CountForm";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

interface Props { params: { storeId: string; taskId: string } }

export default async function CountPage({ params }: Props) {
  const task = await prisma.countTask.findUnique({
    where: { id: params.taskId },
    include: { store: true, brand: true, linea: { include: { mundo: true } }, countRecord: true },
  });

  if (!task || task.storeId !== params.storeId) notFound();

  return (
    <div className="p-5 pb-10">
      <div className="flex items-center gap-3 py-4 mb-6">
        <Link href={`/store/${params.storeId}`} className="p-2 -ml-2 rounded-lg hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {task.status === "COMPLETED" ? "Conteo Enviado" : "Registrar Conteo"}
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tienda</p>
            <p className="font-medium text-gray-900">{task.store.name}</p>
            <p className="text-xs text-gray-500">{task.store.distrito} · {task.store.ciudad}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Estado</p>
            <Badge variant={task.status === "COMPLETED" ? "green" : "yellow"}>
              {task.status === "COMPLETED" ? "Completada" : "Pendiente"}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Marca</p>
            <p className="font-medium text-gray-900">{task.brand.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mundo / Línea</p>
            <p className="font-medium text-gray-900">
              <span className="text-xs text-gray-400">{task.linea.mundo.name} /</span> {task.linea.name}
            </p>
          </div>
        </div>
      </div>

      {task.status === "COMPLETED" && task.countRecord ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800">Conteo Ya Registrado</p>
              <p className="text-xs text-green-600">Esta tarea ya fue completada</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Cantidad Contada</span>
              <span className="font-bold text-green-900 text-lg">{task.countRecord.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Empleado</span>
              <span className="font-medium text-green-900">{task.countRecord.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Fecha y Hora</span>
              <span className="text-green-800">{new Date(task.countRecord.countedAt).toLocaleString("es")}</span>
            </div>
          </div>
        </div>
      ) : (
        <CountForm taskId={task.id} storeId={params.storeId} />
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { DiasClient } from "@/components/hq/maintenance/DiasClient";

export const dynamic = "force-dynamic";

export default async function DiasPage() {
  const dias = await prisma.configDia.findMany({ orderBy: { dayOfWeek: "asc" } });
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Días de conteo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Activa o desactiva los días en que se pueden programar conteos
        </p>
      </div>
      <DiasClient initialDias={dias} />
    </div>
  );
}

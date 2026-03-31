import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StorePicker() {
  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8 pt-2">
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Selecciona tu Tienda</h1>
          <p className="text-sm text-gray-500">Toca tu tienda para ver las tareas</p>
        </div>
      </div>

      <div className="space-y-3">
        {stores.map((store) => (
          <Link key={store.id} href={`/store/${store.id}`}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-green-300 transition-all active:scale-[0.98]">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{store.name}</p>
              <p className="text-sm text-gray-500">{store.location}</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

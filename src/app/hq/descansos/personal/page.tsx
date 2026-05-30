import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ROL_PERSONAL_LABELS } from "@/lib/descansos-constants";

export const dynamic = "force-dynamic";

export default async function PersonalPage() {
  const personas = await prisma.persona.findMany({
    orderBy: { nombreCompleto: "asc" },
    include: {
      tiendaBase: { select: { name: true } },
      roles: true,
    },
  });

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administra el personal habilitado para cobertura de descansos</p>
        </div>
        <Link
          href="/hq/descansos/personal/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Persona
        </Link>
      </div>

      {personas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">No hay personal registrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tienda base</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Roles</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {personas.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.activo ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="font-medium text-gray-900">{p.nombreCompleto}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="font-mono text-xs">{p.codigo}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.tiendaBase?.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.roles.slice(0, 3).map((r) => (
                        <span key={r.id} className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-xs">
                          {ROL_PERSONAL_LABELS[r.rol] ?? r.rol}
                        </span>
                      ))}
                      {p.roles.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{p.roles.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/hq/descansos/personal/${p.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

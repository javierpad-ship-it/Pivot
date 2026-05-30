"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ROL_PERSONAL_LABELS, TIPO_MOVIMIENTO_LABELS, TIPO_COLOR } from "@/lib/descansos-constants";

interface Registro {
  id: string;
  fecha: string;
  storeName: string;
  zonaId: string;
  personaNombre: string;
  coberturaNombre: string | null;
  cargo: string;
  tipoMovimiento: string;
}

interface Props {
  lunes: string;
  zonas: { id: string; name: string }[];
  zonaIdSelected: string;
  registros: Registro[];
}

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CalendarioOperativo({ lunes, zonas, zonaIdSelected, registros }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dias: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunes + "T12:00:00");
    d.setDate(d.getDate() + i);
    dias.push(d.toISOString().split("T")[0]);
  }

  function navSemana(delta: number) {
    const d = new Date(lunes + "T12:00:00");
    d.setDate(d.getDate() + delta * 7);
    const params = new URLSearchParams(searchParams.toString());
    params.set("semana", d.toISOString().split("T")[0]);
    router.push(`/hq/descansos?${params.toString()}`);
  }

  function setZona(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("zonaId", id);
    else params.delete("zonaId");
    router.push(`/hq/descansos?${params.toString()}`);
  }

  // Group by store
  const stores = Array.from(new Set(registros.map((r) => r.storeName))).sort();

  function getCell(store: string, fecha: string) {
    return registros.filter((r) => r.storeName === store && r.fecha === fecha);
  }

  const formatDay = (dateStr: string, short: string) => {
    const d = new Date(dateStr + "T12:00:00");
    const day = d.getDate();
    return `${short} ${day}`;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => navSemana(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 px-2 min-w-[160px] text-center">
            {new Date(lunes + "T12:00:00").toLocaleDateString("es", { day: "numeric", month: "long" })}
            {" – "}
            {new Date(dias[6] + "T12:00:00").toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <button onClick={() => navSemana(1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {zonas.length > 0 && (
          <select value={zonaIdSelected} onChange={(e) => setZona(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todas las zonas</option>
            {zonas.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Descanso
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Vacaciones
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> Capacitación
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      {stores.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No hay descansos aprobados para esta semana
          {zonaIdSelected && " en la zona seleccionada"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[140px] border-r border-gray-200">
                  Tienda
                </th>
                {dias.map((d, i) => {
                  const esSabado = i === 5;
                  const esDomingo = i === 6;
                  return (
                    <th key={d} className={`px-3 py-3 font-semibold text-gray-600 text-center min-w-[100px] border-r border-gray-100 last:border-r-0 ${esSabado ? "bg-orange-50" : esDomingo ? "bg-gray-100" : ""}`}>
                      {formatDay(d, DIAS[i])}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-200 align-top">
                    {store}
                  </td>
                  {dias.map((d, i) => {
                    const cell = getCell(store, d);
                    const esSabado = i === 5;
                    return (
                      <td key={d} className={`px-2 py-2 align-top border-r border-gray-100 last:border-r-0 ${esSabado ? "bg-orange-50/30" : ""}`}>
                        {cell.map((r) => (
                          <div key={r.id} className={`mb-1 px-2 py-1 rounded-lg border text-xs ${TIPO_COLOR[r.tipoMovimiento] ?? "bg-gray-100"}`}>
                            <p className="font-semibold truncate">{r.personaNombre}</p>
                            <p className="opacity-75 truncate">{ROL_PERSONAL_LABELS[r.cargo] ?? r.cargo}</p>
                            {r.coberturaNombre && (
                              <p className="text-green-700 truncate">→ {r.coberturaNombre}</p>
                            )}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

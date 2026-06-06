"use client";

import { useState, useEffect, useCallback } from "react";

// ── ISO week helpers ──────────────────────────────────────────────────────────
function getISOWeek(date: Date): { semana: number; anio: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { semana, anio: d.getUTCFullYear() };
}

function getWeekRange(semana: number, anio: number): { inicio: Date; fin: Date } {
  const jan4 = new Date(Date.UTC(anio, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (semana - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { inicio: monday, fin: sunday };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", timeZone: "UTC" });
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 0 }).format(n);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Store {
  id: string;
  name: string;
  distrito: string;
}

interface VentaReal {
  id: string;
  cuotaId: string;
  fecha: string;
  monto: number;
  empleado: string | null;
}

interface CuotaVentas {
  id: string;
  storeId: string;
  semana: number;
  anio: number;
  monto: number;
  store: Store;
  ventas: VentaReal[];
}

// ── Main component ────────────────────────────────────────────────────────────
export function CuotasClient({ stores }: { stores: Store[] }) {
  const today = new Date();
  const { semana: semanaHoy, anio: anioHoy } = getISOWeek(today);

  const [semana, setSemana] = useState(semanaHoy);
  const [anio, setAnio] = useState(anioHoy);
  const [cuotas, setCuotas] = useState<CuotaVentas[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalCuota, setModalCuota] = useState<{ storeId: string; storeName: string; cuotaId?: string; monto: string } | null>(null);
  const [modalVenta, setModalVenta] = useState<{ cuotaId: string; storeName: string } | null>(null);
  const [expandedStore, setExpandedStore] = useState<string | null>(null);
  const [ventaFecha, setVentaFecha] = useState(today.toISOString().slice(0, 10));
  const [ventaMonto, setVentaMonto] = useState("");
  const [ventaEmpleado, setVentaEmpleado] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { inicio, fin } = getWeekRange(semana, anio);

  const fetchCuotas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cuotas?semana=${semana}&anio=${anio}`);
      const data = await res.json();
      setCuotas(data);
    } finally {
      setLoading(false);
    }
  }, [semana, anio]);

  useEffect(() => { fetchCuotas(); }, [fetchCuotas]);

  function prevWeek() {
    if (semana === 1) { setSemana(52); setAnio((a) => a - 1); }
    else setSemana((s) => s - 1);
  }

  function nextWeek() {
    if (semana === 52) { setSemana(1); setAnio((a) => a + 1); }
    else setSemana((s) => s + 1);
  }

  function goToday() {
    setSemana(semanaHoy);
    setAnio(anioHoy);
  }

  // ── Save cuota ──────────────────────────────────────────────────────────────
  async function saveCuota(e: React.FormEvent) {
    e.preventDefault();
    if (!modalCuota) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cuotas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: modalCuota.storeId, semana, anio, monto: modalCuota.monto }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Error al guardar");
      }
      setModalCuota(null);
      await fetchCuotas();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete cuota ────────────────────────────────────────────────────────────
  async function deleteCuota(id: string) {
    if (!confirm("¿Eliminar cuota? También se eliminarán las ventas registradas.")) return;
    await fetch(`/api/cuotas/${id}`, { method: "DELETE" });
    await fetchCuotas();
  }

  // ── Save venta ──────────────────────────────────────────────────────────────
  async function saveVenta(e: React.FormEvent) {
    e.preventDefault();
    if (!modalVenta) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuotaId: modalVenta.cuotaId, fecha: ventaFecha, monto: ventaMonto, empleado: ventaEmpleado }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Error al guardar");
      }
      setModalVenta(null);
      setVentaMonto("");
      setVentaEmpleado("");
      await fetchCuotas();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete venta ────────────────────────────────────────────────────────────
  async function deleteVenta(id: string) {
    if (!confirm("¿Eliminar este registro de venta?")) return;
    await fetch(`/api/ventas/${id}`, { method: "DELETE" });
    await fetchCuotas();
  }

  // ── Build rows: merge stores with their cuota (if any) ─────────────────────
  const rows = stores.map((store) => {
    const cuota = cuotas.find((c) => c.storeId === store.id) ?? null;
    const totalVentas = cuota?.ventas.reduce((s, v) => s + v.monto, 0) ?? 0;
    const pct = cuota ? Math.min((totalVentas / cuota.monto) * 100, 999) : 0;
    return { store, cuota, totalVentas, pct };
  });

  const totalCuota = rows.reduce((s, r) => s + (r.cuota?.monto ?? 0), 0);
  const totalVentas = rows.reduce((s, r) => s + r.totalVentas, 0);
  const pctGlobal = totalCuota > 0 ? Math.min((totalVentas / totalCuota) * 100, 999) : 0;

  function pctColor(p: number) {
    if (p >= 100) return "text-green-700 bg-green-50";
    if (p >= 75) return "text-yellow-700 bg-yellow-50";
    if (p >= 50) return "text-orange-700 bg-orange-50";
    return "text-red-700 bg-red-50";
  }

  function barColor(p: number) {
    if (p >= 100) return "bg-green-500";
    if (p >= 75) return "bg-yellow-400";
    if (p >= 50) return "bg-orange-400";
    return "bg-red-400";
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Cuotas Semanales de Ventas</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestiona metas y registra ventas reales por tienda</p>
      </div>

      {/* Week navigator */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 w-fit">
        <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center min-w-[200px]">
          <p className="text-sm font-semibold text-gray-900">Semana {semana} · {anio}</p>
          <p className="text-xs text-gray-400">{formatDate(inicio)} – {formatDate(fin)}</p>
        </div>
        <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {(semana !== semanaHoy || anio !== anioHoy) && (
          <button onClick={goToday} className="text-xs text-blue-600 hover:underline ml-1">Hoy</button>
        )}
      </div>

      {/* Summary cards */}
      {totalCuota > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cuota total</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatMoney(totalCuota)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ventas reales</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatMoney(totalVentas)}</p>
          </div>
          <div className={`border rounded-xl p-4 ${pctColor(pctGlobal)}`}>
            <p className="text-xs font-medium uppercase tracking-wide">Avance global</p>
            <p className="text-lg font-semibold mt-1">{pctGlobal.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tienda</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Cuota</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ventas reales</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ store, cuota, totalVentas: tv, pct }) => (
                <>
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{store.name}</p>
                      <p className="text-xs text-gray-400">{store.distrito}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-medium">
                      {cuota ? formatMoney(cuota.monto) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {cuota ? formatMoney(tv) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 w-48">
                      {cuota ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${barColor(pct)}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${pctColor(pct)}`}>
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">Sin cuota</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        {cuota ? (
                          <>
                            <button
                              onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}
                              className="text-xs text-gray-500 hover:text-gray-800 font-medium"
                            >
                              {expandedStore === store.id ? "Ocultar" : `Ver ventas (${cuota.ventas.length})`}
                            </button>
                            <button
                              onClick={() => {
                                setError(null);
                                setVentaFecha(today.toISOString().slice(0, 10));
                                setVentaMonto("");
                                setVentaEmpleado("");
                                setModalVenta({ cuotaId: cuota.id, storeName: store.name });
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              + Venta
                            </button>
                            <button
                              onClick={() => {
                                setError(null);
                                setModalCuota({ storeId: store.id, storeName: store.name, cuotaId: cuota.id, monto: String(cuota.monto) });
                              }}
                              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                            >
                              Editar
                            </button>
                            <button onClick={() => deleteCuota(cuota.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setError(null);
                              setModalCuota({ storeId: store.id, storeName: store.name, monto: "" });
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Fijar cuota
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded ventas */}
                  {expandedStore === store.id && cuota && (
                    <tr key={`${store.id}-ventas`}>
                      <td colSpan={5} className="bg-gray-50 px-6 py-3">
                        {cuota.ventas.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Sin ventas registradas esta semana.</p>
                        ) : (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-500">
                                <th className="text-left font-medium pb-1">Fecha</th>
                                <th className="text-right font-medium pb-1">Monto</th>
                                <th className="text-left font-medium pb-1 pl-4">Empleado</th>
                                <th className="text-right font-medium pb-1"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {cuota.ventas.map((v) => (
                                <tr key={v.id}>
                                  <td className="py-1 text-gray-700">
                                    {new Date(v.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", timeZone: "UTC" })}
                                  </td>
                                  <td className="py-1 text-right font-medium text-gray-800">{formatMoney(v.monto)}</td>
                                  <td className="py-1 pl-4 text-gray-500">{v.empleado ?? "—"}</td>
                                  <td className="py-1 text-right">
                                    <button onClick={() => deleteVenta(v.id)} className="text-red-400 hover:text-red-600">✕</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: fijar/editar cuota */}
      {modalCuota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={saveCuota} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-base">
              {modalCuota.cuotaId ? "Editar cuota" : "Fijar cuota"}
            </h2>
            <p className="text-sm text-gray-500">
              {modalCuota.storeName} · Semana {semana}, {anio}
            </p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Monto objetivo (S/)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={modalCuota.monto}
                onChange={(e) => setModalCuota((m) => m ? { ...m, monto: e.target.value } : m)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => { setModalCuota(null); setError(null); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: registrar venta */}
      {modalVenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={saveVenta} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-base">Registrar venta</h2>
            <p className="text-sm text-gray-500">{modalVenta.storeName}</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Fecha</label>
                <input
                  type="date"
                  value={ventaFecha}
                  onChange={(e) => setVentaFecha(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Monto de venta (S/)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ventaMonto}
                  onChange={(e) => setVentaMonto(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Empleado (opcional)</label>
                <input
                  type="text"
                  placeholder="Nombre del empleado"
                  value={ventaEmpleado}
                  onChange={(e) => setVentaEmpleado(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {saving ? "Guardando..." : "Registrar"}
              </button>
              <button
                type="button"
                onClick={() => { setModalVenta(null); setError(null); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

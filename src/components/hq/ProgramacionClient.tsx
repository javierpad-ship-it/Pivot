"use client";

import { useState } from "react";

const DAYS = [
  { value: 1, label: "Lunes", short: "L" },
  { value: 2, label: "Martes", short: "M" },
  { value: 3, label: "Miércoles", short: "Mi" },
  { value: 4, label: "Jueves", short: "J" },
];

interface Store { id: string; name: string; distrito: string; ciudad: string }
interface Brand { id: string; name: string }
interface Mundo { id: string; name: string }
interface Linea { id: string; name: string; mundo: Mundo }
interface Genero { id: string; name: string }
interface ProgramItem {
  id: string;
  dayOfWeek: number;
  scope: "ALL" | "SOME";
  brand: Brand;
  linea: Linea;
  genero: Genero;
  tiendas: { storeId: string; store: Store }[];
}

interface Props {
  stores: Store[];
  brands: Brand[];
  lineas: Linea[];
  generos: Genero[];
  initialItems: ProgramItem[];
}

type Tab = "lista" | "matriz";

export function ProgramacionClient({ stores, brands, lineas, generos, initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<Tab>("lista");
  const [selectedDay, setSelectedDay] = useState(1);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ brandId: "", lineaId: "", generoId: "" });
  const [scope, setScope] = useState<"ALL" | "SOME">("ALL");
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = items.filter((i) => i.dayOfWeek === selectedDay);

  function toggleStore(id: string) {
    setSelectedStores((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleAllStores() {
    setSelectedStores((prev) =>
      prev.length === stores.length ? [] : stores.map((s) => s.id)
    );
  }

  function openForm() {
    setForm({ brandId: "", lineaId: "", generoId: "" });
    setScope("ALL");
    setSelectedStores([]);
    setError(null);
    setShowForm(true);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/programacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          brandId: form.brandId,
          lineaId: form.lineaId,
          generoId: form.generoId,
          scope,
          storeIds: scope === "SOME" ? selectedStores : [],
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setForm({ brandId: "", lineaId: "", generoId: "" });
      setScope("ALL");
      setSelectedStores([]);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al agregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este ítem de la programación?")) return;
    await fetch(`/api/programacion/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Día</label>
          <div className="flex gap-1">
            {DAYS.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDay(d.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDay === d.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setTab("lista")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "lista" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setTab("matriz")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "matriz" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Matriz
          </button>
        </div>
      </div>

      {/* ---- LISTA VIEW ---- */}
      {tab === "lista" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {DAYS.find((d) => d.value === selectedDay)?.label}
              <span className="ml-2 text-gray-400">({filtered.length} ítems)</span>
            </p>
            <button
              onClick={openForm}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar ítem
            </button>
          </div>

          {/* Add form */}
          {showForm && (
            <form onSubmit={handleAdd} className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
              <p className="text-sm font-medium text-blue-800">
                Nuevo ítem — {DAYS.find((d) => d.value === selectedDay)?.label}
              </p>

              {/* Brand / Linea / Genero */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Marca</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                    required
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar…</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Línea (Mundo)</label>
                  <select
                    value={form.lineaId}
                    onChange={(e) => setForm((f) => ({ ...f, lineaId: e.target.value }))}
                    required
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar…</option>
                    {lineas.map((l) => (
                      <option key={l.id} value={l.id}>{l.mundo.name} / {l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Género</label>
                  <select
                    value={form.generoId}
                    onChange={(e) => setForm((f) => ({ ...f, generoId: e.target.value }))}
                    required
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar…</option>
                    {generos.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Scope selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600">Aplica a</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScope("ALL")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      scope === "ALL"
                        ? "bg-green-50 border-green-400 text-green-800"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Todas las tiendas
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("SOME")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      scope === "SOME"
                        ? "bg-blue-50 border-blue-400 text-blue-800"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Tiendas específicas
                  </button>
                </div>
              </div>

              {/* Store checklist (when scope = SOME) */}
              {scope === "SOME" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">
                      Seleccionar tiendas ({selectedStores.length}/{stores.length})
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllStores}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {selectedStores.length === stores.length ? "Deseleccionar todas" : "Seleccionar todas"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                    {stores.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(s.id)}
                          onChange={() => toggleStore(s.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{s.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{s.distrito}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Items table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Marca</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mundo / Línea</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Género</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Aplica a</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No hay ítems programados para este día
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.brand.name}</td>
                      <td className="px-4 py-3 text-gray-700">
                        <span className="text-xs text-gray-400">{item.linea.mundo.name} /</span> {item.linea.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {item.genero.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.scope === "ALL" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Todas las tiendas
                          </span>
                        ) : (
                          <span
                            title={item.tiendas.map((t) => t.store.name).join(", ")}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-default"
                          >
                            {item.tiendas.length} tienda{item.tiendas.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ---- MATRIX VIEW ---- */}
      {tab === "matriz" && (
        <MatrizView items={filtered} stores={stores} dayLabel={DAYS.find((d) => d.value === selectedDay)?.label ?? ""} />
      )}
    </div>
  );
}

// ---- Matrix sub-component ----

interface MatrizProps {
  items: ProgramItem[];
  stores: Store[];
  dayLabel: string;
}

function MatrizView({ items, stores, dayLabel }: MatrizProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-400 text-sm">
        No hay ítems programados para {dayLabel}
      </div>
    );
  }

  // ALL-scope items apply to every store
  const allItems = items.filter((i) => i.scope === "ALL");
  // SOME-scope items apply to specific stores
  const someItems = items.filter((i) => i.scope === "SOME");

  // For a given store + item, determine if it's assigned
  function isAssigned(storeId: string, item: ProgramItem): boolean {
    if (item.scope === "ALL") return true;
    return item.tiendas.some((t) => t.storeId === storeId);
  }

  const columns = [...allItems, ...someItems];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="text-xs border-collapse min-w-full">
        <thead>
          {/* Scope group headers */}
          {allItems.length > 0 && someItems.length > 0 && (
            <tr className="bg-gray-50">
              <th className="border-b border-r border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 min-w-[140px]">
                Tienda
              </th>
              {allItems.length > 0 && (
                <th
                  colSpan={allItems.length}
                  className="border-b border-r border-gray-200 px-3 py-2 text-center font-medium text-green-700 bg-green-50"
                >
                  Para todas las tiendas ({allItems.length})
                </th>
              )}
              {someItems.length > 0 && (
                <th
                  colSpan={someItems.length}
                  className="border-b border-gray-200 px-3 py-2 text-center font-medium text-blue-700 bg-blue-50"
                >
                  Tiendas específicas ({someItems.length})
                </th>
              )}
            </tr>
          )}
          {/* Column headers */}
          <tr className="bg-gray-50">
            <th className="border-b border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600 min-w-[140px]">
              Tienda
            </th>
            {columns.map((col, i) => (
              <th
                key={col.id}
                className={`border-b border-gray-200 px-2 py-2 text-center font-medium text-gray-600 min-w-[90px] ${
                  i < allItems.length - 1 ? "" : i === allItems.length - 1 && someItems.length > 0 ? "border-r border-gray-300" : ""
                }`}
              >
                <div className="font-semibold text-gray-800 truncate max-w-[88px]" title={col.brand.name}>
                  {col.brand.name}
                </div>
                <div className="text-gray-400 truncate max-w-[88px]" title={`${col.linea.mundo.name} / ${col.linea.name}`}>
                  {col.linea.mundo.name} / {col.linea.name}
                </div>
                <div className="text-purple-600 truncate max-w-[88px]" title={col.genero.name}>
                  {col.genero.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stores.map((store) => {
            const rowTotal = columns.filter((col) => isAssigned(store.id, col)).length;
            return (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="border-r border-gray-200 px-3 py-2.5 font-medium text-gray-800">
                  <div>{store.name}</div>
                  <div className="text-gray-400 font-normal">{store.distrito}</div>
                </td>
                {columns.map((col, i) => {
                  const assigned = isAssigned(store.id, col);
                  return (
                    <td
                      key={col.id}
                      className={`px-2 py-2.5 text-center ${
                        i === allItems.length - 1 && someItems.length > 0 ? "border-r border-gray-300" : ""
                      } ${assigned ? "bg-green-50" : ""}`}
                    >
                      {assigned ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-200 text-green-800">
                          ✓
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {/* Summary row */}
          <tr className="bg-gray-50 font-medium">
            <td className="border-r border-gray-200 px-3 py-2 text-gray-600">Total tiendas</td>
            {columns.map((col, i) => {
              const count = stores.filter((s) => isAssigned(s.id, col)).length;
              return (
                <td
                  key={col.id}
                  className={`px-2 py-2 text-center text-gray-700 ${
                    i === allItems.length - 1 && someItems.length > 0 ? "border-r border-gray-300" : ""
                  }`}
                >
                  {count}/{stores.length}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

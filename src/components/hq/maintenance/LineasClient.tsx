"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Mundo { id: string; name: string }
interface Linea { id: string; name: string; mundoId: string; mundo: Mundo }

interface Props {
  lineas: Linea[];
  mundos: Mundo[];
}

export function LineasClient({ lineas, mundos }: Props) {
  const router = useRouter();
  const [data, setData] = useState(lineas);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mundoId, setMundoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"mundo" | "name" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: "mundo" | "name") {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const va = sortKey === "mundo" ? a.mundo.name : a.name;
        const vb = sortKey === "mundo" ? b.mundo.name : b.name;
        const cmp = va.localeCompare(vb, "es", { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  function openAdd() {
    setEditId(null); setName(""); setMundoId(""); setError(null); setShowForm(true);
  }

  function openEdit(l: Linea) {
    setEditId(l.id); setName(l.name); setMundoId(l.mundoId); setError(null); setShowForm(true);
  }

  function closeForm() {
    setShowForm(false); setEditId(null); setName(""); setMundoId(""); setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (editId) {
        const res = await fetch(`/api/lineas/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, mundoId }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated = await res.json();
        setData((d) => d.map((l) => (l.id === editId ? updated : l)));
      } else {
        const res = await fetch("/api/lineas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, mundoId }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created = await res.json();
        setData((d) => [...d, created]);
      }
      closeForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Confirmar eliminación?")) return;
    const res = await fetch(`/api/lineas/${id}`, { method: "DELETE" });
    if (!res.ok) { alert((await res.json()).error); return; }
    setData((d) => d.filter((l) => l.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="font-medium text-blue-800 text-sm">{editId ? "Editar línea" : "Nueva línea"}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="Ej: Ropa Hombre"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Mundo</label>
              <select value={mundoId} onChange={(e) => setMundoId(e.target.value)} required
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar mundo...</option>
                {mundos.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={closeForm}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {(["mundo", "name"] as const).map((key) => (
                <th key={key} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <button
                    onClick={() => handleSort(key)}
                    className="inline-flex items-center gap-1 hover:text-gray-800 transition-colors"
                  >
                    {key === "mundo" ? "Mundo" : "Línea"}
                    <span className="text-gray-300">
                      {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">No hay líneas registradas</td></tr>
            ) : (
              sortedData.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {l.mundo.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{l.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(l)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button onClick={() => handleDelete(l.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

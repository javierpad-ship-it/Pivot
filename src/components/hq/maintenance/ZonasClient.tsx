"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Store { id: string; name: string; distrito: string; ciudad: string }
interface Zona { id: string; name: string; stores: Store[] }

interface Props {
  zonas: Zona[];
  stores: Store[];
}

export function ZonasClient({ zonas, stores }: Props) {
  const router = useRouter();
  const [data, setData] = useState(zonas);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAdd() {
    setEditId(null); setName(""); setSelectedStoreIds([]); setError(null); setShowForm(true);
  }

  function openEdit(z: Zona) {
    setEditId(z.id); setName(z.name);
    setSelectedStoreIds(z.stores.map((s) => s.id));
    setError(null); setShowForm(true);
  }

  function closeForm() {
    setShowForm(false); setEditId(null); setName(""); setSelectedStoreIds([]); setError(null);
  }

  function toggleStore(id: string) {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (editId) {
        const res = await fetch(`/api/zonas/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, storeIds: selectedStoreIds }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated = await res.json();
        setData((d) => d.map((z) => (z.id === editId ? updated : z)));
      } else {
        const res = await fetch("/api/zonas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created = await res.json();
        // Assign stores if any selected
        if (selectedStoreIds.length > 0) {
          const res2 = await fetch(`/api/zonas/${created.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeIds: selectedStoreIds }),
          });
          const updated = await res2.json();
          setData((d) => [...d, updated].sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          setData((d) => [...d, created].sort((a, b) => a.name.localeCompare(b.name)));
        }
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
    if (!confirm("¿Confirmar eliminación? Las tiendas asignadas quedarán sin zona.")) return;
    const res = await fetch(`/api/zonas/${id}`, { method: "DELETE" });
    if (!res.ok) { alert((await res.json()).error); return; }
    setData((d) => d.filter((z) => z.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Zona
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="font-medium text-blue-800 text-sm">{editId ? "Editar zona" : "Nueva zona"}</p>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Nombre de la zona</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Ej: Zona Norte"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600">Tiendas en esta zona</label>
            {stores.length === 0 ? (
              <p className="text-xs text-gray-400">No hay tiendas registradas</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {stores.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStoreIds.includes(s.id)}
                      onChange={() => toggleStore(s.id)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-gray-700">{s.name}</span>
                  </label>
                ))}
              </div>
            )}
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Zona</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tiendas</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">No hay zonas registradas</td></tr>
            ) : (
              data.map((z) => (
                <tr key={z.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{z.name}</td>
                  <td className="px-4 py-3">
                    {z.stores.length === 0 ? (
                      <span className="text-gray-400 text-xs">Sin tiendas asignadas</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {z.stores.map((s) => (
                          <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(z)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button onClick={() => handleDelete(z.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Eliminar</button>
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

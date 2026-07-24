"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { NIVEL_LABELS, NIVEL_BADGE_VARIANT } from "@/lib/membresia-lk-constants";

interface Store {
  id: string;
  name: string;
}

interface Cliente {
  id: string;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  storeId: string | null;
  puntos: number;
  nivel: string;
  activo: boolean;
  store: Store | null;
}

interface Props {
  clientes: Cliente[];
  stores: Store[];
  fixedStoreId: string | null;
}

const EMPTY_FORM = { nombre: "", dni: "", telefono: "", storeId: "" };

export function MembresiaClient({ clientes, stores, fixedStoreId }: Props) {
  const router = useRouter();
  const [data, setData] = useState(clientes);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = data.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.dni ?? "").toLowerCase().includes(q) ||
      (c.telefono ?? "").toLowerCase().includes(q)
    );
  });

  function openAdd() {
    setForm({ ...EMPTY_FORM, storeId: fixedStoreId ?? "" });
    setEditId(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(c: Cliente) {
    setForm({ nombre: c.nombre, dni: c.dni ?? "", telefono: c.telefono ?? "", storeId: c.storeId ?? "" });
    setEditId(c.id);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = {
        nombre: form.nombre,
        dni: form.dni,
        telefono: form.telefono,
        storeId: fixedStoreId ?? form.storeId,
      };
      if (editId) {
        const res = await fetch(`/api/membresia-lk/clientes/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated = await res.json();
        setData((d) => d.map((c) => (c.id === editId ? updated : c)));
      } else {
        const res = await fetch("/api/membresia-lk/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created = await res.json();
        setData((d) => [created, ...d]);
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
    if (!confirm("¿Confirmar eliminación del cliente?")) return;
    try {
      const res = await fetch(`/api/membresia-lk/clientes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setData((d) => d.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o teléfono..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={openAdd} size="sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo cliente
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="font-medium text-blue-800 text-sm">{editId ? "Editar cliente" : "Nuevo cliente"}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Nombre"
              placeholder="Ej: Juana Pérez"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
            />
            <Input
              label="DNI"
              placeholder="Ej: 12345678"
              value={form.dni}
              onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
            />
            <Input
              label="Teléfono"
              placeholder="Ej: 987654321"
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
            />
            {!fixedStoreId && (
              <Select
                label="Tienda de registro"
                placeholder="Sin tienda"
                options={storeOptions}
                value={form.storeId}
                onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))}
              />
            )}
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={loading}>Guardar</Button>
            <Button type="button" variant="secondary" size="sm" onClick={closeForm}>Cancelar</Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">DNI</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</th>
              {!fixedStoreId && (
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tienda</th>
              )}
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nivel</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Puntos</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={fixedStoreId ? 6 : 7} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No hay clientes registrados
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/membresia-lk/${c.id}`)}
                      className="font-medium text-blue-600 hover:text-blue-800 text-left"
                    >
                      {c.nombre}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.dni ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{c.telefono ?? "—"}</td>
                  {!fixedStoreId && (
                    <td className="px-4 py-3 text-gray-700">{c.store?.name ?? "—"}</td>
                  )}
                  <td className="px-4 py-3">
                    <Badge variant={NIVEL_BADGE_VARIANT[c.nivel] ?? "gray"}>
                      {NIVEL_LABELS[c.nivel] ?? c.nivel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{c.puntos}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Eliminar
                      </button>
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

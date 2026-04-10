"use client";

import { useState } from "react";

type Rol = "SUPER_ADMIN" | "ADMIN" | "PROGRAMADOR" | "GERENTE_ZONAL" | "TIENDA";

const ROL_LABEL: Record<Rol, string> = {
  SUPER_ADMIN:   "Super Admin",
  ADMIN:         "Administrador",
  PROGRAMADOR:   "Programador",
  GERENTE_ZONAL: "Gerente Zonal",
  TIENDA:        "Tienda",
};

const ROL_COLOR: Record<Rol, string> = {
  SUPER_ADMIN:   "bg-red-100 text-red-800",
  ADMIN:         "bg-orange-100 text-orange-800",
  PROGRAMADOR:   "bg-blue-100 text-blue-800",
  GERENTE_ZONAL: "bg-purple-100 text-purple-800",
  TIENDA:        "bg-green-100 text-green-800",
};

const ROL_OPTIONS: Rol[] = ["SUPER_ADMIN", "ADMIN", "PROGRAMADOR", "GERENTE_ZONAL", "TIENDA"];

interface Store { id: string; name: string }
interface Zona  { id: string; name: string }
interface Usuario {
  id: string; nombre: string; username: string; rol: string; activo: boolean;
  store: Store | null; zona: Zona | null;
}

interface Props {
  initialUsuarios: Usuario[];
  stores: Store[];
  zonas: Zona[];
}

const emptyForm = { nombre: "", username: "", rol: "TIENDA" as Rol, storeId: "", zonaId: "" };

export function UsuariosClient({ initialUsuarios, stores, zonas }: Props) {
  const [usuarios, setUsuarios]   = useState(initialUsuarios);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [resetId, setResetId]     = useState<string | null>(null); // ID pending confirm
  const [resetting, setResetting] = useState(false);
  const [filterRol, setFilterRol] = useState<string>("");

  const filtered = filterRol ? usuarios.filter((u) => u.rol === filterRol) : usuarios;

  function openForm() {
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsuarios((prev) => [...prev, data]);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActivo(usuario: Usuario) {
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !usuario.activo }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsuarios((prev) => prev.map((u) => u.id === usuario.id ? { ...u, activo: updated.activo } : u));
    }
  }

  async function confirmReset() {
    if (!resetId) return;
    setResetting(true);
    await fetch(`/api/usuarios/${resetId}/reset-password`, { method: "PATCH" });
    setResetting(false);
    setResetId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este usuario?")) return;
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    if (res.ok) setUsuarios((prev) => prev.filter((u) => u.id !== id));
    else {
      const data = await res.json();
      alert(data.error);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los roles</option>
          {ROL_OPTIONS.map((r) => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} usuario{filtered.length !== 1 ? "s" : ""}</span>
        <button
          onClick={openForm}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
          <p className="text-sm font-semibold text-blue-800 mb-4">Nuevo usuario</p>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  required placeholder="Nombre completo"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, "") }))}
                  required placeholder="ej. jperez"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value as Rol, storeId: "", zonaId: "" }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROL_OPTIONS.map((r) => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
                </select>
              </div>
              {form.rol === "TIENDA" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tienda</label>
                  <select
                    value={form.storeId}
                    onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tienda…</option>
                    {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {form.rol === "GERENTE_ZONAL" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Zona</label>
                  <select
                    value={form.zonaId}
                    onChange={(e) => setForm((f) => ({ ...f, zonaId: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar zona…</option>
                    {zonas.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Contraseña inicial:{" "}
              <span className="font-mono font-semibold text-gray-700">
                {form.rol === "SUPER_ADMIN" ? "220922" : "1234"}
              </span>
            </p>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? "Creando…" : "Crear usuario"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset password confirm */}
      {resetId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-2">Resetear contraseña</h3>
            <p className="text-sm text-gray-600 mb-5">
              La contraseña se cambiará a <span className="font-mono font-bold">1234</span>. ¿Confirmas?
            </p>
            <div className="flex gap-3">
              <button onClick={confirmReset} disabled={resetting}
                className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                {resetting ? "Reseteando…" : "Sí, resetear"}
              </button>
              <button onClick={() => setResetId(null)}
                className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Asignado a</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No hay usuarios</td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className={`hover:bg-gray-50 ${!u.activo ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{u.nombre}</p>
                  <p className="text-xs text-gray-400 font-mono">{u.username}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROL_COLOR[u.rol as Rol]}`}>
                    {ROL_LABEL[u.rol as Rol] ?? u.rol}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs hidden sm:table-cell">
                  {u.store?.name ?? u.zona?.name ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActivo(u)}
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setResetId(u.id)}
                      className="text-xs text-amber-600 hover:text-amber-800 font-medium">
                      Resetear clave
                    </button>
                    {u.rol !== "SUPER_ADMIN" && (
                      <button onClick={() => handleDelete(u.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium">
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

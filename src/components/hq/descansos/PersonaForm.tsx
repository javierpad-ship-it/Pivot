"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROL_PERSONAL_OPTIONS } from "@/lib/descansos-constants";

interface Store { id: string; name: string }

interface PersonaData {
  id: string;
  codigo: string;
  nombreCompleto: string;
  tiendaBaseId: string | null;
  activo: boolean;
  roles: string[];
  elegibilidades: string[];
}

interface Props {
  persona: PersonaData | null;
  stores: Store[];
}

export function PersonaForm({ persona, stores }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: persona?.codigo ?? "",
    nombreCompleto: persona?.nombreCompleto ?? "",
    tiendaBaseId: persona?.tiendaBaseId ?? "",
    activo: persona?.activo ?? true,
  });
  const [roles, setRoles] = useState<string[]>(persona?.roles ?? []);
  const [elegibilidades, setElegibilidades] = useState<string[]>(persona?.elegibilidades ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(rol: string) {
    setRoles((prev) => prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]);
  }

  function toggleElegibilidad(rol: string) {
    setElegibilidades((prev) => prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = persona ? `/api/descansos/personas/${persona.id}` : "/api/descansos/personas";
      const method = persona ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tiendaBaseId: form.tiendaBaseId || null, roles, elegibilidades }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al guardar");
      router.push("/hq/descansos/personal");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos básicos */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Datos del colaborador</h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Código de empleado *</label>
          <input required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="EJ001" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
          <input required value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan García López" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tienda base</label>
          <select value={form.tiendaBaseId} onChange={(e) => setForm({ ...form, tiendaBaseId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Sin tienda base —</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="activo" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            className="rounded border-gray-300 text-blue-600" />
          <label htmlFor="activo" className="text-sm text-gray-700">Colaborador activo</label>
        </div>
      </div>

      {/* Roles */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Roles que desempeña</h2>
        <div className="grid grid-cols-2 gap-2">
          {ROL_PERSONAL_OPTIONS.map((opt) => (
            <label key={opt.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
              roles.includes(opt.value) ? "bg-teal-50 border-teal-300 text-teal-800" : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input type="checkbox" className="sr-only" checked={roles.includes(opt.value)} onChange={() => toggleRole(opt.value)} />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                roles.includes(opt.value) ? "bg-teal-600 border-teal-600" : "border-gray-300"
              }`}>
                {roles.includes(opt.value) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
              </div>
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Elegibilidades de cobertura */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Puede cubrir estos roles</h2>
        <p className="text-xs text-gray-400 mb-3">Matriz de elegibilidad para asignación de cobertura</p>
        <div className="grid grid-cols-2 gap-2">
          {ROL_PERSONAL_OPTIONS.map((opt) => (
            <label key={opt.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
              elegibilidades.includes(opt.value) ? "bg-blue-50 border-blue-300 text-blue-800" : "border-gray-200 hover:bg-gray-50"
            }`}>
              <input type="checkbox" className="sr-only" checked={elegibilidades.includes(opt.value)} onChange={() => toggleElegibilidad(opt.value)} />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                elegibilidades.includes(opt.value) ? "bg-blue-600 border-blue-600" : "border-gray-300"
              }`}>
                {elegibilidades.includes(opt.value) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
              </div>
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? "Guardando…" : persona ? "Guardar cambios" : "Crear colaborador"}
        </button>
      </div>
    </form>
  );
}

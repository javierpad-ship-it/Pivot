"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  zonas: { id: string; name: string }[];
  usuarioId: string;
}

export function NuevaProgramacionForm({ zonas, usuarioId }: Props) {
  const router = useRouter();
  const [zonaId, setZonaId] = useState(zonas[0]?.id ?? "");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFin, setPeriodoFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!periodoInicio || !periodoFin) { setError("Selecciona el período."); return; }
    if (periodoFin < periodoInicio) { setError("La fecha fin debe ser mayor a la fecha inicio."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/descansos/programaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zonaId, periodoInicio, periodoFin, creadoPorId: usuarioId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al crear");
      const data = await res.json();
      router.push(`/hq/descansos/programar/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Zona *</label>
        <select required value={zonaId} onChange={(e) => setZonaId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {zonas.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
          <input type="date" required value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
          <input type="date" required value={periodoFin} onChange={(e) => setPeriodoFin(e.target.value)}
            min={periodoInicio}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? "Creando…" : "Crear y continuar →"}
        </button>
      </div>
    </form>
  );
}

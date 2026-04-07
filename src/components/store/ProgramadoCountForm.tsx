"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  storeId: string;
  storeName: string;
  brandId: string;
  brandName: string;
  lineaId: string;
  lineaName: string;
  mundoName: string;
  generoId: string;
  generoName: string;
  fecha: string;
  existingCantidad: number | null;
  existingEmpleado: string | null;
}

export function ProgramadoCountForm(props: Props) {
  const router = useRouter();
  const [cantidad, setCantidad] = useState(props.existingCantidad?.toString() ?? "");
  const [empleado, setEmpleado] = useState(props.existingEmpleado ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/conteo-registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: props.storeId,
          brandId: props.brandId,
          lineaId: props.lineaId,
          generoId: props.generoId,
          fecha: props.fecha,
          cantidad: parseInt(cantidad),
          empleado: empleado.trim(),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDone(true);
      setTimeout(() => { window.location.href = `/store/${props.storeId}`; }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  const fechaDisplay = new Date(props.fecha + "T12:00:00").toLocaleDateString("es", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900">¡Conteo guardado!</p>
        <p className="text-sm text-gray-500 mt-1">Volviendo a la tienda…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 py-4 mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Registrar Conteo</h1>
          <p className="text-sm text-gray-500">{props.storeName}</p>
        </div>
      </div>

      {/* Product info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Marca</p>
            <p className="font-semibold text-gray-900">{props.brandName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Género</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {props.generoName}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mundo / Línea</p>
            <p className="text-gray-700"><span className="text-gray-400 text-xs">{props.mundoName} /</span> {props.lineaName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Fecha</p>
            <p className="text-gray-700 text-xs">{fechaDisplay}</p>
          </div>
        </div>
      </div>

      {props.existingCantidad !== null && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 text-sm text-yellow-800">
          Ya existe un conteo para esta fecha. Puedes actualizarlo.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad contada</label>
          <input
            type="number"
            min="0"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
            placeholder="0"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del empleado</label>
          <input
            type="text"
            value={empleado}
            onChange={(e) => setEmpleado(e.target.value)}
            required
            placeholder="Ej: Juan García"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando…" : "Guardar Conteo"}
        </button>
      </form>
    </div>
  );
}

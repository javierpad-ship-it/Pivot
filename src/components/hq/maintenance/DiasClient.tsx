"use client";

import { useState } from "react";

interface Dia {
  dayOfWeek: number;
  name: string;
  enabled: boolean;
}

export function DiasClient({ initialDias }: { initialDias: Dia[] }) {
  const [dias, setDias] = useState(initialDias);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(dayOfWeek: number, enabled: boolean) {
    setLoading(dayOfWeek);
    setError(null);
    try {
      const res = await fetch(`/api/config-dias/${dayOfWeek}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setDias((prev) => prev.map((d) => d.dayOfWeek === dayOfWeek ? { ...d, enabled } : d));
    } catch {
      setError("No se pudo actualizar. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  const enabledCount = dias.filter((d) => d.enabled).length;

  return (
    <div className="max-w-sm">
      <p className="text-sm text-gray-500 mb-4">
        {enabledCount === 0
          ? "Ningún día habilitado — no se generarán conteos."
          : `${enabledCount} día${enabledCount > 1 ? "s" : ""} habilitado${enabledCount > 1 ? "s" : ""} para conteos.`}
      </p>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        {dias.map((dia) => (
          <div key={dia.dayOfWeek} className="flex items-center justify-between px-5 py-4">
            <span className="font-medium text-gray-900">{dia.name}</span>
            <button
              onClick={() => toggle(dia.dayOfWeek, !dia.enabled)}
              disabled={loading === dia.dayOfWeek}
              aria-checked={dia.enabled}
              role="switch"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                dia.enabled ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  dia.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScanCounter } from "./ScanCounter";

interface Props { taskId: string; storeId: string }

type Mode = "manual" | "scan";

export function CountForm({ taskId, storeId }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("manual");
  const [quantity, setQuantity] = useState("");
  const [scanCount, setScanCount] = useState(0);
  const [employeeName, setEmployeeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const now = new Date().toLocaleString("es");
  const finalQuantity = mode === "scan" ? scanCount : parseInt(quantity, 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isNaN(finalQuantity) || finalQuantity < 0) {
      setError("Ingresa una cantidad válida (0 o más).");
      return;
    }
    if (!employeeName.trim()) { setError("Ingresa el nombre del empleado."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/count-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, quantity: finalQuantity, employeeName: employeeName.trim() }),
      });
      if (res.status === 409) { setError("Este conteo ya fue registrado anteriormente."); return; }
      if (!res.ok) { setError((await res.json()).error ?? "Error al enviar."); return; }
      setSuccess(true);
      setTimeout(() => router.push(`/store/${storeId}`), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-green-800">¡Conteo Enviado!</h2>
        <p className="text-green-600 mt-2 text-sm">Regresando a la lista de tareas…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "manual"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Manual
        </button>
        <button
          type="button"
          onClick={() => setMode("scan")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "scan"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H2a2 2 0 00-2 2v10a2 2 0 002 2h3m3-6H3" />
          </svg>
          Escáner
        </button>
      </div>

      {mode === "manual" ? (
        <Input id="quantity" label="Cantidad Contada" type="number" inputMode="numeric" min="0"
          placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)}
          className="text-2xl py-4 text-center font-bold" />
      ) : (
        <ScanCounter count={scanCount} onChange={setScanCount} />
      )}

      <Input id="employee" label="Nombre del Empleado" type="text"
        placeholder="Ingresa tu nombre" value={employeeName}
        onChange={(e) => setEmployeeName(e.target.value)} autoComplete="name" />

      <div className="bg-gray-100 rounded-lg px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Se registrará como: <strong>{now}</strong></span>
      </div>

      {mode === "scan" && scanCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Se enviará un total de <strong className="ml-1">{scanCount} unidades</strong>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button
        type="submit"
        loading={loading}
        size="lg"
        className="w-full mt-4"
        disabled={mode === "scan" && scanCount === 0}
      >
        {mode === "scan" ? `Enviar Conteo (${scanCount} uds.)` : "Enviar Conteo"}
      </Button>
    </form>
  );
}

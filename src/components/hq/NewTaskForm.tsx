"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface Store { id: string; name: string; distrito: string; ciudad: string }
interface Brand { id: string; name: string }
interface Mundo { id: string; name: string }
interface Linea { id: string; name: string; mundoId: string; mundo: Mundo }

interface Props {
  stores: Store[];
  brands: Brand[];
  lineas: Linea[];
}

export function NewTaskForm({ stores, brands, lineas }: Props) {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [mundoId, setMundoId] = useState("");
  const [lineaId, setLineaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mundos = Array.from(new Map(lineas.map((l) => [l.mundoId, l.mundo])).values());
  const filteredLineas = mundoId ? lineas.filter((l) => l.mundoId === mundoId) : lineas;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!storeId || !brandId || !lineaId) {
      setError("Por favor selecciona tienda, marca y línea.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, brandId, lineaId }),
      });
      if (res.status === 409) {
        setError("Ya existe una tarea para esta combinación de tienda, marca y línea.");
        return;
      }
      if (!res.ok) {
        setError((await res.json()).error ?? "Error al crear la tarea.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/hq/tasks"), 1500);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardBody className="py-10 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900">Tarea Creada</p>
          <p className="text-sm text-gray-500 mt-1">Redirigiendo a la lista de tareas…</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select id="store" label="Tienda" placeholder="Selecciona una tienda…"
            value={storeId} onChange={(e) => setStoreId(e.target.value)}
            options={stores.map((s) => ({ value: s.id, label: `${s.name} — ${s.ciudad}` }))} />

          <Select id="brand" label="Marca" placeholder="Selecciona una marca…"
            value={brandId} onChange={(e) => setBrandId(e.target.value)}
            options={brands.map((b) => ({ value: b.id, label: b.name }))} />

          <Select id="mundo" label="Mundo" placeholder="Selecciona un mundo…"
            value={mundoId}
            onChange={(e) => { setMundoId(e.target.value); setLineaId(""); }}
            options={mundos.map((m) => ({ value: m.id, label: m.name }))} />

          <Select id="linea" label="Línea" placeholder="Selecciona una línea…"
            value={lineaId} onChange={(e) => setLineaId(e.target.value)}
            options={filteredLineas.map((l) => ({ value: l.id, label: l.name }))} />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">Crear Tarea</Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/hq/tasks")}>Cancelar</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

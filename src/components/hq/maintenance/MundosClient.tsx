"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CrudTable } from "./CrudTable";

interface Linea { id: string; name: string }
interface Mundo { id: string; name: string; lineas: Linea[] }

export function MundosClient({ mundos }: { mundos: Mundo[] }) {
  const router = useRouter();
  const [data, setData] = useState(mundos);

  async function handleSave(id: string | null, form: Record<string, string>) {
    if (id) {
      const res = await fetch(`/api/mundos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setData((d) => d.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    } else {
      const res = await fetch("/api/mundos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setData((d) => [...d, { ...created, lineas: [] }].sort((a, b) => a.name.localeCompare(b.name)));
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/mundos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json()).error);
    setData((d) => d.filter((m) => m.id !== id));
  }

  return (
    <CrudTable
      columns={[
        { key: "name", label: "Nombre" },
        { key: "lineasCount", label: "Líneas" },
      ]}
      rows={data.map((m) => ({
        id: m.id,
        name: m.name,
        lineasCount: String(m.lineas.length),
      }))}
      formFields={[{ key: "name", label: "Nombre", placeholder: "Ej: Moda" }]}
      onSave={handleSave}
      onDelete={handleDelete}
      emptyText="No hay mundos registrados"
    />
  );
}

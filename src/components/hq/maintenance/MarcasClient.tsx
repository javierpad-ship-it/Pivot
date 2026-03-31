"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CrudTable } from "./CrudTable";

interface Marca { id: string; name: string }

export function MarcasClient({ marcas }: { marcas: Marca[] }) {
  const router = useRouter();
  const [data, setData] = useState(marcas);

  async function handleSave(id: string | null, form: Record<string, string>) {
    if (id) {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setData((d) => d.map((m) => (m.id === id ? updated : m)));
    } else {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setData((d) => [...d, created].sort((a, b) => a.name.localeCompare(b.name)));
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json()).error);
    setData((d) => d.filter((m) => m.id !== id));
  }

  return (
    <CrudTable
      columns={[{ key: "name", label: "Nombre" }]}
      rows={data.map((m) => ({ id: m.id, name: m.name }))}
      formFields={[{ key: "name", label: "Nombre", placeholder: "Ej: Nike" }]}
      onSave={handleSave}
      onDelete={handleDelete}
      emptyText="No hay marcas registradas"
    />
  );
}

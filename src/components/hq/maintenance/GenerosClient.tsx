"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CrudTable } from "./CrudTable";

interface Genero { id: string; name: string; _count: { programaciones: number } }

export function GenerosClient({ generos }: { generos: Genero[] }) {
  const router = useRouter();
  const [data, setData] = useState(generos);

  async function handleSave(id: string | null, form: Record<string, string>) {
    if (id) {
      const res = await fetch(`/api/generos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setData((d) => d.map((g) => (g.id === id ? { ...updated, _count: { programaciones: g._count.programaciones } } : g)));
    } else {
      const res = await fetch("/api/generos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setData((d) => [...d, { ...created, _count: { programaciones: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/generos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json()).error);
    setData((d) => d.filter((g) => g.id !== id));
  }

  return (
    <CrudTable
      columns={[
        { key: "name", label: "Nombre" },
        { key: "programaciones", label: "En programación" },
      ]}
      rows={data.map((g) => ({
        id: g.id,
        name: g.name,
        programaciones: String(g._count.programaciones),
      }))}
      formFields={[{ key: "name", label: "Nombre", placeholder: "Ej: Hombre" }]}
      onSave={handleSave}
      onDelete={handleDelete}
      emptyText="No hay géneros registrados"
    />
  );
}

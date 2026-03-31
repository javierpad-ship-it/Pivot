"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CrudTable } from "./CrudTable";

interface Tienda { id: string; name: string; location: string }

export function TiendasClient({ tiendas }: { tiendas: Tienda[] }) {
  const router = useRouter();
  const [data, setData] = useState(tiendas);

  async function handleSave(id: string | null, form: Record<string, string>) {
    if (id) {
      const res = await fetch(`/api/stores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, location: form.location }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setData((d) => d.map((t) => (t.id === id ? updated : t)));
    } else {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, location: form.location }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setData((d) => [...d, created].sort((a, b) => a.name.localeCompare(b.name)));
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/stores/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json()).error);
    setData((d) => d.filter((t) => t.id !== id));
  }

  return (
    <CrudTable
      columns={[
        { key: "name", label: "Nombre" },
        { key: "location", label: "Ubicación" },
      ]}
      rows={data.map((t) => ({ id: t.id, name: t.name, location: t.location }))}
      formFields={[
        { key: "name", label: "Nombre", placeholder: "Ej: Tienda Centro" },
        { key: "location", label: "Ubicación", placeholder: "Ej: Ciudad de México" },
      ]}
      onSave={handleSave}
      onDelete={handleDelete}
      emptyText="No hay tiendas registradas"
    />
  );
}

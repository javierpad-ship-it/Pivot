"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CrudTable } from "./CrudTable";

interface Empresa { id: string; name: string; storeCount: number }

export function EmpresasClient({ empresas }: { empresas: Empresa[] }) {
  const router = useRouter();
  const [data, setData] = useState(empresas);

  async function handleSave(id: string | null, form: Record<string, string>) {
    if (id) {
      const res = await fetch(`/api/empresas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setData((d) => d.map((e) => (e.id === id ? { ...e, name: updated.name } : e)));
    } else {
      const res = await fetch("/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created = await res.json();
      setData((d) => [...d, { ...created, storeCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/empresas/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json()).error);
    setData((d) => d.filter((e) => e.id !== id));
  }

  return (
    <CrudTable
      columns={[
        { key: "name", label: "Nombre" },
        { key: "storeCount", label: "Tiendas" },
      ]}
      rows={data.map((e) => ({ id: e.id, name: e.name, storeCount: String(e.storeCount) }))}
      formFields={[{ key: "name", label: "Nombre", placeholder: "Ej: Lukers S.A." }]}
      onSave={handleSave}
      onDelete={handleDelete}
      emptyText="No hay empresas registradas"
    />
  );
}

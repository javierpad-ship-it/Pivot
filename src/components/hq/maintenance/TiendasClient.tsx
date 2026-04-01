"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CrudTable } from "./CrudTable";

interface Empresa { id: string; name: string }
interface Tienda { id: string; name: string; distrito: string; ciudad: string; empresaId: string | null; empresa: Empresa | null }

interface Props {
  tiendas: Tienda[];
  empresas: Empresa[];
}

export function TiendasClient({ tiendas, empresas }: Props) {
  const router = useRouter();
  const [data, setData] = useState(tiendas);

  async function handleSave(id: string | null, form: Record<string, string>) {
    const empresaId = form.empresaId || null;
    if (id) {
      const res = await fetch(`/api/stores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, distrito: form.distrito, ciudad: form.ciudad, empresaId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setData((d) => d.map((t) => (t.id === id ? updated : t)));
    } else {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, distrito: form.distrito, ciudad: form.ciudad, empresaId }),
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

  const empresaOptions = [
    { value: "", label: "Sin empresa" },
    ...empresas.map((e) => ({ value: e.id, label: e.name })),
  ];

  return (
    <CrudTable
      columns={[
        { key: "name", label: "Nombre" },
        { key: "distrito", label: "Distrito" },
        { key: "ciudad", label: "Ciudad" },
        { key: "empresaName", label: "Empresa" },
      ]}
      rows={data.map((t) => ({
        id: t.id,
        name: t.name,
        distrito: t.distrito,
        ciudad: t.ciudad,
        empresaId: t.empresaId ?? "",
        empresaName: t.empresa?.name ?? "—",
      }))}
      formFields={[
        { key: "name", label: "Nombre", placeholder: "Ej: Tienda Centro" },
        { key: "distrito", label: "Distrito", placeholder: "Ej: Miraflores" },
        { key: "ciudad", label: "Ciudad", placeholder: "Ej: Lima" },
        { key: "empresaId", label: "Empresa", type: "select", options: empresaOptions },
      ]}
      onSave={handleSave}
      onDelete={handleDelete}
      emptyText="No hay tiendas registradas"
    />
  );
}

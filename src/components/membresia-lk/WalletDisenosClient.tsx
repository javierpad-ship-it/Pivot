"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { TIPO_TARJETA_LABELS, TIPO_TARJETA_OPTIONS, TIPO_TARJETA_BADGE_VARIANT } from "@/lib/membresia-lk-constants";
import { WalletCardPreview } from "./WalletCardPreview";

interface Diseno {
  id: string;
  nombre: string;
  tipo: string;
  activo: boolean;
  nombrePrograma: string;
  descripcion: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  colorFondo: string;
  colorTexto: string;
  totalEstampitas: number | null;
  premioDescripcion: string | null;
  beneficioBronce: string | null;
  beneficioPlata: string | null;
  beneficioOro: string | null;
  beneficioPlatino: string | null;
}

const EMPTY_FORM = {
  nombre: "",
  tipo: "PUNTOS",
  nombrePrograma: "Membresía LK",
  descripcion: "",
  logoUrl: "",
  heroImageUrl: "",
  colorFondo: "#1a73e8",
  colorTexto: "#ffffff",
  totalEstampitas: "10",
  premioDescripcion: "",
  beneficioBronce: "",
  beneficioPlata: "",
  beneficioOro: "",
  beneficioPlatino: "",
  activo: false,
};

// Maqueta de teléfono con datos de ejemplo, para ver en vivo el diseño mientras se edita.
function PhonePreview({ form }: { form: typeof EMPTY_FORM }) {
  const totalEstampitas = Math.max(1, Number(form.totalEstampitas) || 10);

  return (
    <div className="rounded-[2rem] border-8 border-gray-900 overflow-hidden shadow-xl w-full max-w-[280px] mx-auto lg:mx-0">
      <div
        className="relative p-4 min-h-[420px]"
        style={{ background: "linear-gradient(135deg, #050a14 0%, #0a1628 50%, #050a14 100%)" }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-56 h-56 rounded-full blur-[80px] opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${form.colorFondo} 0%, transparent 70%)` }}
        />
        <div className="relative z-10">
          {form.tipo === "PUNTOS" ? (
            <WalletCardPreview
              tipo="PUNTOS"
              nombrePrograma={form.nombrePrograma || "Membresía LK"}
              logoUrl={form.logoUrl || null}
              colorAcento={form.colorFondo}
              nombreCliente="Nombre del cliente"
              puntos={1250}
              nivelLabel="Oro"
              porcentaje={60}
              notaProgreso="750 puntos para llegar a Platino"
            />
          ) : (
            <WalletCardPreview
              tipo="ESTAMPITAS"
              nombrePrograma={form.nombrePrograma || "Membresía LK"}
              logoUrl={form.logoUrl || null}
              colorAcento={form.colorFondo}
              totalEstampitas={totalEstampitas}
              estampitasLlenas={Math.ceil(totalEstampitas / 2)}
              premioDescripcion={form.premioDescripcion || "Premio por confirmar"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function WalletDisenosClient({ disenos }: { disenos: Diseno[] }) {
  const router = useRouter();
  const [data, setData] = useState(disenos);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(d: Diseno) {
    setForm({
      nombre: d.nombre,
      tipo: d.tipo,
      nombrePrograma: d.nombrePrograma,
      descripcion: d.descripcion ?? "",
      logoUrl: d.logoUrl ?? "",
      heroImageUrl: d.heroImageUrl ?? "",
      colorFondo: d.colorFondo,
      colorTexto: d.colorTexto,
      totalEstampitas: String(d.totalEstampitas ?? 10),
      premioDescripcion: d.premioDescripcion ?? "",
      beneficioBronce: d.beneficioBronce ?? "",
      beneficioPlata: d.beneficioPlata ?? "",
      beneficioOro: d.beneficioOro ?? "",
      beneficioPlatino: d.beneficioPlatino ?? "",
      activo: d.activo,
    });
    setEditId(d.id);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = { ...form, totalEstampitas: Number(form.totalEstampitas) };
      if (editId) {
        const res = await fetch(`/api/membresia-lk/wallets/disenos/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated = await res.json();
        setData((d) => normalizarActivo(d.map((x) => (x.id === editId ? updated : x)), updated));
      } else {
        const res = await fetch("/api/membresia-lk/wallets/disenos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created = await res.json();
        setData((d) => normalizarActivo([created, ...d], created));
      }
      closeForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  // Si el diseño guardado quedó activo, refleja en el estado local que los demás de su tipo dejaron de estarlo
  function normalizarActivo(lista: Diseno[], guardado: Diseno): Diseno[] {
    if (!guardado.activo) return lista;
    return lista.map((d) => (d.id === guardado.id ? d : d.tipo === guardado.tipo ? { ...d, activo: false } : d));
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Confirmar eliminación del diseño?")) return;
    try {
      const res = await fetch(`/api/membresia-lk/wallets/disenos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setData((d) => d.filter((x) => x.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} size="sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo diseño
        </Button>
      </div>

      {showForm && (
        <div className="flex flex-col lg:flex-row gap-4 mb-4 items-start">
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 flex-1 min-w-0 w-full">
          <p className="font-medium text-blue-800 text-sm">{editId ? "Editar diseño" : "Nuevo diseño"}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Nombre interno"
              placeholder="Ej: Tarjeta VIP Lukers"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
            />
            <Select
              label="Tipo de tarjeta"
              options={TIPO_TARJETA_OPTIONS}
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              disabled={!!editId}
            />
            <Input
              label="Nombre del programa (visible en la tarjeta)"
              placeholder="Ej: Membresía LK"
              value={form.nombrePrograma}
              onChange={(e) => setForm((f) => ({ ...f, nombrePrograma: e.target.value }))}
              required
            />
            <Input
              label="Descripción (opcional)"
              placeholder="Ej: Programa de fidelización Lukers"
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            />
            <Input
              label="URL del logo"
              placeholder="https://.../logo.png"
              value={form.logoUrl}
              onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
            />
            <Input
              label="URL de imagen hero (opcional)"
              placeholder="https://.../hero.png"
              value={form.heroImageUrl}
              onChange={(e) => setForm((f) => ({ ...f, heroImageUrl: e.target.value }))}
            />
            <Input
              label="Color de fondo"
              type="color"
              value={form.colorFondo}
              onChange={(e) => setForm((f) => ({ ...f, colorFondo: e.target.value }))}
            />
            <Input
              label="Color de texto"
              type="color"
              value={form.colorTexto}
              onChange={(e) => setForm((f) => ({ ...f, colorTexto: e.target.value }))}
            />
            {form.tipo === "ESTAMPITAS" && (
              <>
                <Input
                  label="Total de estampitas para el premio"
                  type="number"
                  min="1"
                  value={form.totalEstampitas}
                  onChange={(e) => setForm((f) => ({ ...f, totalEstampitas: e.target.value }))}
                  required
                />
                <Input
                  label="Descripción del premio"
                  placeholder="Ej: Postre gratis"
                  value={form.premioDescripcion}
                  onChange={(e) => setForm((f) => ({ ...f, premioDescripcion: e.target.value }))}
                  required
                />
              </>
            )}
          </div>
          {form.tipo === "PUNTOS" && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">
                Beneficios por nivel (lo que ve el cliente en su portal /mi-tarjeta)
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Bronce"
                  placeholder="Ej: Bienvenida al programa"
                  value={form.beneficioBronce}
                  onChange={(e) => setForm((f) => ({ ...f, beneficioBronce: e.target.value }))}
                />
                <Input
                  label="Plata"
                  placeholder="Ej: 5% dcto en accesorios"
                  value={form.beneficioPlata}
                  onChange={(e) => setForm((f) => ({ ...f, beneficioPlata: e.target.value }))}
                />
                <Input
                  label="Oro"
                  placeholder="Ej: 10% dcto en toda la tienda"
                  value={form.beneficioOro}
                  onChange={(e) => setForm((f) => ({ ...f, beneficioOro: e.target.value }))}
                />
                <Input
                  label="Platino"
                  placeholder="Ej: Envío gratis + regalo de cumpleaños"
                  value={form.beneficioPlatino}
                  onChange={(e) => setForm((f) => ({ ...f, beneficioPlatino: e.target.value }))}
                />
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              className="rounded border-gray-300"
            />
            Diseño activo (se usa para emitir tarjetas nuevas de tipo {TIPO_TARJETA_LABELS[form.tipo]})
          </label>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={loading}>Guardar</Button>
            <Button type="button" variant="secondary" size="sm" onClick={closeForm}>Cancelar</Button>
          </div>
        </form>
        <div className="w-full lg:w-auto flex-shrink-0 lg:sticky lg:top-4">
          <p className="text-xs font-medium text-gray-500 mb-2 text-center lg:text-left">Vista previa</p>
          <PhonePreview form={form} />
        </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Programa</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No hay diseños creados
                </td>
              </tr>
            ) : (
              data.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.nombre}</td>
                  <td className="px-4 py-3">
                    <Badge variant={TIPO_TARJETA_BADGE_VARIANT[d.tipo] ?? "gray"}>
                      {TIPO_TARJETA_LABELS[d.tipo] ?? d.tipo}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{d.nombrePrograma}</td>
                  <td className="px-4 py-3">
                    {d.activo ? <Badge variant="green">Activo</Badge> : <Badge variant="gray">Inactivo</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(d)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ESTADO_LABELS, ESTADO_COLORS,
  ROL_PERSONAL_LABELS, TIPO_MOVIMIENTO_LABELS, TIPO_MOVIMIENTO_OPTIONS, TIPO_COLOR,
  ROL_PERSONAL_OPTIONS,
} from "@/lib/descansos-constants";

interface Registro {
  id: string;
  fecha: string;
  storeId: string;
  storeName: string;
  personaId: string;
  personaNombre: string;
  cargo: string;
  tipoMovimiento: string;
  coberturaId: string | null;
  coberturaNombre: string | null;
  observacion: string;
  alertaSabadoAceptada: boolean;
}

interface Persona {
  id: string;
  nombreCompleto: string;
  codigo: string;
  tiendaBaseId: string | null;
  roles: string[];
  elegibilidades: string[];
}

interface Store {
  id: string;
  name: string;
  formatoDireccion: string | null;
  gerenteTitularId: string | null;
  jefeTurnoTitularId: string | null;
}

interface AudEntry { id: string; fechaHora: string; usuario: string; accion: string }

interface Props {
  programacion: {
    id: string;
    estado: string;
    motivoRechazo: string | null;
    periodoInicio: string;
    periodoFin: string;
    zonaName: string;
    creadoPorNombre: string;
    aprobadoPorNombre: string | null;
    registros: Registro[];
    auditoria: AudEntry[];
  };
  stores: Store[];
  personas: Persona[];
  canEdit: boolean;
  canApprove: boolean;
}

const ACCION_LABELS: Record<string, string> = {
  CREAR: "Programación creada",
  EDITAR: "Registro editado",
  ENVIAR: "Enviado a aprobación",
  APROBAR: "Aprobado",
  RECHAZAR: "Rechazado",
  AGREGAR_REGISTRO: "Registro agregado",
  ELIMINAR_REGISTRO: "Registro eliminado",
};

export function ProgramacionEditor({ programacion, stores, personas, canEdit, canApprove }: Props) {
  const router = useRouter();
  const [registros, setRegistros] = useState<Registro[]>(programacion.registros);
  const [showForm, setShowForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rechazarModal, setRechazarModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [sabadoAlert, setSabadoAlert] = useState<{ form: RegistroFormData } | null>(null);

  // Form state for new registro
  const emptyForm: RegistroFormData = {
    storeId: stores[0]?.id ?? "",
    personaId: "",
    cargo: "",
    tipoMovimiento: "DESCANSO",
    coberturaId: "",
    fecha: "",
    observacion: "",
  };
  const [form, setForm] = useState<RegistroFormData>(emptyForm);

  type RegistroFormData = {
    storeId: string;
    personaId: string;
    cargo: string;
    tipoMovimiento: string;
    coberturaId: string;
    fecha: string;
    observacion: string;
  };

  // Personas with the cargo role
  const personasParaCargo = personas.filter((p) => form.cargo ? p.roles.includes(form.cargo) : true);

  // Coberturas válidas: personas who can cover the cargo (via elegibilidad)
  const coberturaValida = form.cargo
    ? personas.filter((p) =>
        p.elegibilidades.includes(form.cargo) &&
        p.id !== form.personaId
      )
    : [];

  const isSabado = form.fecha ? new Date(form.fecha + "T12:00:00").getDay() === 6 : false;

  async function submitRegistro(alertAceptada = false) {
    setError(null);
    if (!form.storeId || !form.personaId || !form.cargo || !form.fecha) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    // Saturday alert for Gerente
    if (form.cargo === "GERENTE_TIENDA" && isSabado && !alertAceptada) {
      setSabadoAlert({ form });
      return;
    }

    setLoadingAction("registro");
    try {
      const res = await fetch("/api/descansos/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programacionId: programacion.id,
          ...form,
          coberturaId: form.coberturaId || null,
          alertaSabadoAceptada: alertAceptada,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al agregar");
      setRegistros((prev) => [...prev, data]);
      setForm(emptyForm);
      setShowForm(false);
      setSabadoAlert(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoadingAction(null);
    }
  }

  async function deleteRegistro(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    setLoadingAction(id);
    try {
      const res = await fetch(`/api/descansos/registros/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setRegistros((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoadingAction(null);
    }
  }

  async function enviarAprobacion() {
    setLoadingAction("enviar");
    try {
      const res = await fetch(`/api/descansos/programaciones/${programacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "ENVIAR" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setLoadingAction(null);
    }
  }

  async function aprobar() {
    setLoadingAction("aprobar");
    try {
      const res = await fetch(`/api/descansos/programaciones/${programacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "APROBAR" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al aprobar");
    } finally {
      setLoadingAction(null);
    }
  }

  async function rechazar() {
    if (!motivoRechazo.trim()) { setError("El motivo de rechazo es obligatorio."); return; }
    setLoadingAction("rechazar");
    try {
      const res = await fetch(`/api/descansos/programaciones/${programacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "RECHAZAR", motivoRechazo }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setRechazarModal(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al rechazar");
    } finally {
      setLoadingAction(null);
    }
  }

  const estado = programacion.estado;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{programacion.zonaName}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_COLORS[estado]}`}>
              {ESTADO_LABELS[estado]}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(programacion.periodoInicio + "T12:00:00").toLocaleDateString("es", { day: "numeric", month: "long" })}
            {" — "}
            {new Date(programacion.periodoFin + "T12:00:00").toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
            <span className="mx-2 text-gray-300">·</span>
            Creado por {programacion.creadoPorNombre}
          </p>
        </div>

        <div className="flex gap-2">
          {canEdit && estado === "BORRADOR" && registros.length > 0 && (
            <button
              onClick={enviarAprobacion}
              disabled={loadingAction === "enviar"}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loadingAction === "enviar" ? "Enviando…" : "Enviar a aprobación →"}
            </button>
          )}
          {canApprove && estado === "PENDIENTE_APROBACION" && (
            <>
              <button onClick={() => setRechazarModal(true)}
                className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                Rechazar
              </button>
              <button onClick={aprobar} disabled={loadingAction === "aprobar"}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                {loadingAction === "aprobar" ? "Aprobando…" : "Aprobar"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rechazo reason */}
      {estado === "RECHAZADO" && programacion.motivoRechazo && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Motivo de rechazo</p>
          <p className="text-sm text-red-700">{programacion.motivoRechazo}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Registros table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Registros de descanso ({registros.length})</h2>
          {canEdit && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar registro
            </button>
          )}
        </div>

        {/* Add registro form */}
        {showForm && canEdit && (
          <div className="border-b border-gray-100 bg-blue-50 px-5 py-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Nuevo registro</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                <input type="date" value={form.fecha}
                  min={programacion.periodoInicio} max={programacion.periodoFin}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tienda *</label>
                <select value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de movimiento *</label>
                <select value={form.tipoMovimiento} onChange={(e) => setForm({ ...form, tipoMovimiento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {TIPO_MOVIMIENTO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cargo *</label>
                <select value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value, personaId: "", coberturaId: "" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Seleccionar —</option>
                  {ROL_PERSONAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Persona *</label>
                <select value={form.personaId} onChange={(e) => setForm({ ...form, personaId: e.target.value })}
                  disabled={!form.cargo}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                  <option value="">— Seleccionar —</option>
                  {personasParaCargo.map((p) => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cobertura {["GERENTE_TIENDA", "JEFE_TURNO"].includes(form.cargo) ? "*" : ""}
                </label>
                <select value={form.coberturaId} onChange={(e) => setForm({ ...form, coberturaId: e.target.value })}
                  disabled={!form.cargo || coberturaValida.length === 0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                  <option value="">— Automático / Sin cobertura —</option>
                  {coberturaValida.map((p) => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Observación</label>
              <input type="text" value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                placeholder="Opcional"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setError(null); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="button" onClick={() => submitRegistro(false)} disabled={loadingAction === "registro"}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loadingAction === "registro" ? "Agregando…" : "Agregar"}
              </button>
            </div>
          </div>
        )}

        {registros.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No hay registros aún</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tienda</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Persona / Cargo</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cobertura</th>
                  {canEdit && <th className="px-4 py-2.5"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registros.map((r) => {
                  const fechaObj = new Date(r.fecha + "T12:00:00");
                  const esSabado = fechaObj.getDay() === 6;
                  return (
                    <tr key={r.id} className={`hover:bg-gray-50 ${esSabado ? "bg-yellow-50/40" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {fechaObj.toLocaleDateString("es", { day: "numeric", month: "short" })}
                        </p>
                        {esSabado && <span className="text-xs text-yellow-600">Sábado</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{r.storeName}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.personaNombre}</p>
                        <p className="text-xs text-gray-400">{ROL_PERSONAL_LABELS[r.cargo] ?? r.cargo}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${TIPO_COLOR[r.tipoMovimiento] ?? ""}`}>
                          {TIPO_MOVIMIENTO_LABELS[r.tipoMovimiento] ?? r.tipoMovimiento}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {r.coberturaNombre ?? <span className="text-gray-300 text-xs">Automático</span>}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deleteRegistro(r.id)} disabled={loadingAction === r.id}
                            className="text-red-400 hover:text-red-600 text-xs font-medium disabled:opacity-50">
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de auditoría */}
      {programacion.auditoria.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Historial</h2>
          <div className="space-y-2">
            {programacion.auditoria.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-xs text-gray-500">
                <span className="text-gray-300 flex-shrink-0">
                  {new Date(a.fechaHora).toLocaleString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="font-medium text-gray-700">{a.usuario}</span>
                <span>{ACCION_LABELS[a.accion] ?? a.accion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Saturday alert */}
      {sabadoAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="font-bold text-gray-900">Atención</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Está programando el descanso de un <strong>Gerente de Tienda en sábado</strong>.
                  Los sábados son considerados días de alta importancia comercial.
                  Verifique que la cobertura asignada tenga la experiencia necesaria para operar
                  la tienda durante toda la jornada.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSabadoAlert(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => submitRegistro(true)}
                className="flex-1 py-2 bg-orange-500 text-white font-medium rounded-lg text-sm hover:bg-orange-600">
                Confirmar y continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Motivo de rechazo */}
      {rechazarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 mb-3">Rechazar programación</h3>
            <label className="block text-sm text-gray-600 mb-1">Motivo de rechazo *</label>
            <textarea value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} rows={3}
              placeholder="Ej: Cobertura insuficiente para la tienda El Sol el sábado 7..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4" />
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setRechazarModal(false); setError(null); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={rechazar} disabled={loadingAction === "rechazar"}
                className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                {loadingAction === "rechazar" ? "Rechazando…" : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

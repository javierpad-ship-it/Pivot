"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface Column {
  key: string;
  label: string;
}

export interface Row {
  id: string;
  [key: string]: string;
}

export interface FormField {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface Props {
  columns: Column[];
  rows: Row[];
  onSave: (id: string | null, data: Record<string, string>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  formFields: FormField[];
  emptyText?: string;
}

export function CrudTable({ columns, rows, onSave, onDelete, formFields, emptyText }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sortedRows = sortKey
    ? [...rows].sort((a, b) => {
        const cmp = (a[sortKey] ?? "").localeCompare(b[sortKey] ?? "", "es", { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : rows;

  function openAdd() {
    setFormData({});
    setEditId(null);
    setShowAdd(true);
    setError(null);
  }

  function openEdit(row: Row) {
    setFormData(Object.fromEntries(formFields.map((f) => [f.key, row[f.key] ?? ""])));
    setEditId(row.id);
    setShowAdd(true);
    setError(null);
  }

  function closeForm() {
    setShowAdd(false);
    setEditId(null);
    setFormData({});
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave(editId, formData);
      closeForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Confirmar eliminación?")) return;
    setLoading(true);
    try {
      await onDelete(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} size="sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar
        </Button>
      </div>

      {/* Inline form */}
      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="font-medium text-blue-800 text-sm">{editId ? "Editar registro" : "Nuevo registro"}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {formFields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    value={formData[f.key] ?? ""}
                    onChange={(e) => setFormData((d) => ({ ...d, [f.key]: e.target.value }))}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={f.required ?? false}
                  >
                    {f.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    value={formData[f.key] ?? ""}
                    onChange={(e) => setFormData((d) => ({ ...d, [f.key]: e.target.value }))}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={f.required ?? true}
                  />
                )}
              </div>
            ))}
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={loading}>Guardar</Button>
            <Button type="button" variant="secondary" size="sm" onClick={closeForm}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <button
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-gray-800 transition-colors"
                  >
                    {col.label}
                    <span className="text-gray-300">
                      {sortKey === col.key
                        ? sortDir === "asc" ? "↑" : "↓"
                        : "↕"}
                    </span>
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-400 text-sm">
                  {emptyText ?? "Sin registros"}
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">{row[col.key]}</td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(row)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
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

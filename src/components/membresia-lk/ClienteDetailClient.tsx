"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  NIVEL_LABELS,
  NIVEL_BADGE_VARIANT,
  calcularProgresoNivel,
  TIPO_MOVIMIENTO_LABELS,
  TIPO_MOVIMIENTO_COLORS,
  SOLES_POR_PUNTO,
} from "@/lib/membresia-lk-constants";

interface Movimiento {
  id: string;
  tipo: string;
  puntos: number;
  montoCompra: number | null;
  descripcion: string | null;
  createdAt: string;
}

interface Cliente {
  id: string;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  puntos: number;
  puntosAcumulados: number;
  nivel: string;
  portalToken: string;
  store: { id: string; name: string } | null;
  movimientos: Movimiento[];
}

const TIPO_OPTIONS = Object.entries(TIPO_MOVIMIENTO_LABELS).map(([value, label]) => ({ value, label }));

export function ClienteDetailClient({ cliente: initial }: { cliente: Cliente }) {
  const router = useRouter();
  const [cliente, setCliente] = useState(initial);
  const [tipo, setTipo] = useState("COMPRA");
  const [montoCompra, setMontoCompra] = useState("");
  const [puntos, setPuntos] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const { siguiente, porcentaje } = calcularProgresoNivel(cliente.puntosAcumulados);

  async function copiarEnlace() {
    const url = `${window.location.origin}/mi-tarjeta/${cliente.portalToken}`;
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/membresia-lk/clientes/${cliente.id}/movimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          montoCompra: tipo === "COMPRA" ? Number(montoCompra) : undefined,
          puntos: tipo !== "COMPRA" ? Number(puntos) : undefined,
          descripcion,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setCliente(updated);
      setMontoCompra("");
      setPuntos("");
      setDescripcion("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar el movimiento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{cliente.nombre}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {cliente.dni ?? "Sin DNI"} · {cliente.telefono ?? "Sin teléfono"}
              {cliente.store && <> · {cliente.store.name}</>}
            </p>
          </div>
          <Badge variant={NIVEL_BADGE_VARIANT[cliente.nivel] ?? "gray"}>
            {NIVEL_LABELS[cliente.nivel] ?? cliente.nivel}
          </Badge>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400">Puntos disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{cliente.puntos}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Puntos acumulados (histórico)</p>
              <p className="text-2xl font-bold text-gray-900">{cliente.puntosAcumulados}</p>
            </div>
          </div>
          {siguiente ? (
            <div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${porcentaje}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {siguiente.minPuntos - cliente.puntosAcumulados} puntos para llegar a {NIVEL_LABELS[siguiente.nivel]}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Nivel máximo alcanzado</p>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">Portal del cliente (puntos, nivel y beneficios)</p>
            <Button type="button" variant="secondary" size="sm" onClick={copiarEnlace}>
              {copiado ? "¡Copiado!" : "Copiar enlace"}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-gray-900">Registrar movimiento</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="Tipo"
                options={TIPO_OPTIONS}
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              />
              {tipo === "COMPRA" ? (
                <Input
                  label={`Monto de compra (S/ ${SOLES_POR_PUNTO} = 1 punto)`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 150.00"
                  value={montoCompra}
                  onChange={(e) => setMontoCompra(e.target.value)}
                  required
                />
              ) : (
                <Input
                  label={tipo === "CANJE" ? "Puntos a canjear" : "Puntos a ajustar (+/-)"}
                  type="number"
                  placeholder="Ej: 100"
                  value={puntos}
                  onChange={(e) => setPuntos(e.target.value)}
                  required
                />
              )}
            </div>
            <Input
              label="Descripción (opcional)"
              placeholder="Ej: Canje por producto X"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}
            <Button type="submit" size="sm" loading={loading}>Registrar</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-gray-900">Historial de movimientos</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Puntos</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Monto</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cliente.movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Sin movimientos registrados
                  </td>
                </tr>
              ) : (
                cliente.movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {new Date(m.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_MOVIMIENTO_COLORS[m.tipo] ?? "bg-gray-100 text-gray-700"}`}>
                        {TIPO_MOVIMIENTO_LABELS[m.tipo] ?? m.tipo}
                      </span>
                    </td>
                    <td className={`px-4 py-2 text-right font-semibold ${m.puntos < 0 ? "text-red-600" : "text-green-600"}`}>
                      {m.puntos > 0 ? `+${m.puntos}` : m.puntos}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {m.montoCompra != null ? `S/ ${m.montoCompra.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{m.descripcion ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

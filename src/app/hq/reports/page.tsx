import { prisma } from "@/lib/prisma";
import { getReportData } from "@/lib/report-utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ExportButton } from "@/components/hq/ExportButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { storeId?: string; brandId?: string; lineaId?: string };
}

function discrepancyClass(pct: number | null): string {
  if (pct === null) return "text-gray-400";
  if (pct === 0) return "text-green-700 bg-green-50";
  if (pct <= 10) return "text-yellow-700 bg-yellow-50";
  return "text-red-700 bg-red-50";
}

export default async function ReportsPage({ searchParams }: Props) {
  const [rows, stores, brands, lineas] = await Promise.all([
    getReportData({ storeId: searchParams.storeId, brandId: searchParams.brandId, lineaId: searchParams.lineaId }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.linea.findMany({ orderBy: [{ mundo: { name: "asc" } }, { name: "asc" }], include: { mundo: true } }),
  ]);

  const totalDiscrepancies = rows.filter((r) => r.discrepancy !== null && r.discrepancy !== 0).length;
  const avgPct = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + (r.discrepancyPercent ?? 0), 0) / rows.length)
    : 0;

  const exportParams = new URLSearchParams();
  if (searchParams.storeId) exportParams.set("storeId", searchParams.storeId);
  if (searchParams.brandId) exportParams.set("brandId", searchParams.brandId);
  if (searchParams.lineaId) exportParams.set("lineaId", searchParams.lineaId);
  const exportUrl = `/api/reports/export?${exportParams.toString()}`;

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporte de Diferencias</h1>
          <p className="text-sm text-gray-500 mt-1">Cantidad contada vs stock en sistema</p>
        </div>
        <ExportButton url={exportUrl} disabled={rows.length === 0} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 sm:gap-6">
        <Card><CardBody>
          <p className="text-sm text-gray-500">Conteos Registrados</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{rows.length}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-sm text-gray-500">Con Diferencia</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{totalDiscrepancies}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-sm text-gray-500">Diferencia Promedio</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">{avgPct}%</p>
        </CardBody></Card>
      </div>

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <select name="storeId" defaultValue={searchParams.storeId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las tiendas</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="brandId" defaultValue={searchParams.brandId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las marcas</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select name="lineaId" defaultValue={searchParams.lineaId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las líneas</option>
          {lineas.map((l) => <option key={l.id} value={l.id}>{l.mundo.name} / {l.name}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Filtrar</button>
        {(searchParams.storeId || searchParams.brandId || searchParams.lineaId) && (
          <Link href="/hq/reports" className="px-4 py-2 text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Limpiar</Link>
        )}
      </form>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tienda</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Marca</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mundo / Línea</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock Sistema</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Contado</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Diferencia</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Dif %</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Empleado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    No hay conteos registrados aún. Los conteos enviados por las tiendas aparecerán aquí.
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.taskId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{row.store.name}</p>
                    <p className="text-xs text-gray-400">{row.store.distrito} · {row.store.ciudad}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.brand.name}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <span className="text-xs text-gray-400">{row.mundo.name} /</span> {row.linea.name}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{row.systemQuantity ?? <span className="text-gray-400">N/A</span>}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{row.countedQuantity}</td>
                  <td className="px-4 py-3 text-right">
                    {row.discrepancy !== null ? (
                      <span className={`px-2 py-0.5 rounded font-medium ${discrepancyClass(row.discrepancyPercent)}`}>
                        {row.discrepancy > 0 ? "+" : ""}{row.discrepancy}
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.discrepancyPercent !== null ? (
                      <span className={`px-2 py-0.5 rounded font-medium ${discrepancyClass(row.discrepancyPercent)}`}>
                        {row.discrepancyPercent}%
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.employeeName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(row.countedAt).toLocaleString("es")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-green-100"></span> Sin diferencia</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-yellow-100"></span> 1–10% diferencia</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-red-100"></span> &gt;10% diferencia</span>
          </div>
        )}
      </Card>
    </div>
  );
}

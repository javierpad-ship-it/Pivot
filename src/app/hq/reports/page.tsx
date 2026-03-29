import { prisma } from "@/lib/prisma";
import { getReportData } from "@/lib/report-utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExportButton } from "@/components/hq/ExportButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { storeId?: string; brandId?: string; categoryId?: string };
}

function discrepancyClass(pct: number | null): string {
  if (pct === null) return "text-gray-400";
  if (pct === 0) return "text-green-700 bg-green-50";
  if (pct <= 10) return "text-yellow-700 bg-yellow-50";
  return "text-red-700 bg-red-50";
}

export default async function ReportsPage({ searchParams }: Props) {
  const [rows, stores, brands, categories] = await Promise.all([
    getReportData({
      storeId: searchParams.storeId,
      brandId: searchParams.brandId,
      categoryId: searchParams.categoryId,
    }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.itemCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalDiscrepancies = rows.filter((r) => r.discrepancy !== null && r.discrepancy !== 0).length;
  const avgPct =
    rows.length > 0
      ? Math.round(
          rows.reduce((s, r) => s + (r.discrepancyPercent ?? 0), 0) / rows.length
        )
      : 0;

  // Build export URL from current filters
  const exportParams = new URLSearchParams();
  if (searchParams.storeId) exportParams.set("storeId", searchParams.storeId);
  if (searchParams.brandId) exportParams.set("brandId", searchParams.brandId);
  if (searchParams.categoryId) exportParams.set("categoryId", searchParams.categoryId);
  const exportUrl = `/api/reports/export?${exportParams.toString()}`;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comparison Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Counted quantities vs system stock levels</p>
        </div>
        <ExportButton url={exportUrl} disabled={rows.length === 0} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Submitted Counts</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{rows.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">With Discrepancy</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{totalDiscrepancies}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Avg. Discrepancy %</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">{avgPct}%</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <select
          name="storeId"
          defaultValue={searchParams.storeId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Stores</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select
          name="brandId"
          defaultValue={searchParams.brandId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select
          name="categoryId"
          defaultValue={searchParams.categoryId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Filter
        </button>

        {(searchParams.storeId || searchParams.brandId || searchParams.categoryId) && (
          <Link href="/hq/reports" className="px-4 py-2 text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Clear
          </Link>
        )}
      </form>

      {/* Report table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Store</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Brand</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">System Qty</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Counted Qty</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Discrepancy</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Diff %</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Counted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    No completed counts yet. Counts submitted by store managers will appear here.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.taskId} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{row.store.name}</p>
                      <p className="text-xs text-gray-400">{row.store.location}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{row.brand.name}</td>
                    <td className="px-6 py-3 text-gray-700">{row.category.name}</td>
                    <td className="px-6 py-3 text-right text-gray-700">
                      {row.systemQuantity ?? <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                      {row.countedQuantity}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {row.discrepancy !== null ? (
                        <span className={`px-2 py-0.5 rounded font-medium ${discrepancyClass(row.discrepancyPercent)}`}>
                          {row.discrepancy > 0 ? "+" : ""}{row.discrepancy}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {row.discrepancyPercent !== null ? (
                        <span className={`px-2 py-0.5 rounded font-medium ${discrepancyClass(row.discrepancyPercent)}`}>
                          {row.discrepancyPercent}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{row.employeeName}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(row.countedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-green-100"></span> Exact match
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-yellow-100"></span> 1–10% difference
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-red-100"></span> &gt;10% difference
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

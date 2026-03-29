import type { ReportRow } from "@/types";

function escapeCell(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(rows: ReportRow[]): string {
  const headers = [
    "Store",
    "Location",
    "Brand",
    "Category",
    "System Qty",
    "Counted Qty",
    "Discrepancy",
    "Discrepancy %",
    "Employee",
    "Counted At",
  ];

  const csvRows = rows.map((r) =>
    [
      escapeCell(r.store.name),
      escapeCell(r.store.location),
      escapeCell(r.brand.name),
      escapeCell(r.category.name),
      escapeCell(r.systemQuantity),
      escapeCell(r.countedQuantity),
      escapeCell(r.discrepancy),
      escapeCell(r.discrepancyPercent !== null ? `${r.discrepancyPercent}%` : ""),
      escapeCell(r.employeeName),
      escapeCell(new Date(r.countedAt).toLocaleString()),
    ].join(",")
  );

  return [headers.join(","), ...csvRows].join("\n");
}

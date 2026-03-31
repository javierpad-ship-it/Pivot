import { NextRequest } from "next/server";
import { getReportData } from "@/lib/report-utils";
import { generateCsv } from "@/lib/csv-export";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId") ?? undefined;
  const brandId = searchParams.get("brandId") ?? undefined;
  const lineaId = searchParams.get("lineaId") ?? undefined;

  const rows = await getReportData({ storeId, brandId, lineaId });
  const csv = generateCsv(rows);
  const date = new Date().toISOString().split("T")[0];

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="conteo-ciclico-${date}.csv"`,
    },
  });
}

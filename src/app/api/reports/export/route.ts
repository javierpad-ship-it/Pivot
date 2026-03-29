import { NextRequest } from "next/server";
import { getReportData } from "@/lib/report-utils";
import { generateCsv } from "@/lib/csv-export";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId") ?? undefined;
  const brandId = searchParams.get("brandId") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const rows = await getReportData({ storeId, brandId, categoryId });
  const csv = generateCsv(rows);
  const date = new Date().toISOString().split("T")[0];

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="cycle-count-${date}.csv"`,
    },
  });
}

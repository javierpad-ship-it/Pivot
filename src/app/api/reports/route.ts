import { NextRequest, NextResponse } from "next/server";
import { getReportData } from "@/lib/report-utils";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId") ?? undefined;
  const brandId = searchParams.get("brandId") ?? undefined;
  const lineaId = searchParams.get("lineaId") ?? undefined;

  const rows = await getReportData({ storeId, brandId, lineaId });
  return NextResponse.json(rows);
}

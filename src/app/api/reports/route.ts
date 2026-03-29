import { NextRequest, NextResponse } from "next/server";
import { getReportData } from "@/lib/report-utils";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId") ?? undefined;
  const brandId = searchParams.get("brandId") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const rows = await getReportData({ storeId, brandId, categoryId });
  return NextResponse.json(rows);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId") ?? undefined;
  const brandId = searchParams.get("brandId") ?? undefined;
  const lineaId = searchParams.get("lineaId") ?? undefined;

  const stock = await prisma.systemStock.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(brandId ? { brandId } : {}),
      ...(lineaId ? { lineaId } : {}),
    },
    include: { store: true, brand: true, linea: { include: { mundo: true } } },
    orderBy: [{ store: { name: "asc" } }, { brand: { name: "asc" } }],
  });

  return NextResponse.json(stock);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { storeId, brandId, lineaId, systemQuantity } = body;

  if (!storeId || !brandId || !lineaId || systemQuantity === undefined) {
    return NextResponse.json(
      { error: "storeId, brandId, lineaId y systemQuantity son requeridos" },
      { status: 400 }
    );
  }

  const entry = await prisma.systemStock.upsert({
    where: { storeId_brandId_lineaId: { storeId, brandId, lineaId } },
    update: { systemQuantity: Number(systemQuantity) },
    create: { storeId, brandId, lineaId, systemQuantity: Number(systemQuantity) },
    include: { store: true, brand: true, linea: { include: { mundo: true } } },
  });

  return NextResponse.json(entry);
}

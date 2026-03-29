import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId") ?? undefined;
  const brandId = searchParams.get("brandId") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const stock = await prisma.systemStock.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(brandId ? { brandId } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: { store: true, brand: true, category: true },
    orderBy: [{ store: { name: "asc" } }, { brand: { name: "asc" } }],
  });

  return NextResponse.json(stock);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { storeId, brandId, categoryId, systemQuantity } = body;

  if (!storeId || !brandId || !categoryId || systemQuantity === undefined) {
    return NextResponse.json(
      { error: "storeId, brandId, categoryId, and systemQuantity are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.systemStock.upsert({
    where: { storeId_brandId_categoryId: { storeId, brandId, categoryId } },
    update: { systemQuantity: Number(systemQuantity) },
    create: { storeId, brandId, categoryId, systemQuantity: Number(systemQuantity) },
    include: { store: true, brand: true, category: true },
  });

  return NextResponse.json(entry);
}

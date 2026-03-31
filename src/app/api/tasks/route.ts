import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const brandId = searchParams.get("brandId") ?? undefined;
  const lineaId = searchParams.get("lineaId") ?? undefined;

  const tasks = await prisma.countTask.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
      ...(brandId ? { brandId } : {}),
      ...(lineaId ? { lineaId } : {}),
    },
    include: {
      store: true,
      brand: true,
      linea: { include: { mundo: true } },
      countRecord: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { storeId, brandId, lineaId } = body;

  if (!storeId || !brandId || !lineaId) {
    return NextResponse.json(
      { error: "storeId, brandId y lineaId son requeridos" },
      { status: 400 }
    );
  }

  const existing = await prisma.countTask.findFirst({
    where: { storeId, brandId, lineaId },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una tarea para esta combinación de tienda, marca y línea" },
      { status: 409 }
    );
  }

  const task = await prisma.countTask.create({
    data: { storeId, brandId, lineaId, status: "PENDING" },
    include: { store: true, brand: true, linea: { include: { mundo: true } }, countRecord: true },
  });

  return NextResponse.json(task, { status: 201 });
}

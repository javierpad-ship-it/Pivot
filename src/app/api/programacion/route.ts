export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const dayOfWeek = searchParams.get("dayOfWeek");

  const items = await prisma.programacion.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(dayOfWeek ? { dayOfWeek: parseInt(dayOfWeek) } : {}),
    },
    include: {
      store: true,
      brand: true,
      linea: { include: { mundo: true } },
      genero: true,
    },
    orderBy: [{ store: { name: "asc" } }, { dayOfWeek: "asc" }, { brand: { name: "asc" } }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { storeId, dayOfWeek, brandId, lineaId, generoId } = await req.json();
  if (!storeId || !dayOfWeek || !brandId || !lineaId || !generoId) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }
  if (dayOfWeek < 1 || dayOfWeek > 4) {
    return NextResponse.json({ error: "Día debe ser entre 1 (Lunes) y 4 (Jueves)" }, { status: 400 });
  }
  try {
    const item = await prisma.programacion.create({
      data: { storeId, dayOfWeek, brandId, lineaId, generoId },
      include: {
        store: true,
        brand: true,
        linea: { include: { mundo: true } },
        genero: true,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe esta combinación en ese día" }, { status: 409 });
  }
}

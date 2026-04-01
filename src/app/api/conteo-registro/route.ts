export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const fecha = searchParams.get("fecha"); // YYYY-MM-DD

  const registros = await prisma.conteoRegistro.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(fecha ? { fecha: new Date(fecha) } : {}),
    },
    include: {
      brand: true,
      linea: { include: { mundo: true } },
      genero: true,
    },
  });
  return NextResponse.json(registros);
}

export async function POST(req: NextRequest) {
  const { storeId, brandId, lineaId, generoId, fecha, cantidad, empleado } = await req.json();
  if (!storeId || !brandId || !lineaId || !generoId || !fecha || cantidad == null || !empleado?.trim()) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }
  try {
    const registro = await prisma.conteoRegistro.upsert({
      where: {
        storeId_brandId_lineaId_generoId_fecha: {
          storeId, brandId, lineaId, generoId, fecha: new Date(fecha),
        },
      },
      update: { cantidad: parseInt(cantidad), empleado: empleado.trim() },
      create: {
        storeId, brandId, lineaId, generoId,
        fecha: new Date(fecha),
        cantidad: parseInt(cantidad),
        empleado: empleado.trim(),
      },
      include: {
        brand: true,
        linea: { include: { mundo: true } },
        genero: true,
      },
    });
    return NextResponse.json(registro, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al guardar el conteo" }, { status: 500 });
  }
}

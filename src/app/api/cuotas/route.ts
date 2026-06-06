export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const semana = searchParams.get("semana");
  const anio = searchParams.get("anio");

  const cuotas = await prisma.cuotaVentas.findMany({
    where: {
      ...(semana ? { semana: parseInt(semana) } : {}),
      ...(anio ? { anio: parseInt(anio) } : {}),
    },
    include: {
      store: { select: { id: true, name: true, distrito: true } },
      ventas: true,
    },
    orderBy: { store: { name: "asc" } },
  });
  return NextResponse.json(cuotas);
}

export async function POST(req: NextRequest) {
  const { storeId, semana, anio, monto } = await req.json();
  if (!storeId || !semana || !anio || monto == null) {
    return NextResponse.json({ error: "storeId, semana, anio y monto son requeridos" }, { status: 400 });
  }
  const cuota = await prisma.cuotaVentas.upsert({
    where: { storeId_semana_anio: { storeId, semana: parseInt(semana), anio: parseInt(anio) } },
    create: { storeId, semana: parseInt(semana), anio: parseInt(anio), monto: parseFloat(monto) },
    update: { monto: parseFloat(monto) },
    include: {
      store: { select: { id: true, name: true, distrito: true } },
      ventas: true,
    },
  });
  return NextResponse.json(cuota, { status: 201 });
}

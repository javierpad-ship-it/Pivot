export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cuotaId = searchParams.get("cuotaId");
  if (!cuotaId) return NextResponse.json({ error: "cuotaId requerido" }, { status: 400 });

  const ventas = await prisma.ventaReal.findMany({
    where: { cuotaId },
    orderBy: { fecha: "asc" },
  });
  return NextResponse.json(ventas);
}

export async function POST(req: NextRequest) {
  const { cuotaId, fecha, monto, empleado } = await req.json();
  if (!cuotaId || !fecha || monto == null) {
    return NextResponse.json({ error: "cuotaId, fecha y monto son requeridos" }, { status: 400 });
  }
  const venta = await prisma.ventaReal.create({
    data: { cuotaId, fecha: new Date(fecha), monto: parseFloat(monto), empleado: empleado || null },
  });
  return NextResponse.json(venta, { status: 201 });
}

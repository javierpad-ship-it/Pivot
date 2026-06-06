export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const cuota = await prisma.cuotaVentas.findUnique({
    where: { id: params.id },
    include: {
      store: { select: { id: true, name: true, distrito: true } },
      ventas: { orderBy: { fecha: "asc" } },
    },
  });
  if (!cuota) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(cuota);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { monto } = await req.json();
  if (monto == null) return NextResponse.json({ error: "monto es requerido" }, { status: 400 });
  const cuota = await prisma.cuotaVentas.update({
    where: { id: params.id },
    data: { monto: parseFloat(monto) },
    include: {
      store: { select: { id: true, name: true, distrito: true } },
      ventas: true,
    },
  });
  return NextResponse.json(cuota);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.cuotaVentas.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

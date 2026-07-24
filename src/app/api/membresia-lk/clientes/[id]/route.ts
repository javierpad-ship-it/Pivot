export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const cliente = await prisma.membresiaCliente.findUnique({
    where: { id: params.id },
    include: {
      store: true,
      movimientos: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { nombre, dni, telefono, storeId, activo } = await req.json();
  if (!nombre?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }
  if (dni?.trim()) {
    const existente = await prisma.membresiaCliente.findUnique({ where: { dni: dni.trim() } });
    if (existente && existente.id !== params.id) {
      return NextResponse.json({ error: "Ya existe un cliente con ese DNI" }, { status: 409 });
    }
  }
  const cliente = await prisma.membresiaCliente.update({
    where: { id: params.id },
    data: {
      nombre: nombre.trim(),
      dni: dni?.trim() || null,
      telefono: telefono?.trim() || null,
      storeId: storeId || null,
      ...(activo !== undefined ? { activo } : {}),
    },
    include: { store: true },
  });
  return NextResponse.json(cliente);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const movimientos = await prisma.membresiaMovimiento.count({ where: { clienteId: params.id } });
  if (movimientos > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: el cliente tiene movimientos de puntos registrados" },
      { status: 409 }
    );
  }
  await prisma.membresiaCliente.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  const clientes = await prisma.membresiaCliente.findMany({
    where: storeId ? { storeId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { store: true },
  });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const { nombre, dni, telefono, storeId } = await req.json();
  if (!nombre?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }
  if (dni?.trim()) {
    const existente = await prisma.membresiaCliente.findUnique({ where: { dni: dni.trim() } });
    if (existente) {
      return NextResponse.json({ error: "Ya existe un cliente con ese DNI" }, { status: 409 });
    }
  }
  const cliente = await prisma.membresiaCliente.create({
    data: {
      nombre: nombre.trim(),
      dni: dni?.trim() || null,
      telefono: telefono?.trim() || null,
      storeId: storeId || null,
    },
    include: { store: true },
  });
  return NextResponse.json(cliente, { status: 201 });
}

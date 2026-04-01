export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  try {
    const empresa = await prisma.empresa.update({ where: { id: params.id }, data: { name: name.trim() } });
    return NextResponse.json(empresa);
  } catch {
    return NextResponse.json({ error: "Ya existe una empresa con ese nombre" }, { status: 409 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const stores = await prisma.store.count({ where: { empresaId: params.id } });
  if (stores > 0) return NextResponse.json({ error: "No se puede eliminar: tiene tiendas asignadas" }, { status: 409 });
  await prisma.empresa.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

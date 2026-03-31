import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }
  const mundo = await prisma.mundo.update({ where: { id: params.id }, data: { name: name.trim() } });
  return NextResponse.json(mundo);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const lineas = await prisma.linea.count({ where: { mundoId: params.id } });
  if (lineas > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: el mundo tiene líneas asociadas" },
      { status: 409 }
    );
  }
  await prisma.mundo.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

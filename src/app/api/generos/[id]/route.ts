export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
  }
  try {
    const genero = await prisma.genero.update({
      where: { id: params.id },
      data: { name: name.trim() },
    });
    return NextResponse.json(genero);
  } catch {
    return NextResponse.json({ error: "Ya existe un género con ese nombre" }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const count = await prisma.programacion.count({ where: { generoId: params.id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: el género tiene programaciones asociadas" },
      { status: 409 }
    );
  }
  await prisma.genero.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

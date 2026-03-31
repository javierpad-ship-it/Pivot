import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, mundoId } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }
  const linea = await prisma.linea.update({
    where: { id: params.id },
    data: { name: name.trim(), ...(mundoId ? { mundoId } : {}) },
    include: { mundo: true },
  });
  return NextResponse.json(linea);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const tasks = await prisma.countTask.count({ where: { lineaId: params.id } });
  if (tasks > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: la línea tiene tareas asociadas" },
      { status: 409 }
    );
  }
  await prisma.linea.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

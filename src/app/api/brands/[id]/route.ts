import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }
  const brand = await prisma.brand.update({ where: { id: params.id }, data: { name: name.trim() } });
  return NextResponse.json(brand);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const tasks = await prisma.countTask.count({ where: { brandId: params.id } });
  if (tasks > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: la marca tiene tareas asociadas" },
      { status: 409 }
    );
  }
  await prisma.brand.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

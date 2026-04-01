export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, location } = await req.json();
  if (!name?.trim() || !location?.trim()) {
    return NextResponse.json({ error: "Nombre y ubicación son requeridos" }, { status: 400 });
  }
  const store = await prisma.store.update({
    where: { id: params.id },
    data: { name: name.trim(), location: location.trim() },
  });
  return NextResponse.json(store);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const tasks = await prisma.countTask.count({ where: { storeId: params.id } });
  if (tasks > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: la tienda tiene tareas asociadas" },
      { status: 409 }
    );
  }
  await prisma.store.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

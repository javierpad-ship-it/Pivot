export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, distrito, ciudad, empresaId, direccion, latitud, longitud } = await req.json();
  if (!name?.trim() || !distrito?.trim() || !ciudad?.trim()) {
    return NextResponse.json({ error: "Nombre, distrito y ciudad son requeridos" }, { status: 400 });
  }
  const store = await prisma.store.update({
    where: { id: params.id },
    data: {
      name: name.trim(),
      distrito: distrito.trim(),
      ciudad: ciudad.trim(),
      empresaId: empresaId || null,
      direccion: direccion?.trim() || null,
      latitud: latitud !== undefined && latitud !== "" && latitud !== null ? Number(latitud) : null,
      longitud: longitud !== undefined && longitud !== "" && longitud !== null ? Number(longitud) : null,
    },
    include: { empresa: true, zona: true },
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

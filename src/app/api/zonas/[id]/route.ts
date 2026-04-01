export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { name, storeIds } = await req.json();
  try {
    if (name !== undefined) {
      if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
      await prisma.zona.update({ where: { id: params.id }, data: { name: name.trim() } });
    }
    if (storeIds !== undefined) {
      // Remove zone from all current stores in this zone
      await prisma.store.updateMany({ where: { zonaId: params.id }, data: { zonaId: null } });
      // Assign zone to new stores
      if (storeIds.length > 0) {
        await prisma.store.updateMany({ where: { id: { in: storeIds } }, data: { zonaId: params.id } });
      }
    }
    const zona = await prisma.zona.findUnique({
      where: { id: params.id },
      include: { stores: { orderBy: { name: "asc" } } },
    });
    return NextResponse.json(zona);
  } catch {
    return NextResponse.json({ error: "Ya existe una zona con ese nombre" }, { status: 409 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  // Unassign stores before deleting
  await prisma.store.updateMany({ where: { zonaId: params.id }, data: { zonaId: null } });
  await prisma.zona.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

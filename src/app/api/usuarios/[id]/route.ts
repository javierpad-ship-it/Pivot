import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const include = {
  store: { select: { id: true, name: true } },
  zona:  { select: { id: true, name: true } },
} as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { nombre, username, rol, storeId, zonaId, activo } = await req.json();
  try {
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: {
        ...(nombre   !== undefined && { nombre:   nombre.trim() }),
        ...(username !== undefined && { username: username.trim().toLowerCase() }),
        ...(rol      !== undefined && { rol }),
        ...(activo   !== undefined && { activo }),
        ...(storeId  !== undefined && { storeId: storeId || null }),
        ...(zonaId   !== undefined && { zonaId:  zonaId  || null }),
      },
      include,
    });
    const { password: _, ...safe } = usuario;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el usuario" }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const usuario = await prisma.usuario.findUnique({ where: { id: params.id } });
  if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  if (usuario.rol === "SUPER_ADMIN") {
    return NextResponse.json({ error: "No se puede eliminar al Super Administrador" }, { status: 403 });
  }
  await prisma.usuario.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

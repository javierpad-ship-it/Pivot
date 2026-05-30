import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = getSession();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const registro = await prisma.registroDescanso.findUnique({
      where: { id: params.id },
      include: { programacion: { select: { estado: true, id: true } } },
    });
    if (!registro) return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    if (!["BORRADOR", "RECHAZADO"].includes(registro.programacion.estado)) {
      return NextResponse.json({ error: "No se puede eliminar un registro de una programación en estado " + registro.programacion.estado }, { status: 400 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.registroDescanso.delete({ where: { id: params.id } });
      await tx.auditoriaDescanso.create({
        data: {
          programacionId: registro.programacion.id,
          usuarioId: user.id,
          accion: "ELIMINAR_REGISTRO",
          valorAnterior: { registroId: params.id },
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = getSession();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { accion, motivoRechazo } = await req.json();

    const prog = await prisma.programacionDescanso.findUnique({
      where: { id: params.id },
      include: { _count: { select: { registros: true } } },
    });
    if (!prog) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    let nuevoEstado: string;
    switch (accion) {
      case "ENVIAR":
        if (prog.estado !== "BORRADOR" && prog.estado !== "RECHAZADO")
          return NextResponse.json({ error: "Solo se puede enviar desde estado Borrador o Rechazado" }, { status: 400 });
        if (prog._count.registros === 0)
          return NextResponse.json({ error: "La programación no tiene registros" }, { status: 400 });
        nuevoEstado = "PENDIENTE_APROBACION";
        break;
      case "APROBAR":
        if (!["SUPER_ADMIN", "ADMIN"].includes(user.rol))
          return NextResponse.json({ error: "Sin permiso para aprobar" }, { status: 403 });
        if (prog.estado !== "PENDIENTE_APROBACION")
          return NextResponse.json({ error: "Solo se puede aprobar desde Pendiente de Aprobación" }, { status: 400 });
        nuevoEstado = "APROBADO";
        break;
      case "RECHAZAR":
        if (!["SUPER_ADMIN", "ADMIN"].includes(user.rol))
          return NextResponse.json({ error: "Sin permiso para rechazar" }, { status: 403 });
        if (prog.estado !== "PENDIENTE_APROBACION")
          return NextResponse.json({ error: "Solo se puede rechazar desde Pendiente de Aprobación" }, { status: 400 });
        if (!motivoRechazo?.trim())
          return NextResponse.json({ error: "El motivo de rechazo es obligatorio" }, { status: 400 });
        nuevoEstado = "RECHAZADO";
        break;
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.programacionDescanso.update({
        where: { id: params.id },
        data: {
          estado: nuevoEstado,
          motivoRechazo: accion === "RECHAZAR" ? motivoRechazo.trim() : (accion === "APROBAR" ? null : undefined),
          aprobadoPorId: ["APROBAR", "RECHAZAR"].includes(accion) ? user.id : undefined,
          aprobadoEn: ["APROBAR", "RECHAZAR"].includes(accion) ? new Date() : undefined,
        },
      });
      await tx.auditoriaDescanso.create({
        data: {
          programacionId: params.id,
          usuarioId: user.id,
          accion,
          valorNuevo: { estado: nuevoEstado, motivoRechazo: motivoRechazo ?? null },
        },
      });
      return p;
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

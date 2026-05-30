import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { zonaId, periodoInicio, periodoFin, creadoPorId } = await req.json();
    if (!zonaId || !periodoInicio || !periodoFin || !creadoPorId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    const prog = await prisma.$transaction(async (tx) => {
      const p = await tx.programacionDescanso.create({
        data: {
          zonaId,
          periodoInicio: new Date(periodoInicio + "T12:00:00"),
          periodoFin: new Date(periodoFin + "T12:00:00"),
          creadoPorId,
          estado: "BORRADOR",
        },
      });
      await tx.auditoriaDescanso.create({
        data: { programacionId: p.id, usuarioId: creadoPorId, accion: "CREAR", valorNuevo: { zonaId, periodoInicio, periodoFin } },
      });
      return p;
    });
    return NextResponse.json(prog, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

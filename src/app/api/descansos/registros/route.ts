import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";

export async function POST(req: Request) {
  const user = getSession();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const {
      programacionId, storeId, personaId, cargo, tipoMovimiento,
      coberturaId, observacion, fecha, alertaSabadoAceptada,
    } = await req.json();

    if (!programacionId || !storeId || !personaId || !cargo || !tipoMovimiento || !fecha) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verify programacion is in BORRADOR or RECHAZADO
    const prog = await prisma.programacionDescanso.findUnique({ where: { id: programacionId } });
    if (!prog) return NextResponse.json({ error: "Programación no encontrada" }, { status: 404 });
    if (!["BORRADOR", "RECHAZADO"].includes(prog.estado)) {
      return NextResponse.json({ error: "No se pueden agregar registros a una programación en estado " + prog.estado }, { status: 400 });
    }

    const fechaObj = new Date(fecha + "T12:00:00");

    // Rule 2: Coverage person can't be assigned to 2 stores on same day
    if (coberturaId) {
      const conflicto = await prisma.registroDescanso.findFirst({
        where: {
          coberturaId,
          fecha: fechaObj,
          storeId: { not: storeId },
          programacion: { estado: { not: "RECHAZADO" } },
        },
      });
      if (conflicto) {
        return NextResponse.json({
          error: "El colaborador ya se encuentra asignado como cobertura en otra tienda para la fecha seleccionada.",
        }, { status: 400 });
      }

      // Rule 3: Coverage can't have 2 assignments same day
      const conflicto2 = await prisma.registroDescanso.findFirst({
        where: {
          coberturaId,
          fecha: fechaObj,
          storeId,
          programacion: { estado: { not: "RECHAZADO" } },
        },
      });
      if (conflicto2) {
        return NextResponse.json({
          error: "El colaborador ya tiene una cobertura asignada en esta tienda para la misma fecha.",
        }, { status: 400 });
      }

      // Rule 4: Coverage must be eligible (check ElegibilidadCobertura)
      const elegibilidad = await prisma.elegibilidadCobertura.findUnique({
        where: { personaId_rolHabilita: { personaId: coberturaId, rolHabilita: cargo } },
      });
      if (!elegibilidad) {
        return NextResponse.json({
          error: "El colaborador seleccionado no está habilitado para cubrir el rol " + cargo,
        }, { status: 400 });
      }
    }

    const registro = await prisma.$transaction(async (tx) => {
      const r = await tx.registroDescanso.create({
        data: {
          programacionId, storeId, personaId, cargo, tipoMovimiento,
          coberturaId: coberturaId || null,
          observacion: observacion?.trim() || null,
          fecha: fechaObj,
          alertaSabadoAceptada: alertaSabadoAceptada ?? false,
        },
        include: {
          store: { select: { name: true } },
          persona: { select: { nombreCompleto: true, codigo: true } },
          cobertura: { select: { nombreCompleto: true, codigo: true } },
        },
      });
      await tx.auditoriaDescanso.create({
        data: {
          programacionId,
          usuarioId: user.id,
          accion: "AGREGAR_REGISTRO",
          valorNuevo: { cargo, tipoMovimiento, fecha, storeId, personaId, coberturaId },
        },
      });
      return r;
    });

    return NextResponse.json({
      id: registro.id,
      fecha,
      storeId: registro.storeId,
      storeName: registro.store.name,
      personaId: registro.personaId,
      personaNombre: registro.persona.nombreCompleto,
      cargo: registro.cargo,
      tipoMovimiento: registro.tipoMovimiento,
      coberturaId: registro.coberturaId,
      coberturaNombre: registro.cobertura?.nombreCompleto ?? null,
      observacion: registro.observacion ?? "",
      alertaSabadoAceptada: registro.alertaSabadoAceptada,
    }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

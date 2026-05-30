import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { codigo, nombreCompleto, tiendaBaseId, activo, roles, elegibilidades } = await req.json();
    const persona = await prisma.$transaction(async (tx) => {
      const p = await tx.persona.update({
        where: { id: params.id },
        data: { codigo: codigo.trim(), nombreCompleto: nombreCompleto.trim(), tiendaBaseId: tiendaBaseId || null, activo },
      });
      await tx.rolPersona.deleteMany({ where: { personaId: params.id } });
      if (roles?.length) {
        await tx.rolPersona.createMany({ data: roles.map((r: string) => ({ personaId: params.id, rol: r })) });
      }
      await tx.elegibilidadCobertura.deleteMany({ where: { personaId: params.id } });
      if (elegibilidades?.length) {
        await tx.elegibilidadCobertura.createMany({ data: elegibilidades.map((r: string) => ({ personaId: params.id, rolHabilita: r })) });
      }
      return p;
    });
    return NextResponse.json(persona);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.persona.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

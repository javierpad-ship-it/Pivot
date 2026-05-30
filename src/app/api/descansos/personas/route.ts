import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const personas = await prisma.persona.findMany({
    orderBy: { nombreCompleto: "asc" },
    include: { roles: true, elegibilidades: true, tiendaBase: { select: { name: true } } },
  });
  return NextResponse.json(personas);
}

export async function POST(req: Request) {
  try {
    const { codigo, nombreCompleto, tiendaBaseId, activo, roles, elegibilidades } = await req.json();
    if (!codigo || !nombreCompleto) {
      return NextResponse.json({ error: "Código y nombre son obligatorios" }, { status: 400 });
    }
    const persona = await prisma.$transaction(async (tx) => {
      const p = await tx.persona.create({
        data: { codigo: codigo.trim(), nombreCompleto: nombreCompleto.trim(), tiendaBaseId: tiendaBaseId || null, activo: activo ?? true },
      });
      if (roles?.length) {
        await tx.rolPersona.createMany({ data: roles.map((r: string) => ({ personaId: p.id, rol: r })) });
      }
      if (elegibilidades?.length) {
        await tx.elegibilidadCobertura.createMany({ data: elegibilidades.map((r: string) => ({ personaId: p.id, rolHabilita: r })) });
      }
      return p;
    });
    return NextResponse.json(persona, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al crear";
    if (msg.includes("Unique")) return NextResponse.json({ error: "Ya existe una persona con ese código o DNI" }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

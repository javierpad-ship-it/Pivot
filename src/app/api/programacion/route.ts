export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const include = {
  brand: true,
  linea: { include: { mundo: true } },
  genero: true,
  tiendas: { include: { store: true } },
} as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dayOfWeek = searchParams.get("dayOfWeek");

  const items = await prisma.programacion.findMany({
    where: dayOfWeek ? { dayOfWeek: parseInt(dayOfWeek) } : undefined,
    include,
    orderBy: [{ dayOfWeek: "asc" }, { brand: { name: "asc" } }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { dayOfWeek, brandId, lineaId, generoId, scope, storeIds } = await req.json();

  if (!dayOfWeek || !brandId || !lineaId || !generoId || !scope) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }
  if (dayOfWeek < 1 || dayOfWeek > 4) {
    return NextResponse.json({ error: "Día debe ser entre 1 (Lunes) y 4 (Jueves)" }, { status: 400 });
  }
  if (scope === "SOME" && (!storeIds || storeIds.length === 0)) {
    return NextResponse.json({ error: "Debes seleccionar al menos una tienda" }, { status: 400 });
  }

  // Map __ALL__ wildcards to sentinel IDs — creates ONE task, not N individual tasks
  const resolvedBrandId  = brandId  === "__ALL__" ? "brand-all"  : brandId;
  const resolvedGeneroId = generoId === "__ALL__" ? "genero-all" : generoId;

  // Debug: log what we're about to insert + current state
  const existing = await prisma.programacion.findMany({
    where: { dayOfWeek },
    select: { id: true, dayOfWeek: true, brandId: true, lineaId: true, generoId: true },
  });
  console.log("[POST /api/programacion] inserting:", { dayOfWeek, resolvedBrandId, lineaId, resolvedGeneroId, scope });
  console.log("[POST /api/programacion] existing records for day", dayOfWeek, ":", JSON.stringify(existing));

  try {
    const item = await prisma.programacion.create({
      data: {
        dayOfWeek,
        scope,
        brandId: resolvedBrandId,
        lineaId,
        generoId: resolvedGeneroId,
        tiendas:
          scope === "SOME"
            ? { create: (storeIds as string[]).map((storeId: string) => ({ storeId })) }
            : undefined,
      },
      include,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    // Prisma P2002 = unique constraint violation (duplicate schedule)
    // Prisma P2003 = foreign key constraint (invalid brand/linea/genero ID)
    const code = (err as { code?: string })?.code;
    console.error("[POST /api/programacion] error code:", code, err);
    if (code === "P2002") {
      return NextResponse.json({ error: "Ya existe esta combinación en ese día" }, { status: 409 });
    }
    if (code === "P2003") {
      return NextResponse.json({ error: "Datos inválidos: recarga la página e intenta de nuevo" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

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
  } catch {
    return NextResponse.json({ error: "Ya existe esta combinación en ese día" }, { status: 409 });
  }
}

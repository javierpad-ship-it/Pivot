export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const mundoId = req.nextUrl.searchParams.get("mundoId") ?? undefined;
  const lineas = await prisma.linea.findMany({
    where: mundoId ? { mundoId } : {},
    orderBy: [{ mundo: { name: "asc" } }, { name: "asc" }],
    include: { mundo: true },
  });
  return NextResponse.json(lineas);
}

export async function POST(req: NextRequest) {
  const { name, mundoId } = await req.json();
  if (!name?.trim() || !mundoId) {
    return NextResponse.json({ error: "Nombre y mundoId son requeridos" }, { status: 400 });
  }
  const existing = await prisma.linea.findUnique({
    where: { name_mundoId: { name: name.trim(), mundoId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya existe esa línea en este mundo" }, { status: 409 });
  }
  const linea = await prisma.linea.create({
    data: { name: name.trim(), mundoId },
    include: { mundo: true },
  });
  return NextResponse.json(linea, { status: 201 });
}

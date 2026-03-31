import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const mundos = await prisma.mundo.findMany({
    orderBy: { name: "asc" },
    include: { lineas: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(mundos);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }
  const existing = await prisma.mundo.findUnique({ where: { name: name.trim() } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe un mundo con ese nombre" }, { status: 409 });
  }
  const mundo = await prisma.mundo.create({ data: { name: name.trim() } });
  return NextResponse.json(mundo, { status: 201 });
}

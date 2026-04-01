export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const generos = await prisma.genero.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(generos);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
  }
  try {
    const genero = await prisma.genero.create({ data: { name: name.trim() } });
    return NextResponse.json(genero, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe un género con ese nombre" }, { status: 409 });
  }
}

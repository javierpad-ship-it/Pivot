export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const zonas = await prisma.zona.findMany({
    orderBy: { name: "asc" },
    include: { stores: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(zonas);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  try {
    const zona = await prisma.zona.create({ data: { name: name.trim() } });
    return NextResponse.json({ ...zona, stores: [] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe una zona con ese nombre" }, { status: 409 });
  }
}

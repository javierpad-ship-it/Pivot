export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const empresas = await prisma.empresa.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(empresas);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  try {
    const empresa = await prisma.empresa.create({ data: { name: name.trim() } });
    return NextResponse.json(empresa, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe una empresa con ese nombre" }, { status: 409 });
  }
}

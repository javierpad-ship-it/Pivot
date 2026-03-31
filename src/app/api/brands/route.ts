import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }
  const existing = await prisma.brand.findUnique({ where: { name: name.trim() } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 409 });
  }
  const brand = await prisma.brand.create({ data: { name: name.trim() } });
  return NextResponse.json(brand, { status: 201 });
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [brands, generos, lineas, prog] = await Promise.all([
    prisma.brand.findMany({ select: { id: true, name: true } }),
    prisma.genero.findMany({ select: { id: true, name: true } }),
    prisma.linea.findMany({ select: { id: true, name: true } }),
    prisma.programacion.findMany({ select: { id: true, dayOfWeek: true, brandId: true, lineaId: true, generoId: true } }),
  ]);
  return NextResponse.json({ brands, generos, lineas, programaciones: prog });
}

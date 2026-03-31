import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const lineas = await prisma.linea.findMany({
    orderBy: [{ mundo: { name: "asc" } }, { name: "asc" }],
    include: { mundo: true },
  });
  return NextResponse.json(lineas);
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stores = await prisma.store.findMany({
    orderBy: { name: "asc" },
    include: { empresa: true, zona: true },
  });
  return NextResponse.json(stores);
}

export async function POST(req: NextRequest) {
  const { name, distrito, ciudad, empresaId, direccion, latitud, longitud } = await req.json();
  if (!name?.trim() || !distrito?.trim() || !ciudad?.trim()) {
    return NextResponse.json({ error: "Nombre, distrito y ciudad son requeridos" }, { status: 400 });
  }
  const store = await prisma.store.create({
    data: {
      name: name.trim(),
      distrito: distrito.trim(),
      ciudad: ciudad.trim(),
      empresaId: empresaId || null,
      direccion: direccion?.trim() || null,
      latitud: latitud !== undefined && latitud !== "" && latitud !== null ? Number(latitud) : null,
      longitud: longitud !== undefined && longitud !== "" && longitud !== null ? Number(longitud) : null,
    },
    include: { empresa: true, zona: true },
  });
  return NextResponse.json(store, { status: 201 });
}

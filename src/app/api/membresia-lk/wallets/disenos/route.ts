export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const disenos = await prisma.membresiaDisenoTarjeta.findMany({
    orderBy: [{ tipo: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(disenos);
}

export async function POST(req: NextRequest) {
  const {
    nombre,
    tipo,
    nombrePrograma,
    descripcion,
    logoUrl,
    heroImageUrl,
    colorFondo,
    colorTexto,
    totalEstampitas,
    premioDescripcion,
    beneficioBronce,
    beneficioPlata,
    beneficioOro,
    beneficioPlatino,
    activo,
  } = await req.json();

  if (!nombre?.trim() || !nombrePrograma?.trim()) {
    return NextResponse.json({ error: "Nombre y nombre del programa son requeridos" }, { status: 400 });
  }
  if (!["PUNTOS", "ESTAMPITAS"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo de tarjeta inválido" }, { status: 400 });
  }
  if (tipo === "ESTAMPITAS" && (!totalEstampitas || Number(totalEstampitas) <= 0)) {
    return NextResponse.json({ error: "El total de estampitas debe ser mayor a 0" }, { status: 400 });
  }

  const data = {
    nombre: nombre.trim(),
    tipo,
    nombrePrograma: nombrePrograma.trim(),
    descripcion: descripcion?.trim() || null,
    logoUrl: logoUrl?.trim() || null,
    heroImageUrl: heroImageUrl?.trim() || null,
    colorFondo: colorFondo?.trim() || "#1a73e8",
    colorTexto: colorTexto?.trim() || "#ffffff",
    totalEstampitas: tipo === "ESTAMPITAS" ? Number(totalEstampitas) : null,
    premioDescripcion: tipo === "ESTAMPITAS" ? premioDescripcion?.trim() || null : null,
    beneficioBronce: tipo === "PUNTOS" ? beneficioBronce?.trim() || null : null,
    beneficioPlata: tipo === "PUNTOS" ? beneficioPlata?.trim() || null : null,
    beneficioOro: tipo === "PUNTOS" ? beneficioOro?.trim() || null : null,
    beneficioPlatino: tipo === "PUNTOS" ? beneficioPlatino?.trim() || null : null,
    activo: !!activo,
  };

  const diseno = await prisma.$transaction(async (tx) => {
    if (data.activo) {
      await tx.membresiaDisenoTarjeta.updateMany({
        where: { tipo, activo: true },
        data: { activo: false },
      });
    }
    return tx.membresiaDisenoTarjeta.create({ data });
  });

  return NextResponse.json(diseno, { status: 201 });
}

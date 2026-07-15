export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const existente = await prisma.membresiaDisenoTarjeta.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "Diseño no encontrado" }, { status: 404 });

  const {
    nombre,
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
  if (existente.tipo === "ESTAMPITAS" && (!totalEstampitas || Number(totalEstampitas) <= 0)) {
    return NextResponse.json({ error: "El total de estampitas debe ser mayor a 0" }, { status: 400 });
  }

  const data = {
    nombre: nombre.trim(),
    nombrePrograma: nombrePrograma.trim(),
    descripcion: descripcion?.trim() || null,
    logoUrl: logoUrl?.trim() || null,
    heroImageUrl: heroImageUrl?.trim() || null,
    colorFondo: colorFondo?.trim() || "#1a73e8",
    colorTexto: colorTexto?.trim() || "#ffffff",
    totalEstampitas: existente.tipo === "ESTAMPITAS" ? Number(totalEstampitas) : null,
    premioDescripcion: existente.tipo === "ESTAMPITAS" ? premioDescripcion?.trim() || null : null,
    beneficioBronce: existente.tipo === "PUNTOS" ? beneficioBronce?.trim() || null : null,
    beneficioPlata: existente.tipo === "PUNTOS" ? beneficioPlata?.trim() || null : null,
    beneficioOro: existente.tipo === "PUNTOS" ? beneficioOro?.trim() || null : null,
    beneficioPlatino: existente.tipo === "PUNTOS" ? beneficioPlatino?.trim() || null : null,
    activo: !!activo,
  };

  const diseno = await prisma.$transaction(async (tx) => {
    if (data.activo) {
      await tx.membresiaDisenoTarjeta.updateMany({
        where: { tipo: existente.tipo, activo: true, id: { not: params.id } },
        data: { activo: false },
      });
    }
    return tx.membresiaDisenoTarjeta.update({ where: { id: params.id }, data });
  });

  return NextResponse.json(diseno);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const clientes = await prisma.membresiaCliente.count({ where: { walletDisenoId: params.id } });
  if (clientes > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: hay clientes con tarjetas de este diseño" },
      { status: 409 }
    );
  }
  await prisma.membresiaDisenoTarjeta.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

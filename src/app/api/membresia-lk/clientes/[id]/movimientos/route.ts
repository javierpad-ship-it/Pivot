export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularNivel, calcularPuntosPorCompra } from "@/lib/membresia-lk-constants";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { tipo, montoCompra, puntos, descripcion } = await req.json();

  if (!["COMPRA", "CANJE", "AJUSTE"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo de movimiento inválido" }, { status: 400 });
  }

  try {
    const cliente = await prisma.$transaction(async (tx) => {
      const actual = await tx.membresiaCliente.findUnique({ where: { id: params.id } });
      if (!actual) throw new Error("Cliente no encontrado");

      let puntosMovimiento: number;
      let montoCompraFinal: number | null = null;

      if (tipo === "COMPRA") {
        const monto = Number(montoCompra);
        if (!monto || monto <= 0) throw new Error("El monto de la compra debe ser mayor a 0");
        puntosMovimiento = calcularPuntosPorCompra(monto);
        montoCompraFinal = monto;
      } else if (tipo === "CANJE") {
        const cant = Number(puntos);
        if (!cant || cant <= 0) throw new Error("Los puntos a canjear deben ser mayores a 0");
        if (cant > actual.puntos) throw new Error("El cliente no tiene puntos suficientes");
        puntosMovimiento = -cant;
      } else {
        const cant = Number(puntos);
        if (!cant) throw new Error("Los puntos del ajuste no pueden ser 0");
        puntosMovimiento = cant;
      }

      const nuevoPuntos = Math.max(0, actual.puntos + puntosMovimiento);
      const nuevoPuntosAcumulados =
        puntosMovimiento > 0 ? actual.puntosAcumulados + puntosMovimiento : actual.puntosAcumulados;

      await tx.membresiaMovimiento.create({
        data: {
          clienteId: params.id,
          tipo,
          puntos: puntosMovimiento,
          montoCompra: montoCompraFinal,
          descripcion: descripcion?.trim() || null,
        },
      });

      return tx.membresiaCliente.update({
        where: { id: params.id },
        data: {
          puntos: nuevoPuntos,
          puntosAcumulados: nuevoPuntosAcumulados,
          nivel: calcularNivel(nuevoPuntosAcumulados),
        },
        include: { store: true, movimientos: { orderBy: { createdAt: "desc" } } },
      });
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 });
  }
}

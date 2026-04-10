import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const usuario = await prisma.usuario.findUnique({ where: { id: params.id } });
  if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const rawPw = "1234"; // reset always to 1234 regardless of role
  await prisma.usuario.update({
    where: { id: params.id },
    data: { password: hashSync(rawPw, 10) },
  });
  return NextResponse.json({ ok: true });
}

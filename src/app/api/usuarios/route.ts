export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";

const DEFAULT_PW = "1234";
const SUPER_ADMIN_PW = "220922";

const include = {
  store: { select: { id: true, name: true } },
  zona:  { select: { id: true, name: true } },
} as const;

export async function GET() {
  const usuarios = await prisma.usuario.findMany({
    include,
    orderBy: [{ rol: "asc" }, { nombre: "asc" }],
  });
  // Never return passwords
  return NextResponse.json(usuarios.map(({ password: _, ...u }) => u));
}

export async function POST(req: NextRequest) {
  const { nombre, username, rol, storeId, zonaId } = await req.json();

  if (!nombre?.trim() || !username?.trim() || !rol) {
    return NextResponse.json({ error: "Nombre, username y rol son requeridos" }, { status: 400 });
  }
  if (rol === "TIENDA" && !storeId) {
    return NextResponse.json({ error: "Debes asignar una tienda para rol Tienda" }, { status: 400 });
  }
  if (rol === "GERENTE_ZONAL" && !zonaId) {
    return NextResponse.json({ error: "Debes asignar una zona para Gerente Zonal" }, { status: 400 });
  }

  const rawPw = rol === "SUPER_ADMIN" ? SUPER_ADMIN_PW : DEFAULT_PW;
  const password = hashSync(rawPw, 10);

  try {
    const usuario = await prisma.usuario.create({
      data: {
        nombre:   nombre.trim(),
        username: username.trim().toLowerCase(),
        password,
        rol,
        storeId: rol === "TIENDA"         ? storeId : null,
        zonaId:  rol === "GERENTE_ZONAL"  ? zonaId  : null,
      },
      include,
    });
    const { password: _, ...safe } = usuario;
    return NextResponse.json(safe, { status: 201 });
  } catch {
    return NextResponse.json({ error: "El username ya existe" }, { status: 409 });
  }
}

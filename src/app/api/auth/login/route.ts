import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compareSync } from "bcryptjs";
import { signSession, COOKIE_NAME, SessionUser } from "@/lib/session";

function roleRedirect(user: SessionUser): string {
  if (user.rol === "TIENDA") return `/store/${user.storeId}`;
  if (user.rol === "GERENTE_ZONAL") return `/zona/${user.zonaId}`;
  if (user.rol === "PROGRAMADOR") return `/hq/programacion`;
  return `/hq`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { username } });

    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const match = compareSync(password, usuario.password);
    if (!match) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const sessionUser: SessionUser = {
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
      storeId: usuario.storeId,
      zonaId: usuario.zonaId,
    };

    const token = signSession(sessionUser);
    const redirectTo = roleRedirect(sessionUser);

    const res = NextResponse.json({ ok: true, redirectTo });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

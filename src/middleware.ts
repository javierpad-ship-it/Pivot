import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest, SessionUser } from "@/lib/session";

function redirectByRole(user: SessionUser, req: NextRequest): NextResponse {
  const base = new URL(req.url).origin;
  if (user.rol === "TIENDA") return NextResponse.redirect(`${base}/store/${user.storeId}`);
  if (user.rol === "GERENTE_ZONAL") return NextResponse.redirect(`${base}/zona/${user.zonaId}`);
  if (user.rol === "PROGRAMADOR") return NextResponse.redirect(`${base}/hq/programacion`);
  return NextResponse.redirect(`${base}/hq`); // SUPER_ADMIN, ADMIN
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const user = getSessionFromRequest(req);

  // Public: /login, /api/auth/*
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    if (pathname === "/login" && user) return redirectByRole(user, req);
    return NextResponse.next();
  }

  // Root: redirect to login or to role home
  if (pathname === "/") {
    return user
      ? redirectByRole(user, req)
      : NextResponse.redirect(new URL("/login", req.url));
  }

  // No session → login
  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  // HQ routes
  if (pathname.startsWith("/hq")) {
    const hqRoles = ["SUPER_ADMIN", "ADMIN", "PROGRAMADOR"];
    if (!hqRoles.includes(user.rol)) return redirectByRole(user, req);

    // Restrict PROGRAMADOR to dashboard, programacion, reports
    if (user.rol === "PROGRAMADOR") {
      const allowed = ["/hq", "/hq/programacion", "/hq/reports"];
      const ok = allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));
      if (!ok) return NextResponse.redirect(new URL("/hq/programacion", req.url));
    }

    // Usuarios page: SUPER_ADMIN only
    if (
      pathname.startsWith("/hq/mantenimiento/usuarios") &&
      user.rol !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/hq/mantenimiento", req.url));
    }

    return NextResponse.next();
  }

  // Zona routes
  if (pathname.startsWith("/zona")) {
    if (!["SUPER_ADMIN", "GERENTE_ZONAL"].includes(user.rol)) return redirectByRole(user, req);
    if (user.rol === "GERENTE_ZONAL") {
      const zoneMatch = pathname.match(/^\/zona\/([^/]+)/);
      if (zoneMatch && zoneMatch[1] !== user.zonaId) {
        return NextResponse.redirect(new URL(`/zona/${user.zonaId}`, req.url));
      }
    }
    return NextResponse.next();
  }

  // Store routes
  if (pathname.startsWith("/store")) {
    if (!["SUPER_ADMIN", "TIENDA"].includes(user.rol)) return redirectByRole(user, req);
    if (user.rol === "TIENDA") {
      const storeMatch = pathname.match(/^\/store\/([^/]+)/);
      if (storeMatch && storeMatch[1] !== user.storeId) {
        return NextResponse.redirect(new URL(`/store/${user.storeId}`, req.url));
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

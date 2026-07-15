import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "session";

// Decode the cookie payload WITHOUT HMAC verification (Edge Runtime safe).
// Full cryptographic verification is done in Server Components (Node.js runtime).
// This is safe because the worst a forged cookie can do is trick routing;
// the Server Component will redirect the user away immediately.
function parseSessionCookie(req: NextRequest): {
  rol: string;
  storeId: string | null;
  zonaId: string | null;
} | null {
  const c = req.cookies.get(COOKIE);
  if (!c) return null;
  try {
    const dot = c.value.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = c.value.slice(0, dot);
    // base64url → base64 → JSON
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function redirectByRole(
  user: { rol: string; storeId: string | null; zonaId: string | null },
  req: NextRequest
): NextResponse {
  const base = new URL(req.url).origin;
  if (user.rol === "TIENDA") return NextResponse.redirect(`${base}/store/${user.storeId}`);
  if (user.rol === "GERENTE_ZONAL") return NextResponse.redirect(`${base}/zona/${user.zonaId}`);
  if (user.rol === "PROGRAMADOR") return NextResponse.redirect(`${base}/hq/programacion`);
  return NextResponse.redirect(`${base}/hq`);
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const user = parseSessionCookie(req);

  // Public paths — no auth needed
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    if (pathname === "/login" && user) return redirectByRole(user, req);
    return NextResponse.next();
  }

  // Root redirect
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

    // GERENTE_ZONAL can only enter HQ through descansos module
    if (user.rol === "GERENTE_ZONAL") {
      if (pathname.startsWith("/hq/descansos")) return NextResponse.next();
      return NextResponse.redirect(new URL(user.zonaId ? `/zona/${user.zonaId}` : "/login", req.url));
    }

    if (!hqRoles.includes(user.rol)) return redirectByRole(user, req);
    if (user.rol === "PROGRAMADOR") {
      const allowed = ["/hq", "/hq/programacion", "/hq/reports", "/hq/cuotas"];
      const ok = allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));
      if (!ok) return NextResponse.redirect(new URL("/hq/programacion", req.url));
    }
    if (pathname.startsWith("/hq/mantenimiento/usuarios") && user.rol !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/hq/mantenimiento", req.url));
    }
    return NextResponse.next();
  }

  // Zona routes
  if (pathname.startsWith("/zona")) {
    if (!["SUPER_ADMIN", "GERENTE_ZONAL"].includes(user.rol)) return redirectByRole(user, req);
    if (user.rol === "GERENTE_ZONAL") {
      const m = pathname.match(/^\/zona\/([^/]+)/);
      if (m && m[1] !== user.zonaId) {
        return NextResponse.redirect(new URL(`/zona/${user.zonaId}`, req.url));
      }
    }
    return NextResponse.next();
  }

  // Membresía LK routes
  if (pathname.startsWith("/membresia-lk")) {
    if (!["SUPER_ADMIN", "ADMIN", "TIENDA"].includes(user.rol)) return redirectByRole(user, req);
    if (pathname.startsWith("/membresia-lk/wallets") && !["SUPER_ADMIN", "ADMIN"].includes(user.rol)) {
      return NextResponse.redirect(new URL("/membresia-lk", req.url));
    }
    return NextResponse.next();
  }

  // Store routes
  if (pathname.startsWith("/store")) {
    if (!["SUPER_ADMIN", "TIENDA"].includes(user.rol)) return redirectByRole(user, req);
    if (user.rol === "TIENDA") {
      const m = pathname.match(/^\/store\/([^/]+)/);
      if (m && m[1] !== user.storeId) {
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

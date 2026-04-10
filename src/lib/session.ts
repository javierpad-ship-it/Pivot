import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export type SessionUser = {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  storeId: string | null;
  zonaId: string | null;
};

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-in-prod";
const COOKIE = "session";

export function signSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySession(value: string): SessionUser | null {
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  } catch {
    return null;
  }
  return JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionUser;
}

// For Server Components and Route Handlers (cookies() is sync in Next.js 14)
export function getSession(): SessionUser | null {
  try {
    const c = cookies().get(COOKIE);
    return c ? verifySession(c.value) : null;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const c = req.cookies.get(COOKIE);
  return c ? verifySession(c.value) : null;
}

export const COOKIE_NAME = COOKIE;

// Server Components only — do NOT import this from middleware or client components
import { cookies } from "next/headers";
import { verifySession, COOKIE_NAME, type SessionUser } from "./session";

export type { SessionUser };

export function getSession(): SessionUser | null {
  try {
    const c = cookies().get(COOKIE_NAME);
    return c ? verifySession(c.value) : null;
  } catch {
    return null;
  }
}

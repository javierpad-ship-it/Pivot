import { redirect } from "next/navigation";
import { getSession } from "@/lib/session-server";
import { HQShell } from "@/components/hq/HQShell";

export const dynamic = "force-dynamic";

export default async function HQLayout({ children }: { children: React.ReactNode }) {
  const user = getSession();
  if (!user) redirect("/login");

  const hqRoles = ["SUPER_ADMIN", "ADMIN", "PROGRAMADOR", "GERENTE_ZONAL"];
  if (!hqRoles.includes(user.rol)) {
    if (user.rol === "TIENDA") redirect(`/store/${user.storeId}`);
    redirect("/login");
  }

  return <HQShell user={user}>{children}</HQShell>;
}

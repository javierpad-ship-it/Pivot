import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { HQShell } from "@/components/hq/HQShell";

export default async function HQLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const hqRoles = ["SUPER_ADMIN", "ADMIN", "PROGRAMADOR"];
  if (!hqRoles.includes(user.rol)) {
    if (user.rol === "TIENDA") redirect(`/store/${user.storeId}`);
    if (user.rol === "GERENTE_ZONAL") redirect(`/zona/${user.zonaId}`);
    redirect("/login");
  }

  return <HQShell user={user}>{children}</HQShell>;
}

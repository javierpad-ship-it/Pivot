import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Home() {
  const user = await getSession();

  if (!user) redirect("/login");

  if (user.rol === "TIENDA") redirect(`/store/${user.storeId}`);
  if (user.rol === "GERENTE_ZONAL") redirect(`/zona/${user.zonaId}`);
  if (user.rol === "PROGRAMADOR") redirect("/hq/programacion");
  redirect("/hq");
}

import { prisma } from "@/lib/prisma";
import { CuotasClient } from "@/components/hq/CuotasClient";

export const dynamic = "force-dynamic";

export default async function CuotasPage() {
  const stores = await prisma.store.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, distrito: true },
  });
  return <CuotasClient stores={stores} />;
}

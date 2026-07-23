import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";
import { WalletDisenosClient } from "@/components/membresia-lk/WalletDisenosClient";

export const dynamic = "force-dynamic";

export default async function WalletDisenosPage() {
  const user = getSession()!;
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.rol)) redirect("/membresia-lk");

  const disenos = await prisma.membresiaDisenoTarjeta.findMany({
    orderBy: [{ tipo: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-brand text-2xl font-black text-gray-900">Diseños de tarjeta</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define cómo se ven las tarjetas de Membresía LK en Google Wallet y Apple Wallet
          </p>
        </div>
        <Link
          href="/membresia-lk/wallets/configuracion"
          className="flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Configuración de credenciales →
        </Link>
      </div>
      <WalletDisenosClient disenos={disenos} />
    </div>
  );
}

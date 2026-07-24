import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session-server";
import { WalletConfigClient } from "@/components/membresia-lk/WalletConfigClient";

export const dynamic = "force-dynamic";

export default async function WalletConfigPage() {
  const user = getSession()!;
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.rol)) redirect("/membresia-lk");

  const config = await prisma.membresiaWalletConfig.findFirst();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-brand text-2xl font-black text-gray-900">Configuración de Wallets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Credenciales de integración con Google Wallet y Apple Wallet. Los secretos se guardan cifrados y nunca
          se muestran de nuevo en pantalla.
        </p>
      </div>
      <WalletConfigClient
        initial={{
          googleIssuerId: config?.googleIssuerId ?? "",
          googleServiceAccountConfigurado: !!config?.googleServiceAccountJsonEnc,
          appleTeamId: config?.appleTeamId ?? "",
          applePassTypeId: config?.applePassTypeId ?? "",
          appleCertConfigurado: !!config?.appleCertP12Enc,
        }}
      />
    </div>
  );
}

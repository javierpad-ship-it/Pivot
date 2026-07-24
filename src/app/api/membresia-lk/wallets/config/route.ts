export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/wallet-crypto";

// Nunca se devuelven los secretos en texto plano — solo si están configurados o no.
export async function GET() {
  const config = await prisma.membresiaWalletConfig.findFirst();
  return NextResponse.json({
    googleIssuerId: config?.googleIssuerId ?? null,
    googleServiceAccountConfigurado: !!config?.googleServiceAccountJsonEnc,
    appleTeamId: config?.appleTeamId ?? null,
    applePassTypeId: config?.applePassTypeId ?? null,
    appleCertConfigurado: !!config?.appleCertP12Enc,
    updatedAt: config?.updatedAt ?? null,
  });
}

export async function PUT(req: NextRequest) {
  const { googleIssuerId, googleServiceAccountJson, appleTeamId, applePassTypeId, appleCertP12Base64, appleCertPassword } =
    await req.json();

  let data: Record<string, unknown>;
  try {
    data = {
      googleIssuerId: googleIssuerId?.trim() || null,
      appleTeamId: appleTeamId?.trim() || null,
      applePassTypeId: applePassTypeId?.trim() || null,
      ...(googleServiceAccountJson?.trim()
        ? { googleServiceAccountJsonEnc: encryptSecret(googleServiceAccountJson.trim()) }
        : {}),
      ...(appleCertP12Base64?.trim() ? { appleCertP12Enc: encryptSecret(appleCertP12Base64.trim()) } : {}),
      ...(appleCertPassword?.trim() ? { appleCertPasswordEnc: encryptSecret(appleCertPassword.trim()) } : {}),
    };
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al cifrar" }, { status: 500 });
  }

  const existente = await prisma.membresiaWalletConfig.findFirst();
  const config = existente
    ? await prisma.membresiaWalletConfig.update({ where: { id: existente.id }, data })
    : await prisma.membresiaWalletConfig.create({ data });

  return NextResponse.json({
    googleIssuerId: config.googleIssuerId,
    googleServiceAccountConfigurado: !!config.googleServiceAccountJsonEnc,
    appleTeamId: config.appleTeamId,
    applePassTypeId: config.applePassTypeId,
    appleCertConfigurado: !!config.appleCertP12Enc,
    updatedAt: config.updatedAt,
  });
}

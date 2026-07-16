// Generación del enlace "Añadir a Google Wallet" (JWT firmado con RS256).
// Docs: https://developers.google.com/wallet/retail/loyalty-cards
import { createSign } from "crypto";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/wallet-crypto";
import { NIVEL_LABELS } from "@/lib/membresia-lk-constants";
import type { MembresiaCliente, MembresiaDisenoTarjeta } from "@prisma/client";

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

export async function getGoogleWalletCredentials(): Promise<{
  issuerId: string;
  serviceAccount: ServiceAccount;
} | null> {
  const config = await prisma.membresiaWalletConfig.findFirst();
  if (!config?.googleIssuerId || !config.googleServiceAccountJsonEnc) return null;
  try {
    const serviceAccount = JSON.parse(decryptSecret(config.googleServiceAccountJsonEnc)) as ServiceAccount;
    if (!serviceAccount.client_email || !serviceAccount.private_key) return null;
    return { issuerId: config.googleIssuerId.trim(), serviceAccount };
  } catch {
    return null;
  }
}

function base64url(input: Buffer | string): string {
  return (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwtRS256(payload: Record<string, unknown>, privateKey: string): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  const signature = base64url(signer.sign(privateKey));
  return `${header}.${body}.${signature}`;
}

// El sufijo de objeto solo admite [a-zA-Z0-9._-]; los cuid de Prisma ya cumplen.
function buildLoyaltyObject(
  cliente: MembresiaCliente,
  diseno: MembresiaDisenoTarjeta | null,
  issuerId: string,
  origin: string
) {
  const classSuffix = diseno?.googleClassId?.trim() || "membresialk";
  return {
    id: `${issuerId}.${cliente.id}`,
    classId: `${issuerId}.${classSuffix}`,
    state: "ACTIVE",
    accountId: cliente.dni ?? cliente.id,
    accountName: cliente.nombre,
    loyaltyPoints: {
      label: "Puntos",
      balance: { int: cliente.puntos },
    },
    secondaryLoyaltyPoints: {
      label: "Nivel",
      balance: { string: NIVEL_LABELS[cliente.nivel] ?? cliente.nivel },
    },
    // El QR lleva el portalToken: sirve para escanear al cliente en caja
    // y abre la misma identidad que el portal web.
    barcode: {
      type: "QR_CODE",
      value: cliente.portalToken,
      alternateText: cliente.dni ?? undefined,
    },
    linksModuleData: {
      uris: [
        {
          uri: `${origin}/mi-tarjeta/${cliente.portalToken}`,
          description: "Ver mi tarjeta y beneficios",
          id: "portal",
        },
      ],
    },
  };
}

// Devuelve la URL https://pay.google.com/gp/v/save/<jwt> o null si faltan credenciales.
export async function generateSaveToGoogleWalletUrl(
  cliente: MembresiaCliente,
  diseno: MembresiaDisenoTarjeta | null,
  origin: string
): Promise<string | null> {
  const creds = await getGoogleWalletCredentials();
  if (!creds) return null;

  const claims = {
    iss: creds.serviceAccount.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [origin],
    payload: {
      loyaltyObjects: [buildLoyaltyObject(cliente, diseno, creds.issuerId, origin)],
    },
  };

  try {
    const jwt = signJwtRS256(claims, creds.serviceAccount.private_key);
    return `https://pay.google.com/gp/v/save/${jwt}`;
  } catch {
    return null;
  }
}

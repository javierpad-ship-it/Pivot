// Cifrado en reposo para credenciales de Google/Apple Wallet guardadas en MembresiaWalletConfig.
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const RAW_KEY = process.env.WALLET_SECRETS_KEY;

function getKey(): Buffer {
  if (!RAW_KEY) {
    throw new Error(
      "WALLET_SECRETS_KEY no está configurada. Genera una con: openssl rand -hex 32"
    );
  }
  // Acepta una clave hex de 64 caracteres (32 bytes); si no, deriva una de 32 bytes con scrypt.
  if (/^[0-9a-f]{64}$/i.test(RAW_KEY)) return Buffer.from(RAW_KEY, "hex");
  return scryptSync(RAW_KEY, "membresia-lk-wallet", 32);
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decryptSecret(encrypted: string): string {
  const raw = Buffer.from(encrypted, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

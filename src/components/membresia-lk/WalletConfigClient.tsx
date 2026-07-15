"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface Initial {
  googleIssuerId: string;
  googleServiceAccountConfigurado: boolean;
  appleTeamId: string;
  applePassTypeId: string;
  appleCertConfigurado: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function WalletConfigClient({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [googleIssuerId, setGoogleIssuerId] = useState(initial.googleIssuerId);
  const [googleServiceAccountJson, setGoogleServiceAccountJson] = useState("");
  const [googleConfigurado, setGoogleConfigurado] = useState(initial.googleServiceAccountConfigurado);

  const [appleTeamId, setAppleTeamId] = useState(initial.appleTeamId);
  const [applePassTypeId, setApplePassTypeId] = useState(initial.applePassTypeId);
  const [appleCertFile, setAppleCertFile] = useState<File | null>(null);
  const [appleCertPassword, setAppleCertPassword] = useState("");
  const [appleConfigurado, setAppleConfigurado] = useState(initial.appleCertConfigurado);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const appleCertP12Base64 = appleCertFile ? await fileToBase64(appleCertFile) : undefined;
      const res = await fetch("/api/membresia-lk/wallets/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleIssuerId,
          googleServiceAccountJson: googleServiceAccountJson || undefined,
          appleTeamId,
          applePassTypeId,
          appleCertP12Base64,
          appleCertPassword: appleCertPassword || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setGoogleConfigurado(updated.googleServiceAccountConfigurado);
      setAppleConfigurado(updated.appleCertConfigurado);
      setGoogleServiceAccountJson("");
      setAppleCertFile(null);
      setAppleCertPassword("");
      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Google Wallet</h2>
          {googleConfigurado && <Badge variant="green">Service account configurado</Badge>}
        </CardHeader>
        <CardBody className="space-y-3">
          <Input
            label="Issuer ID"
            placeholder="Ej: 3388000000022xxxxxx"
            value={googleIssuerId}
            onChange={(e) => setGoogleIssuerId(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              JSON del Service Account {googleConfigurado && "(dejar vacío para no reemplazarlo)"}
            </label>
            <textarea
              rows={4}
              placeholder={googleConfigurado ? "•••••• (ya configurado)" : '{ "type": "service_account", ... }'}
              value={googleServiceAccountJson}
              onChange={(e) => setGoogleServiceAccountJson(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Apple Wallet</h2>
          {appleConfigurado && <Badge variant="green">Certificado configurado</Badge>}
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Team ID"
              placeholder="Ej: ABCDE12345"
              value={appleTeamId}
              onChange={(e) => setAppleTeamId(e.target.value)}
            />
            <Input
              label="Pass Type Identifier"
              placeholder="Ej: pass.pe.lukers.membresia"
              value={applePassTypeId}
              onChange={(e) => setApplePassTypeId(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Certificado (.p12) {appleConfigurado && "(dejar vacío para no reemplazarlo)"}
            </label>
            <input
              type="file"
              accept=".p12"
              onChange={(e) => setAppleCertFile(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-600"
            />
          </div>
          <Input
            label="Contraseña del certificado"
            type="password"
            placeholder={appleConfigurado ? "•••••• (ya configurada)" : ""}
            value={appleCertPassword}
            onChange={(e) => setAppleCertPassword(e.target.value)}
          />
        </CardBody>
      </Card>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          Configuración guardada correctamente
        </p>
      )}
      <Button type="submit" loading={loading}>Guardar configuración</Button>
    </form>
  );
}

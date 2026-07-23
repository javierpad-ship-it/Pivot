import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NIVEL_LABELS, NIVEL_UMBRALES, calcularProgresoNivel, TIPO_MOVIMIENTO_LABELS } from "@/lib/membresia-lk-constants";
import { generateSaveToGoogleWalletUrl } from "@/lib/google-wallet";
import { GlassCard } from "@/components/membresia-lk/GlassCard";
import { WalletCardPreview } from "@/components/membresia-lk/WalletCardPreview";

export const dynamic = "force-dynamic";

interface Props {
  params: { token: string };
}

const NIVEL_ORDEN_ASC = [...NIVEL_UMBRALES].reverse().map((n) => n.nivel);

// Colores de las píldoras de movimiento, ajustados para leerse sobre vidrio oscuro
const TIPO_MOVIMIENTO_GLASS: Record<string, string> = {
  COMPRA: "bg-green-400/15 text-green-300 border border-green-400/20",
  CANJE: "bg-red-400/15 text-red-300 border border-red-400/20",
  AJUSTE: "bg-blue-400/15 text-blue-300 border border-blue-400/20",
  SELLO: "bg-green-400/15 text-green-300 border border-green-400/20",
  PREMIO: "bg-purple-400/15 text-purple-300 border border-purple-400/20",
};

export default async function MiTarjetaPage({ params }: Props) {
  const cliente = await prisma.membresiaCliente.findUnique({
    where: { portalToken: params.token },
    include: { movimientos: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!cliente) notFound();

  if (!cliente.activo) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center p-6"
        style={{ background: "linear-gradient(135deg, #050a14 0%, #0a1628 50%, #050a14 100%)" }}
      >
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgb(0,140,255) 0%, transparent 70%)" }}
        />
        <GlassCard className="max-w-sm text-center relative z-10">
          <p className="text-lg font-semibold text-white">Membresía inactiva</p>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
            Tu membresía no está activa en este momento. Comunícate con la tienda para más información.
          </p>
        </GlassCard>
      </div>
    );
  }

  const [disenoPuntos, disenoEstampitas] = await Promise.all([
    prisma.membresiaDisenoTarjeta.findFirst({ where: { tipo: "PUNTOS", activo: true } }),
    prisma.membresiaDisenoTarjeta.findFirst({ where: { tipo: "ESTAMPITAS", activo: true } }),
  ]);

  const { siguiente, porcentaje } = calcularProgresoNivel(cliente.puntosAcumulados);
  const nombrePrograma = disenoPuntos?.nombrePrograma ?? "Membresía LK";
  const colorAcento = disenoPuntos?.colorFondo ?? "rgb(0,140,255)";

  const beneficiosPorNivel: Record<string, string | null> = {
    BRONCE: disenoPuntos?.beneficioBronce ?? null,
    PLATA: disenoPuntos?.beneficioPlata ?? null,
    ORO: disenoPuntos?.beneficioOro ?? null,
    PLATINO: disenoPuntos?.beneficioPlatino ?? null,
  };

  const nivelActualIdx = NIVEL_ORDEN_ASC.indexOf(cliente.nivel);
  const mostrarEstampitas = disenoEstampitas && (cliente.estampitas > 0 || cliente.premiosCanjeados > 0);

  const host = headers().get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const googleWalletUrl = await generateSaveToGoogleWalletUrl(cliente, disenoPuntos, `${protocol}://${host}`);

  return (
    <div
      className="min-h-screen relative overflow-hidden p-4 sm:p-8"
      style={{ background: "linear-gradient(135deg, #050a14 0%, #0a1628 50%, #050a14 100%)" }}
    >
      {/* Glow blobs de fondo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[28rem] h-[28rem] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${colorAcento} 0%, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-[110px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(0,140,255) 0%, transparent 70%)" }}
      />

      <div className="max-w-md mx-auto space-y-5 relative z-10">
        <WalletCardPreview
          tipo="PUNTOS"
          nombrePrograma={nombrePrograma}
          logoUrl={disenoPuntos?.logoUrl ?? null}
          colorAcento={colorAcento}
          nombreCliente={cliente.nombre}
          puntos={cliente.puntos}
          nivelLabel={NIVEL_LABELS[cliente.nivel] ?? cliente.nivel}
          porcentaje={porcentaje}
          notaProgreso={
            siguiente
              ? `${siguiente.minPuntos - cliente.puntosAcumulados} puntos para llegar a ${NIVEL_LABELS[siguiente.nivel]}`
              : "Nivel máximo alcanzado"
          }
        />

        {/* Añadir a Google Wallet */}
        {googleWalletUrl && (
          <a
            href={googleWalletUrl}
            className="flex items-center justify-center gap-2.5 w-full rounded-full py-3 px-5 font-medium text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: "#000", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M3 7a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H6a3 3 0 01-3-3V7z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17" cy="14.5" r="1.4" fill="currentColor" />
            </svg>
            Añadir a Google Wallet
          </a>
        )}

        {/* Beneficios por nivel */}
        <GlassCard>
          <h2 className="font-brand text-sm font-bold text-white mb-4">Beneficios por nivel</h2>
          <div className="space-y-2.5">
            {NIVEL_ORDEN_ASC.map((nivel, idx) => {
              const alcanzado = idx <= nivelActualIdx;
              return (
                <div
                  key={nivel}
                  className="flex items-start gap-3 rounded-xl p-3 transition-colors"
                  style={{
                    background: alcanzado ? `color-mix(in srgb, ${colorAcento} 12%, transparent)` : "rgba(255,255,255,0.02)",
                    border: alcanzado
                      ? `1px solid color-mix(in srgb, ${colorAcento} 25%, transparent)`
                      : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: alcanzado ? colorAcento : "rgba(255,255,255,0.2)" }}
                  />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: alcanzado ? "#fff" : "rgba(255,255,255,0.35)" }}
                    >
                      {NIVEL_LABELS[nivel]}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {beneficiosPorNivel[nivel] ?? "Beneficio por confirmar"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Tarjeta de sellos, si aplica */}
        {mostrarEstampitas && disenoEstampitas && (
          <GlassCard>
            <h2 className="font-brand text-sm font-bold text-white mb-1">Tarjeta de sellos</h2>
            <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Premio: {disenoEstampitas.premioDescripcion ?? "—"}
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: disenoEstampitas.totalEstampitas ?? 0 }).map((_, i) => (
                <span
                  key={i}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={
                    i < cliente.estampitas
                      ? { background: "rgba(34,197,94,0.9)", color: "#fff" }
                      : { border: "2px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.2)" }
                  }
                >
                  {i < cliente.estampitas ? "✓" : ""}
                </span>
              ))}
            </div>
            {cliente.premiosCanjeados > 0 && (
              <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                Premios canjeados: {cliente.premiosCanjeados}
              </p>
            )}
          </GlassCard>
        )}

        {/* Historial reciente */}
        <GlassCard className="!p-0 overflow-hidden">
          <h2 className="font-brand text-sm font-bold text-white p-5 pb-3">Historial reciente</h2>
          <div>
            {cliente.movimientos.length === 0 ? (
              <p className="px-5 pb-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                Sin movimientos aún
              </p>
            ) : (
              cliente.movimientos.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                  style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined }}
                >
                  <div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        TIPO_MOVIMIENTO_GLASS[m.tipo] ?? "bg-white/10 text-white/70"
                      }`}
                    >
                      {TIPO_MOVIMIENTO_LABELS[m.tipo] ?? m.tipo}
                    </span>
                    {m.descripcion && (
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {m.descripcion}
                      </p>
                    )}
                  </div>
                  <span
                    className="font-semibold"
                    style={{ color: m.puntos < 0 ? "rgb(248,113,113)" : "rgb(74,222,128)" }}
                  >
                    {m.puntos > 0 ? `+${m.puntos}` : m.puntos}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <p className="font-brand text-center text-xs tracking-widest uppercase pt-2 pb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
          Lukers · Membresía LK
        </p>
      </div>
    </div>
  );
}

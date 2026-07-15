import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NIVEL_LABELS, NIVEL_UMBRALES, calcularProgresoNivel, TIPO_MOVIMIENTO_LABELS } from "@/lib/membresia-lk-constants";

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

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

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
        {/* Marca */}
        <div className="text-center pt-2 pb-1">
          {disenoPuntos?.logoUrl ? (
            <div className="inline-flex items-center justify-center bg-white rounded-2xl px-6 py-3 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={disenoPuntos.logoUrl} alt={nombrePrograma} className="h-6 object-contain" />
            </div>
          ) : (
            <p className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
              {nombrePrograma}
            </p>
          )}
        </div>

        {/* Tarjeta principal */}
        <GlassCard>
          <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
            {nombrePrograma}
          </p>
          <h1 className="text-xl font-bold mt-1 text-white">{cliente.nombre}</h1>

          <div className="flex items-end justify-between mt-6">
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Puntos disponibles
              </p>
              <p className="text-4xl font-bold text-white mt-1">{cliente.puntos}</p>
            </div>
            <span
              className="inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {NIVEL_LABELS[cliente.nivel] ?? cliente.nivel}
            </span>
          </div>

          <div className="mt-5">
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${porcentaje}%`, background: colorAcento }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              {siguiente
                ? `${siguiente.minPuntos - cliente.puntosAcumulados} puntos para llegar a ${NIVEL_LABELS[siguiente.nivel]}`
                : "Nivel máximo alcanzado"}
            </p>
          </div>
        </GlassCard>

        {/* Beneficios por nivel */}
        <GlassCard>
          <h2 className="text-sm font-semibold text-white mb-4">Beneficios por nivel</h2>
          <div className="space-y-2.5">
            {NIVEL_ORDEN_ASC.map((nivel, idx) => {
              const alcanzado = idx <= nivelActualIdx;
              return (
                <div
                  key={nivel}
                  className="flex items-start gap-3 rounded-xl p-3 transition-colors"
                  style={{
                    background: alcanzado ? "rgba(0,140,255,0.1)" : "rgba(255,255,255,0.02)",
                    border: alcanzado ? "1px solid rgba(0,140,255,0.2)" : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: alcanzado ? "rgb(0,140,255)" : "rgba(255,255,255,0.2)" }}
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
            <h2 className="text-sm font-semibold text-white mb-1">Tarjeta de sellos</h2>
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
          <h2 className="text-sm font-semibold text-white p-5 pb-3">Historial reciente</h2>
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

        <p className="text-center text-xs pt-2 pb-6" style={{ color: "rgba(255,255,255,0.25)" }}>
          Lukers · Membresía LK
        </p>
      </div>
    </div>
  );
}

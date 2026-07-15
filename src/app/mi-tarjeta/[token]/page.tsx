import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  NIVEL_LABELS,
  NIVEL_UMBRALES,
  calcularProgresoNivel,
  TIPO_MOVIMIENTO_LABELS,
  TIPO_MOVIMIENTO_COLORS,
} from "@/lib/membresia-lk-constants";

export const dynamic = "force-dynamic";

interface Props {
  params: { token: string };
}

const NIVEL_ORDEN_ASC = [...NIVEL_UMBRALES].reverse().map((n) => n.nivel);

export default async function MiTarjetaPage({ params }: Props) {
  const cliente = await prisma.membresiaCliente.findUnique({
    where: { portalToken: params.token },
    include: { movimientos: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!cliente) notFound();

  if (!cliente.activo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-gray-900">Membresía inactiva</p>
          <p className="text-sm text-gray-500 mt-2">
            Tu membresía no está activa en este momento. Comunícate con la tienda para más información.
          </p>
        </div>
      </div>
    );
  }

  const [disenoPuntos, disenoEstampitas] = await Promise.all([
    prisma.membresiaDisenoTarjeta.findFirst({ where: { tipo: "PUNTOS", activo: true } }),
    prisma.membresiaDisenoTarjeta.findFirst({ where: { tipo: "ESTAMPITAS", activo: true } }),
  ]);

  const { siguiente, porcentaje } = calcularProgresoNivel(cliente.puntosAcumulados);
  const nombrePrograma = disenoPuntos?.nombrePrograma ?? "Membresía LK";
  const colorFondo = disenoPuntos?.colorFondo ?? "#1a73e8";
  const colorTexto = disenoPuntos?.colorTexto ?? "#ffffff";

  const beneficiosPorNivel: Record<string, string | null> = {
    BRONCE: disenoPuntos?.beneficioBronce ?? null,
    PLATA: disenoPuntos?.beneficioPlata ?? null,
    ORO: disenoPuntos?.beneficioOro ?? null,
    PLATINO: disenoPuntos?.beneficioPlatino ?? null,
  };

  const nivelActualIdx = NIVEL_ORDEN_ASC.indexOf(cliente.nivel);
  const mostrarEstampitas = disenoEstampitas && (cliente.estampitas > 0 || cliente.premiosCanjeados > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-md mx-auto space-y-5">
        {/* Tarjeta visual estilo wallet */}
        <div className="rounded-2xl p-6 shadow-md" style={{ backgroundColor: colorFondo, color: colorTexto }}>
          {disenoPuntos?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={disenoPuntos.logoUrl} alt={nombrePrograma} className="h-8 mb-4 object-contain" />
          )}
          <p className="text-xs uppercase tracking-widest opacity-80">{nombrePrograma}</p>
          <h1 className="text-xl font-bold mt-1">{cliente.nombre}</h1>

          <div className="flex items-end justify-between mt-6">
            <div>
              <p className="text-xs opacity-80">Puntos disponibles</p>
              <p className="text-3xl font-bold">{cliente.puntos}</p>
            </div>
            <span
              className="inline-flex px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
            >
              {NIVEL_LABELS[cliente.nivel] ?? cliente.nivel}
            </span>
          </div>

          <div className="mt-4">
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
              <div className="h-2 rounded-full" style={{ width: `${porcentaje}%`, backgroundColor: colorTexto }} />
            </div>
            <p className="text-xs opacity-80 mt-1">
              {siguiente
                ? `${siguiente.minPuntos - cliente.puntosAcumulados} puntos para llegar a ${NIVEL_LABELS[siguiente.nivel]}`
                : "Nivel máximo alcanzado"}
            </p>
          </div>
        </div>

        {/* Beneficios por nivel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Beneficios por nivel</h2>
          <div className="space-y-3">
            {NIVEL_ORDEN_ASC.map((nivel, idx) => {
              const alcanzado = idx <= nivelActualIdx;
              return (
                <div
                  key={nivel}
                  className={`flex items-start gap-3 rounded-lg p-3 ${alcanzado ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <span
                    className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      alcanzado ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-medium ${alcanzado ? "text-blue-900" : "text-gray-500"}`}>
                      {NIVEL_LABELS[nivel]}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {beneficiosPorNivel[nivel] ?? "Beneficio por confirmar"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tarjeta de sellos, si aplica */}
        {mostrarEstampitas && disenoEstampitas && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Tarjeta de sellos</h2>
            <p className="text-xs text-gray-500 mb-3">
              Premio: {disenoEstampitas.premioDescripcion ?? "—"}
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: disenoEstampitas.totalEstampitas ?? 0 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    i < cliente.estampitas
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 text-gray-300"
                  }`}
                >
                  {i < cliente.estampitas ? "✓" : ""}
                </span>
              ))}
            </div>
            {cliente.premiosCanjeados > 0 && (
              <p className="text-xs text-gray-400 mt-3">Premios canjeados: {cliente.premiosCanjeados}</p>
            )}
          </div>
        )}

        {/* Historial reciente */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-900 p-5 pb-0">Historial reciente</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {cliente.movimientos.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-center text-gray-400 text-sm">Sin movimientos aún</td>
                  </tr>
                ) : (
                  cliente.movimientos.map((m) => (
                    <tr key={m.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                TIPO_MOVIMIENTO_COLORS[m.tipo] ?? "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {TIPO_MOVIMIENTO_LABELS[m.tipo] ?? m.tipo}
                            </span>
                            {m.descripcion && <p className="text-xs text-gray-400 mt-1">{m.descripcion}</p>}
                          </div>
                          <span className={`font-semibold ${m.puntos < 0 ? "text-red-600" : "text-green-600"}`}>
                            {m.puntos > 0 ? `+${m.puntos}` : m.puntos}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

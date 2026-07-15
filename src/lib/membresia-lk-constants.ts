// Reglas del programa de fidelización: 1 punto por cada S/ 10 de compra.
export const SOLES_POR_PUNTO = 10;

export function calcularPuntosPorCompra(montoCompra: number): number {
  return Math.floor(montoCompra / SOLES_POR_PUNTO);
}

export const NIVEL_UMBRALES: { nivel: string; minPuntos: number }[] = [
  { nivel: "PLATINO", minPuntos: 3000 },
  { nivel: "ORO", minPuntos: 1500 },
  { nivel: "PLATA", minPuntos: 500 },
  { nivel: "BRONCE", minPuntos: 0 },
];

export function calcularNivel(puntosAcumulados: number): string {
  return NIVEL_UMBRALES.find((n) => puntosAcumulados >= n.minPuntos)!.nivel;
}

const NIVEL_ORDEN_ASC = [...NIVEL_UMBRALES].reverse();

export function calcularProgresoNivel(puntosAcumulados: number): {
  siguiente: { nivel: string; minPuntos: number } | null;
  porcentaje: number;
} {
  const siguiente = NIVEL_ORDEN_ASC.find((n) => n.minPuntos > puntosAcumulados);
  if (!siguiente) return { siguiente: null, porcentaje: 100 };
  const actualIdx = NIVEL_ORDEN_ASC.findIndex((n) => n.nivel === siguiente.nivel) - 1;
  const base = actualIdx >= 0 ? NIVEL_ORDEN_ASC[actualIdx].minPuntos : 0;
  const rango = siguiente.minPuntos - base;
  const porcentaje = Math.min(100, Math.round(((puntosAcumulados - base) / rango) * 100));
  return { siguiente, porcentaje };
}

export const NIVEL_LABELS: Record<string, string> = {
  BRONCE: "Bronce",
  PLATA: "Plata",
  ORO: "Oro",
  PLATINO: "Platino",
};

export const NIVEL_COLORS: Record<string, string> = {
  BRONCE: "bg-orange-100 text-orange-800",
  PLATA: "bg-gray-100 text-gray-700",
  ORO: "bg-yellow-100 text-yellow-800",
  PLATINO: "bg-blue-100 text-blue-800",
};

export const NIVEL_OPTIONS = Object.entries(NIVEL_LABELS).map(([value, label]) => ({ value, label }));

// Variant accepted by the shared <Badge> component (green|yellow|red|blue|gray)
export const NIVEL_BADGE_VARIANT: Record<string, "green" | "yellow" | "red" | "blue" | "gray"> = {
  BRONCE: "gray",
  PLATA: "blue",
  ORO: "yellow",
  PLATINO: "green",
};

export const TIPO_MOVIMIENTO_LABELS: Record<string, string> = {
  COMPRA: "Compra",
  CANJE: "Canje",
  AJUSTE: "Ajuste",
  SELLO: "Sello",
  PREMIO: "Premio canjeado",
};

export const TIPO_MOVIMIENTO_COLORS: Record<string, string> = {
  COMPRA: "bg-green-100 text-green-800",
  CANJE: "bg-red-100 text-red-700",
  AJUSTE: "bg-blue-100 text-blue-800",
  SELLO: "bg-green-100 text-green-800",
  PREMIO: "bg-purple-100 text-purple-700",
};

// ─── DISEÑOS DE TARJETA (Google/Apple Wallet) ───────────────────────────────

export const TIPO_TARJETA_LABELS: Record<string, string> = {
  PUNTOS: "Puntos",
  ESTAMPITAS: "Estampitas",
};

export const TIPO_TARJETA_OPTIONS = Object.entries(TIPO_TARJETA_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const TIPO_TARJETA_BADGE_VARIANT: Record<string, "green" | "yellow" | "red" | "blue" | "gray"> = {
  PUNTOS: "blue",
  ESTAMPITAS: "green",
};

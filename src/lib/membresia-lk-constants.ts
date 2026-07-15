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
};

export const TIPO_MOVIMIENTO_COLORS: Record<string, string> = {
  COMPRA: "bg-green-100 text-green-800",
  CANJE: "bg-red-100 text-red-700",
  AJUSTE: "bg-blue-100 text-blue-800",
};

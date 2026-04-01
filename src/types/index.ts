export type TaskStatus = "PENDING" | "COMPLETED";

export interface Store {
  id: string;
  name: string;
  distrito: string;
  ciudad: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Mundo {
  id: string;
  name: string;
}

export interface Linea {
  id: string;
  name: string;
  mundoId: string;
  mundo: Mundo;
}

export interface CountRecord {
  id: string;
  taskId: string;
  quantity: number;
  employeeName: string;
  countedAt: string;
}

export interface CountTask {
  id: string;
  storeId: string;
  brandId: string;
  lineaId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  store: Store;
  brand: Brand;
  linea: Linea;
  countRecord: CountRecord | null;
}

export interface ReportRow {
  taskId: string;
  store: { id: string; name: string; distrito: string; ciudad: string };
  brand: { id: string; name: string };
  mundo: { id: string; name: string };
  linea: { id: string; name: string };
  countedQuantity: number;
  systemQuantity: number | null;
  discrepancy: number | null;
  discrepancyPercent: number | null;
  employeeName: string;
  countedAt: string;
}

export type TaskStatus = "PENDING" | "COMPLETED";

export interface Store {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface ItemCategory {
  id: string;
  name: string;
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
  categoryId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  store: Store;
  brand: Brand;
  category: ItemCategory;
  countRecord: CountRecord | null;
}

export interface SystemStock {
  id: string;
  storeId: string;
  brandId: string;
  categoryId: string;
  systemQuantity: number;
  store: Store;
  brand: Brand;
  category: ItemCategory;
}

export interface ReportRow {
  taskId: string;
  store: { id: string; name: string; location: string };
  brand: { id: string; name: string };
  category: { id: string; name: string };
  countedQuantity: number;
  systemQuantity: number | null;
  discrepancy: number | null;
  discrepancyPercent: number | null;
  employeeName: string;
  countedAt: string;
}

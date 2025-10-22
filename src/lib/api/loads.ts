import { apiFetch } from "./client";

export interface LoadShipment {
  id: string;
  shipmentId: string;
  loadId: string;
  shipment?: { id: string; numeroNf: string };
}

export interface Load {
  id: string;
  codigo: string;
  status: "ABERTA" | "EM_SEPARACAO" | "FECHADA" | "CANCELADA";
  carrierId: string | null;
  createdAt: string;
  updatedAt: string;
  shipments: LoadShipment[];
  carrier?: { id: string; nome: string } | null;
}

export interface CreateLoadInput {
  carrierId?: string;
  shipmentIds: string[];
}

export interface ListLoadsParams {
  status?: Load["status"];
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListLoadsResponse {
  data: Load[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function createLoad(data: CreateLoadInput) {
  return apiFetch<Load>("/loads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listLoads(params?: ListLoadsParams) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  return apiFetch<ListLoadsResponse>(
    `/loads${sp.size ? `?${sp.toString()}` : ""}`
  );
}

export async function getLoad(id: string) {
  return apiFetch<Load>(`/loads/${id}`);
}

export type AddressSelection =
  | "PICKING_FIRST"
  | "STORAGE_FIRST"
  | "ONLY_PICKING"
  | "ONLY_STORAGE";
export type StockSorting = "FEFO" | "FIFO" | "NONE";
export type SplitMode = "BY_ITEM" | "BY_ADDRESS" | "BY_PRODUCT";

export interface GeneratePickingBody {
  depositId: string;
  overrides?: {
    addressSelection?: AddressSelection;
    stockSorting?: StockSorting;
    splitMode?: SplitMode;
    maxQtyPerTask?: number;
    maxLinesPerTask?: number;
    reserveMoment?: "IMEDIATO" | "POSTERIOR";
    allowPartial?: boolean;
  };
}

export async function generatePickingFromLoad(
  loadId: string,
  body: GeneratePickingBody
) {
  return apiFetch<{ waveId: string; createdTasks: number } | unknown>(
    `/loads/${loadId}/generate-picking`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

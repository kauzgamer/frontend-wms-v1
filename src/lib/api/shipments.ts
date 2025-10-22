import { apiFetch } from "./client";

export interface ShipmentDocument {
  id: string;
  status: "RASCUNHO" | "ABERTO" | "PROCESSANDO" | "CONCLUIDO" | "CANCELADO";
  numeroNf: string;
  serie: string | null;
  pedido: string | null;
  dataEmissao: string;
  dataEntrega: string | null;
  urgente: boolean;
  volumes: number | null;
  viagem: string | null;
  subtipoProcesso: string | null;
  observacao: string | null;
  _count?: { items: number };
}

export interface ListShipmentsParams {
  status?: ShipmentDocument["status"];
  search?: string;
  page?: number;
  limit?: number;
  from?: string; // ISO date
  to?: string; // ISO date
}

export async function listShipments(params?: ListShipmentsParams) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.from) sp.set("from", params.from);
  if (params?.to) sp.set("to", params.to);
  return apiFetch<ShipmentDocument[]>(
    `/shipments${sp.size ? `?${sp.toString()}` : ""}`
  );
}

export async function getShipment(id: string) {
  return apiFetch<ShipmentDocument>(`/shipments/${id}`);
}

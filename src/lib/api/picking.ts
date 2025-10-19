import { apiFetch } from "./client";
import type {
  ListPickingQuery,
  CreatePickingInput,
  UpdatePickingInput,
} from "../validation/picking";

export interface PickingMapping {
  id: string;
  productId: string;
  skuId: string | null;
  addressId: string;
  depositId: string;
  reorderPoint: number;
  maxQuantity: number;
  status: "ATIVO" | "INATIVO";
  createdAt: string;
  updatedAt: string;
  saldoAtual?: number;
  product?: { id: string; name: string | null; sku: string | null };
  sku?: { id: string; description: string } | null;
  address?: { id: string; enderecoCompleto: string; enderecoAbreviado: string };
  deposit?: { id: string; nome: string; codigo: string };
}

export interface PickingListResponse {
  data: PickingMapping[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function getPicking(
  query?: ListPickingQuery
): Promise<PickingMapping[]> {
  const params = new URLSearchParams();
  if (query?.depositId) params.set("depositId", query.depositId);
  if (query?.productId) params.set("productId", query.productId);
  if (query?.addressId) params.set("addressId", query.addressId);
  if (query?.status && query.status !== "TODOS")
    params.set("status", query.status);
  if (query?.search) params.set("search", query.search);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const res = await apiFetch<PickingListResponse>(
    `/picking${params.size ? `?${params.toString()}` : ""}`
  );
  return res.data;
}

export async function createPicking(
  data: CreatePickingInput
): Promise<PickingMapping> {
  return apiFetch<PickingMapping>("/picking", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePicking(
  id: string,
  data: UpdatePickingInput
): Promise<PickingMapping> {
  return apiFetch<PickingMapping>(`/picking/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePicking(id: string): Promise<void> {
  await apiFetch<void>(`/picking/${id}`, { method: "DELETE" });
}

export interface AvailableProductsResponse {
  data: { id: string; name: string | null; sku: string | null }[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function listAvailableProducts(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AvailableProductsResponse> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  return apiFetch<AvailableProductsResponse>(
    `/picking/aux/products${sp.size ? `?${sp.toString()}` : ""}`
  );
}

export interface AvailableAddress {
  id: string;
  enderecoCompleto: string;
  enderecoAbreviado: string;
  depositId: string;
}

export async function listAvailableAddresses(params: {
  depositId: string;
  street?: string;
}): Promise<AvailableAddress[]> {
  const sp = new URLSearchParams({ depositId: params.depositId });
  if (params.street) sp.set("street", params.street);
  return apiFetch<AvailableAddress[]>(
    `/picking/aux/addresses?${sp.toString()}`
  );
}

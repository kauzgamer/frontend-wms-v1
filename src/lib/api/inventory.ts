import { apiFetch } from "./client";
import type {
  InventoryDashboard,
  ListInventoriesParams,
  ListInventoriesResponse,
  CreateInventoryInput,
  CreateInventoryResult,
  InventoryAddressListResponse,
  ListInventoryAddressesQuery,
} from "../types/inventory";

export async function getInventoryDashboard(): Promise<InventoryDashboard> {
  // Endpoint backend a definir: GET /inventory/dashboard
  // Por enquanto, retorna mock via API (quando backend estiver pronto, remover clientOptions)
  return apiFetch<InventoryDashboard>("/inventory/dashboard");
}

export async function listInventories(
  params: ListInventoriesParams = {}
): Promise<ListInventoriesResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.status && params.status !== "TODOS")
    qs.set("status", params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<ListInventoriesResponse>(`/inventory${suffix}`);
}

export async function createInventory(
  input: CreateInventoryInput
): Promise<CreateInventoryResult> {
  return apiFetch<CreateInventoryResult>("/inventory", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getInventory(id: string): Promise<CreateInventoryResult> {
  return apiFetch<CreateInventoryResult>(`/inventory/${id}`);
}

export async function applyInventoryAdjustments(id: string): Promise<{
  ok: boolean;
  adjusted: number;
  skipped: number;
  issues: string[];
}> {
  return apiFetch<{
    ok: boolean;
    adjusted: number;
    skipped: number;
    issues: string[];
  }>(`/inventory/${id}/apply-adjustments`, {
    method: "POST",
  });
}

export async function previewInventoryAdjustments(id: string): Promise<{
  ok: boolean;
  adjusted: number;
  skipped: number;
  issues: string[];
}> {
  return apiFetch<{
    ok: boolean;
    adjusted: number;
    skipped: number;
    issues: string[];
  }>(`/inventory/${id}/apply-adjustments?preview=1`, {
    method: "POST",
  });
}

export interface AdjustmentLogItem {
  id: string;
  inventoryId: string;
  inventoryAddressId: string | null;
  addressId: string | null;
  action: string;
  details?: unknown;
  issues: string[];
  preview: boolean;
  applied: boolean;
  createdAt: string;
}

export async function listAdjustmentLogs(
  id: string,
  params?: {
    page?: number;
    limit?: number;
    applied?: "true" | "false";
    preview?: "true" | "false";
  }
): Promise<{
  data: AdjustmentLogItem[];
  meta: { page: number; limit: number; total: number };
}> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.applied) sp.set("applied", params.applied);
  if (params?.preview) sp.set("preview", params.preview);
  const qs = sp.toString();
  return apiFetch(`/inventory/${id}/adjustment-logs${qs ? `?${qs}` : ""}`);
}

export async function listInventoryAddresses(
  inventoryId: string,
  query?: ListInventoryAddressesQuery
): Promise<InventoryAddressListResponse> {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return apiFetch<InventoryAddressListResponse>(
    `/inventory/${inventoryId}/addresses${qs ? `?${qs}` : ""}`
  );
}

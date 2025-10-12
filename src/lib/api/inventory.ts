import { apiFetch } from "./client";
import type {
  InventoryDashboard,
  ListInventoriesParams,
  ListInventoriesResponse,
  CreateInventoryInput,
  CreateInventoryResult,
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

export async function applyInventoryAdjustments(
  id: string
): Promise<{
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

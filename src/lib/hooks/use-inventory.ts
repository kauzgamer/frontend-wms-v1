import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInventory,
  getInventoryDashboard,
  listInventories,
  getInventory,
  applyInventoryAdjustments,
  previewInventoryAdjustments,
} from "../api/inventory";
import type {
  ListInventoriesParams,
  ListInventoriesResponse,
  InventoryDashboard,
  CreateInventoryInput,
  CreateInventoryResult,
} from "../types/inventory";

export function useInventoryDashboard() {
  return useQuery<InventoryDashboard>({
    queryKey: ["inventory", "dashboard"],
    queryFn: getInventoryDashboard,
    staleTime: 30_000,
  });
}

export function useInventories(params: ListInventoriesParams) {
  return useQuery<ListInventoriesResponse>({
    queryKey: ["inventory", params],
    queryFn: () => listInventories(params),
    // v5: substitui keepPreviousData por placeholderData que reutiliza o último valor
    placeholderData: (prev) => prev,
    staleTime: 15_000,
  });
}

export function useCreateInventory() {
  const qc = useQueryClient();
  return useMutation<CreateInventoryResult, Error, CreateInventoryInput>({
    mutationFn: (input) => createInventory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory", "dashboard"] });
    },
  });
}

export function useInventory(id?: string) {
  return useQuery<CreateInventoryResult>({
    queryKey: ["inventory", id],
    queryFn: () => getInventory(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useApplyInventoryAdjustments() {
  const qc = useQueryClient();
  return useMutation<
    { ok: boolean; adjusted: number; skipped: number; issues: string[] },
    Error,
    string
  >({
    mutationFn: (id) => applyInventoryAdjustments(id),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["inventory", id] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function usePreviewInventoryAdjustments() {
  return useMutation<
    { ok: boolean; adjusted: number; skipped: number; issues: string[] },
    Error,
    string
  >({
    mutationFn: (id) => previewInventoryAdjustments(id),
  });
}

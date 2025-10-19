import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPicking,
  deletePicking,
  getPicking,
  listAvailableAddresses,
  listAvailableProducts,
  updatePicking,
} from "../api/picking";
import type {
  ListPickingQuery,
  CreatePickingInput,
  UpdatePickingInput,
} from "../validation/picking";

export function usePickingList(query?: ListPickingQuery) {
  return useQuery({
    queryKey: ["picking", query],
    queryFn: () => getPicking(query),
    staleTime: 30_000,
  });
}

export function useCreatePicking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePickingInput) => createPicking(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["picking"] }),
  });
}

export function useUpdatePicking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePickingInput }) =>
      updatePicking(id, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["picking"] });
      qc.invalidateQueries({ queryKey: ["picking", vars.id] });
    },
  });
}

export function useDeletePicking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePicking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["picking"] }),
  });
}

export function useAvailablePickingProducts(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["picking", "available-products", params],
    queryFn: () => listAvailableProducts(params),
    staleTime: 30_000,
  });
}

export function useAvailablePickingAddresses(params: {
  depositId: string;
  street?: string;
}) {
  return useQuery({
    queryKey: ["picking", "available-addresses", params],
    queryFn: () => listAvailableAddresses(params),
    enabled: !!params.depositId,
    staleTime: 30_000,
  });
}

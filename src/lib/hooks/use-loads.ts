import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLoad,
  generatePickingFromLoad,
  getLoad,
  listLoads,
  type CreateLoadInput,
  type GeneratePickingBody,
  type ListLoadsParams,
  type Load,
  type ListLoadsResponse,
} from "@/lib/api/loads";

export function useLoads(params?: ListLoadsParams) {
  return useQuery<ListLoadsResponse>({
    queryKey: ["loads", params ?? {}],
    queryFn: () => listLoads(params),
    staleTime: 30_000,
  });
}

export function useLoad(id?: string) {
  return useQuery<Load>({
    queryKey: ["loads", id],
    queryFn: () => getLoad(id!),
    enabled: !!id,
  });
}

export function useCreateLoad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLoadInput) => createLoad(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loads"] });
    },
  });
}

export function useGeneratePicking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { loadId: string; body: GeneratePickingBody }) =>
      generatePickingFromLoad(args.loadId, args.body),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["loads", vars.loadId] });
      qc.invalidateQueries({ queryKey: ["picking-tasks"] });
    },
  });
}

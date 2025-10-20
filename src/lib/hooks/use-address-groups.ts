import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddressGroup,
  deleteAddressGroup,
  generateAddressesFromGroup,
  getAddressGroup,
  getAddressGroups,
  previewAddressGroup,
  updateAddressGroup,
} from "../api/address-groups";
import type {
  CreateAddressGroupInput,
  ListAddressGroupsQuery,
  PreviewAddressGroupRequest,
  UpdateAddressGroupInput,
} from "../validation/address-groups";

export function useAddressGroups(query?: ListAddressGroupsQuery) {
  return useQuery({
    queryKey: ["address-groups", query ?? {}],
    queryFn: () => getAddressGroups(query),
    staleTime: 30_000,
  });
}

export function useAddressGroup(id?: string) {
  return useQuery({
    queryKey: ["address-groups", id],
    queryFn: () => getAddressGroup(id!),
    enabled: !!id,
  });
}

export function useCreateAddressGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAddressGroupInput) => createAddressGroup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["address-groups"] });
    },
  });
}

export function useUpdateAddressGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressGroupInput }) =>
      updateAddressGroup(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["address-groups"] });
      qc.invalidateQueries({ queryKey: ["address-groups", vars.id] });
    },
  });
}

export function useDeleteAddressGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddressGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["address-groups"] });
    },
  });
}

export function usePreviewAddressGroup() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PreviewAddressGroupRequest }) =>
      previewAddressGroup(id, data),
  });
}

export function useGenerateAddressesFromGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => generateAddressesFromGroup(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      qc.invalidateQueries({ queryKey: ["address-groups"] });
      qc.invalidateQueries({ queryKey: ["address-groups", id] });
    },
  });
}

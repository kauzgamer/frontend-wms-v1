import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listAddressMappings,
  createAddressMapping,
  updateAddressMapping,
  deleteAddressMapping,
} from '../api/address-mapping';
import type {
  AddressMappingSummary,
  CreateAddressMappingInput,
  UpdateAddressMappingInput,
} from '../types/address-mapping';

export function useAddressMappings(params?: { q?: string; situacao?: 'ATIVO' | 'INATIVO' }) {
  return useQuery<AddressMappingSummary[]>({
    queryKey: ['address-mapping', params?.q, params?.situacao],
    queryFn: () => listAddressMappings(params),
    staleTime: 30000,
  });
}

export function useCreateAddressMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAddressMappingInput) => createAddressMapping(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['address-mapping'] });
    },
  });
}

export function useUpdateAddressMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressMappingInput }) =>
      updateAddressMapping(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['address-mapping'] });
      qc.invalidateQueries({ queryKey: ['address-mapping', vars.id] });
    },
  });
}

export function useDeleteAddressMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddressMapping(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['address-mapping'] });
    },
  });
}

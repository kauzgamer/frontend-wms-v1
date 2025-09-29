import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  listAddresses, 
  getAddress, 
  createAddresses, 
  previewAddresses, 
  updateAddress, 
  deleteAddress 
} from '../api/addresses';
import type { 
  AddressSummary, 
  AddressDetail, 
  CreateAddressInput, 
  CreateAddressResponse 
} from '../types/addresses';

export function useAddresses(depositoId?: string) {
  return useQuery<AddressSummary[]>({
    queryKey: ['addresses', depositoId],
    queryFn: () => listAddresses(depositoId),
  });
}

export function useAddress(id: string) {
  return useQuery<AddressDetail>({
    queryKey: ['addresses', id],
    queryFn: () => getAddress(id),
    enabled: !!id,
  });
}

export function useCreateAddresses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressInput) => createAddresses(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function usePreviewAddresses() {
  return useMutation<CreateAddressResponse, Error, CreateAddressInput>({
    mutationFn: (input: CreateAddressInput) => previewAddresses(input),
  });
}

export function useUpdateAddress(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AddressDetail>) => updateAddress(id, data),
    onSuccess: (data) => {
      qc.setQueryData(['addresses', id], data);
      qc.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

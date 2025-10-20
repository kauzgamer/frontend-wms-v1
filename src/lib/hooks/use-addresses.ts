import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CoordinateRange } from "../types/addresses";
import {
  listAddresses,
  getAddress,
  createAddresses,
  previewAddresses,
  updateAddress,
  deleteAddress,
  getStreetsByDeposit,
  getAddressesByStreet,
} from "../api/addresses";
import type {
  AddressSummary,
  AddressDetail,
  CreateAddressInput,
} from "../types/addresses";

export function useAddresses(params?: {
  depositoId?: string;
  funcao?: string;
  acessivelAMao?: boolean;
}) {
  return useQuery<AddressSummary[]>({
    queryKey: [
      "addresses",
      params?.depositoId,
      params?.funcao,
      params?.acessivelAMao,
    ],
    queryFn: () => listAddresses(params),
    retry: false, // Não tentar novamente se falhar
    staleTime: 30000, // Cache por 30 segundos
  });
}

export function useAddress(id: string) {
  return useQuery<AddressDetail>({
    queryKey: ["addresses", id],
    queryFn: () => getAddress(id),
    enabled: !!id,
  });
}

export function useCreateAddresses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressInput) => createAddresses(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function usePreviewAddresses() {
  return useMutation({
    mutationFn: (params: {
      depositoId: string;
      estruturaFisicaId: string;
      coordenadas: CoordinateRange[];
    }) => previewAddresses(params),
  });
}

export function useUpdateAddress(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AddressDetail>) => updateAddress(id, data),
    onSuccess: (data) => {
      qc.setQueryData(["addresses", id], data);
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useStreetsByDeposit(depositoId: string | undefined) {
  return useQuery<string[]>({
    queryKey: ["addresses", "streets", depositoId],
    queryFn: () => getStreetsByDeposit(depositoId!),
    enabled: !!depositoId,
    staleTime: 30000,
  });
}

export function useAddressesByStreet(
  depositoId: string | undefined,
  street: string | undefined
) {
  return useQuery({
    queryKey: ["addresses", "by-street", depositoId, street],
    queryFn: () => getAddressesByStreet(depositoId!, street!),
    enabled: !!depositoId && !!street,
    staleTime: 30000,
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listStockTypes,
  createStockType,
  updateStockType,
  deleteStockType,
} from '../api/stock-types';
import type { CreateStockTypeInput, UpdateStockTypeInput, StockTypeItem } from '../types/stock-types';

export function useStockTypes(params?: { q?: string; situacao?: 'ATIVO' | 'INATIVO' }) {
  return useQuery<StockTypeItem[]>({
    queryKey: ['stock-types', params?.q, params?.situacao],
    queryFn: () => listStockTypes(params),
    staleTime: 30000,
  });
}

export function useCreateStockType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockTypeInput) => createStockType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-types'] });
    },
  });
}

export function useUpdateStockType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockTypeInput }) =>
      updateStockType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-types'] });
    },
  });
}

export function useDeleteStockType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStockType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-types'] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createStock,
  getStocks,
  getStock,
  updateStock,
  deleteStock,
  adjustStockQuantity,
  moveStock,
  getProductStockTotal,
} from '../api/stock';
import type {
  CreateStockInput,
  UpdateStockInput,
  AdjustQuantityInput,
  MoveStockInput,
  ListStocksQuery,
} from '../validation/stock';

/**
 * Hook para listar estoques com filtros
 */
export function useStocks(query?: ListStocksQuery) {
  return useQuery({
    queryKey: ['stocks', query],
    queryFn: () => getStocks(query),
    staleTime: 30_000, // 30 segundos
  });
}

/**
 * Hook para buscar um estoque específico
 */
export function useStock(id: string | undefined) {
  return useQuery({
    queryKey: ['stocks', id],
    queryFn: () => getStock(id!),
    enabled: !!id,
  });
}

/**
 * Hook para buscar total de estoque por produto
 */
export function useProductStockTotal(productId: string | undefined) {
  return useQuery({
    queryKey: ['stocks', 'product', productId, 'total'],
    queryFn: () => getProductStockTotal(productId!),
    enabled: !!productId,
  });
}

/**
 * Hook para criar novo estoque
 */
export function useCreateStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockInput) => createStock(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
}

/**
 * Hook para atualizar estoque
 */
export function useUpdateStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockInput }) =>
      updateStock(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['stocks', vars.id] });
    },
  });
}

/**
 * Hook para deletar estoque
 */
export function useDeleteStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStock(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
}

/**
 * Hook para ajustar quantidade do estoque
 */
export function useAdjustStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustQuantityInput }) =>
      adjustStockQuantity(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['stocks', vars.id] });
    },
  });
}

/**
 * Hook para movimentar estoque
 */
export function useMoveStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveStockInput }) =>
      moveStock(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['stocks', vars.id] });
    },
  });
}

// ⚠️ MÓDULO SOMENTE LEITURA - Apenas queries, sem mutations

import { useQuery } from '@tanstack/react-query';
import { getStocks, getStock, getProductStockTotal } from '../api/stock';
import type { ListStocksQuery } from '../validation/stock';

/**
 * Hook para buscar lista de estoques
 */
export function useStocks(query?: ListStocksQuery) {
  return useQuery({
    queryKey: ['stocks', query],
    queryFn: () => getStocks(query),
    staleTime: 30_000, // 30 segundos
  });
}

/**
 * Hook para buscar um estoque por ID
 */
export function useStock(id: string | undefined) {
  return useQuery({
    queryKey: ['stocks', id],
    queryFn: () => getStock(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Hook para buscar totais de estoque de um produto
 */
export function useProductStockTotal(productId: string | undefined) {
  return useQuery({
    queryKey: ['stocks', 'product-total', productId],
    queryFn: () => getProductStockTotal(productId!),
    enabled: !!productId,
    staleTime: 30_000,
  });
}

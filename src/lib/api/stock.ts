// ⚠️ MÓDULO SOMENTE LEITURA - Apenas métodos GET

import { apiFetch } from './client';
import type {
  Stock,
  StockWithDetails,
  ProductStockTotal,
} from '../types/stock';
import type { ListStocksQuery } from '../validation/stock';

/**
 * Buscar lista de estoques com filtros e paginação
 */
export async function getStocks(
  query?: ListStocksQuery
): Promise<StockWithDetails[]> {
  const params = new URLSearchParams();

  if (query?.productId) params.append('productId', query.productId);
  if (query?.skuId) params.append('skuId', query.skuId);
  if (query?.addressId) params.append('addressId', query.addressId);
  if (query?.estabelecimento) params.append('estabelecimento', query.estabelecimento);
  if (query?.deposito) params.append('deposito', query.deposito);
  if (query?.lote) params.append('lote', query.lote);
  if (query?.status && query.status !== 'TODOS') params.append('status', query.status);
  if (query?.search) params.append('search', query.search);
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());

  const url = `/stock${params.toString() ? `?${params.toString()}` : ''}`;
  const resp = await apiFetch<{ data: StockWithDetails[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(url);
  return resp.data;
}

/**
 * Buscar um estoque por ID
 */
export async function getStock(id: string): Promise<Stock> {
  return apiFetch<Stock>(`/stock/${id}`);
}

/**
 * Buscar totais de estoque por produto (agregado)
 */
export async function getProductStockTotal(
  productId: string
): Promise<ProductStockTotal> {
  return apiFetch<ProductStockTotal>(`/stock/product/${productId}/total`);
}

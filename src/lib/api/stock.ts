import { apiFetch } from './client';
import type {
  StockWithDetails,
  StockListResponse,
  ProductStockTotal,
} from '../types/stock';
import type {
  CreateStockInput,
  UpdateStockInput,
  AdjustQuantityInput,
  MoveStockInput,
  ListStocksQuery,
} from '../validation/stock';

/**
 * Criar novo registro de estoque
 */
export async function createStock(data: CreateStockInput): Promise<StockWithDetails> {
  return apiFetch<StockWithDetails>('/stock', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Listar registros de estoque com filtros e paginação
 */
export async function getStocks(query?: ListStocksQuery): Promise<StockListResponse> {
  const params = new URLSearchParams();

  if (query?.productId) params.append('productId', query.productId);
  if (query?.skuId) params.append('skuId', query.skuId);
  if (query?.addressId) params.append('addressId', query.addressId);
  if (query?.lote) params.append('lote', query.lote);
  if (query?.status) params.append('status', query.status);
  if (query?.search) params.append('search', query.search);
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/stock?${queryString}` : '/stock';

  return apiFetch<StockListResponse>(url);
}

/**
 * Buscar um registro de estoque por ID
 */
export async function getStock(id: string): Promise<StockWithDetails> {
  return apiFetch<StockWithDetails>(`/stock/${id}`);
}

/**
 * Atualizar um registro de estoque
 */
export async function updateStock(
  id: string,
  data: UpdateStockInput,
): Promise<StockWithDetails> {
  return apiFetch<StockWithDetails>(`/stock/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Deletar um registro de estoque
 */
export async function deleteStock(id: string): Promise<void> {
  return apiFetch<void>(`/stock/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Ajustar quantidade do estoque
 */
export async function adjustStockQuantity(
  id: string,
  data: AdjustQuantityInput,
): Promise<StockWithDetails> {
  return apiFetch<StockWithDetails>(`/stock/${id}/adjust`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Movimentar estoque para outro endereço
 */
export async function moveStock(
  id: string,
  data: MoveStockInput,
): Promise<StockWithDetails> {
  return apiFetch<StockWithDetails>(`/stock/${id}/move`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Obter total de estoque por produto
 */
export async function getProductStockTotal(
  productId: string,
): Promise<ProductStockTotal> {
  return apiFetch<ProductStockTotal>(`/stock/product/${productId}/total`);
}

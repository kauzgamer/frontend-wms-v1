import { apiFetch } from './client';
import type {
  StockTypeItem,
  CreateStockTypeInput,
  UpdateStockTypeInput,
} from '../types/stock-types';

export async function listStockTypes(params?: { q?: string; situacao?: 'ATIVO' | 'INATIVO' }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.situacao) qs.set('situacao', params.situacao);
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiFetch<StockTypeItem[]>(`/stock-types${suffix}`);
}

export async function createStockType(data: CreateStockTypeInput) {
  return apiFetch<StockTypeItem>('/stock-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStockType(id: string, data: UpdateStockTypeInput) {
  return apiFetch<StockTypeItem>(`/stock-types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteStockType(id: string) {
  return apiFetch<void>(`/stock-types/${id}`, { method: 'DELETE' });
}

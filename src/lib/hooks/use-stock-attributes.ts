import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { StockAttribute } from '@/lib/types/stock-attribute'

export function useStockAttributes(params?: { q?: string; status?: 'ATIVO' | 'INATIVO' | 'TODOS' }) {
  const q = params?.q ?? ''
  const status = params?.status ?? 'TODOS'
  return useQuery({
    queryKey: ['stock-attributes', { q, status }],
    queryFn: () => apiFetch<StockAttribute[]>(`/stock-attributes?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`),
  })
}

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Carrier } from '@/lib/types/carrier'

export type CarrierFilters = {
  q?: string
  status?: 'ATIVO' | 'INATIVO' | 'TODOS'
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export type CarrierListResult = {
  items: Carrier[]
  total: number
  page?: number
  limit?: number
}

export function useCarriers(filters: CarrierFilters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.order) params.set('order', filters.order)

  return useQuery<CarrierListResult, Error>({
    queryKey: ['carriers', Object.fromEntries(params.entries())],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/carriers?${params.toString()}`)
      if (Array.isArray(data)) return { items: data as Carrier[], total: (data as Carrier[]).length }
      return data as CarrierListResult
    },
  })
}

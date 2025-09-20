import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Supplier } from '@/lib/types/supplier'

export type SupplierFilters = {
  q?: string
  status?: 'ATIVO' | 'INATIVO' | 'TODOS'
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export type SupplierListResult = {
  items: Supplier[]
  total: number
  page?: number
  limit?: number
}

export function useSuppliers(filters: SupplierFilters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.order) params.set('order', filters.order)

  return useQuery<SupplierListResult, Error>({
    queryKey: ['suppliers', Object.fromEntries(params.entries())],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/suppliers?${params.toString()}`)
      if (Array.isArray(data)) return { items: data as Supplier[], total: (data as Supplier[]).length }
      return data as SupplierListResult
    },
  })
}

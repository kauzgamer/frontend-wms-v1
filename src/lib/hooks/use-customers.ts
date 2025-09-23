import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Customer } from '@/lib/types/customer'

export type CustomerFilters = {
  q?: string
  status?: 'ATIVO' | 'INATIVO' | 'TODOS'
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export type CustomerListResult = {
  items: Customer[]
  total: number
  page?: number
  limit?: number
}

export function useCustomers(filters: CustomerFilters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.order) params.set('order', filters.order)

  return useQuery<CustomerListResult, Error>({
    queryKey: ['customers', Object.fromEntries(params.entries())],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/customers?${params.toString()}`)
      if (Array.isArray(data)) return { items: data as Customer[], total: (data as Customer[]).length }
      return data as CustomerListResult
    },
  })
}

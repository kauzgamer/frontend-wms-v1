import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ProductCategory } from '@/lib/types/product-category'

export type ProductCategoryFilters = {
  q?: string
  status?: 'ATIVO' | 'INATIVO' | 'TODOS'
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export type ProductCategoryListResult = {
  items: ProductCategory[]
  total: number
  page?: number
  limit?: number
}

export function useProductCategories(filters: ProductCategoryFilters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.status) params.set('status', filters.status)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.order) params.set('order', filters.order)

  return useQuery<ProductCategoryListResult, Error>({
    queryKey: ['product-categories', Object.fromEntries(params.entries())],
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/product-categories?${params.toString()}`)
      if (Array.isArray(data)) {
        return { items: data as ProductCategory[], total: data.length }
      }
      const obj = data as ProductCategoryListResult
      return obj
    },
  })
}

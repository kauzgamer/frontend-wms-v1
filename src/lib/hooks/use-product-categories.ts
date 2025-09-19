import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ProductCategory } from '@/lib/types/product-category'

export type ProductCategoryFilters = {
  q?: string
  status?: 'ATIVO' | 'INATIVO' | 'TODOS'
}

export function useProductCategories(filters: ProductCategoryFilters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.status) params.set('status', filters.status)

  return useQuery({
    queryKey: ['product-categories', filters],
    queryFn: async (): Promise<ProductCategory[]> => {
      const res = (await apiFetch(`/product-categories?${params.toString()}`)) as Response
      const data = (await res.json()) as ProductCategory[]
      return data
    },
  })
}

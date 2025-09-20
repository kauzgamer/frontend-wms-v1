import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ProductCategory } from '@/lib/types/product-category'

export function useProductCategoriesForSelect() {
  return useQuery<ProductCategory[], Error>({
    queryKey: ['product-categories', { for: 'select' }],
    queryFn: () => apiFetch<ProductCategory[]>('/product-categories'),
    staleTime: 60_000,
  })
}

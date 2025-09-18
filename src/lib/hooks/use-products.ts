import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Product } from '@/lib/types/product'

export function useProducts() {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: () => apiFetch<Product[]>('/products'),
    staleTime: 15_000,
  })
}

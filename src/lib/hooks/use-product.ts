import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ProductWithSkus } from '@/lib/types/product'

export function useProduct(id: string | undefined) {
  return useQuery<ProductWithSkus, Error>({
    queryKey: ['product', id],
    queryFn: () => apiFetch<ProductWithSkus>(`/products/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ProductCategory, ProductCategoryCreateInput } from '@/lib/types/product-category'

export function useCreateProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['product-categories', 'create'],
    mutationFn: async (input: ProductCategoryCreateInput): Promise<ProductCategory> => {
      return apiFetch<ProductCategory>('/product-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories'] })
    },
  })
}

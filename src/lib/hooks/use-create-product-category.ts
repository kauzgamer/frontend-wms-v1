import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ProductCategory, ProductCategoryCreateInput } from '@/lib/types/product-category'

export function useCreateProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['product-categories', 'create'],
    mutationFn: async (input: ProductCategoryCreateInput): Promise<ProductCategory> => {
      const res = (await apiFetch('/product-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })) as Response
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao criar categoria'
        throw new Error(msg)
      }
      return (await res.json()) as ProductCategory
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories'] })
    },
  })
}

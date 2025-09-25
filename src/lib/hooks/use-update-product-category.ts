import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ProductCategory, ProductCategoryUpdateInput } from '@/lib/types/product-category'

export function useUpdateProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['product-categories', 'update'],
    mutationFn: async (vars: { id: string; data: ProductCategoryUpdateInput }): Promise<ProductCategory | null> => {
      return apiFetch<ProductCategory>(`/product-categories/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.data),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories'] })
    },
  })
}

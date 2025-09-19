import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ProductCategory, ProductCategoryUpdateInput } from '@/lib/types/product-category'

export function useUpdateProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['product-categories', 'update'],
    mutationFn: async (vars: { id: string; data: ProductCategoryUpdateInput }): Promise<ProductCategory | null> => {
      const res = (await apiFetch(`/product-categories/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.data),
      })) as Response
      if (res.status === 404) return null
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao atualizar categoria'
        throw new Error(msg)
      }
      return (await res.json()) as ProductCategory
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories'] })
    },
  })
}

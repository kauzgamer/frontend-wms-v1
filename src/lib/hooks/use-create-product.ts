import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Product } from '@/lib/types/product'
import type { ProductCreateForm } from '@/lib/validation/product'

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductCreateForm) => apiFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify({ name: data.name, sku: data.sku }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

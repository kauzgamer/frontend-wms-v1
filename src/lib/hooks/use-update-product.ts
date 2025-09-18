import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Product } from '@/lib/types/product'

export interface UpdateProductInput {
  id: string
  name?: string
  sku?: string
  unit?: string
  unitOfMeasure?: string
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductInput) => apiFetch<Product>(`/products/${data.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: data.name,
        sku: data.sku,
        unit: data.unit,
        unitOfMeasure: data.unitOfMeasure,
      })
    }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['product', vars.id] })
      qc.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

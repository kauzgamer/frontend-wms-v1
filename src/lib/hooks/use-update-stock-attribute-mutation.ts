import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { StockAttribute } from '@/lib/types/stock-attribute'

export type UpdateStockAttributeWithId = Partial<{
  descricao: string
  formato: 'TEXTO' | 'DATA'
  ativo: boolean
}> & { id: string }

export function useUpdateStockAttributeMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateStockAttributeWithId) => {
      return apiFetch<StockAttribute>(
        `/stock-attributes/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(input)
        }
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-attributes'] })
    }
  })
}

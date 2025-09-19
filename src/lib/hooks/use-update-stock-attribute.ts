import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { StockAttribute } from '@/lib/types/stock-attribute'

export type UpdateStockAttributeInput = Partial<{
  descricao: string
  formato: 'TEXTO' | 'DATA'
  ativo: boolean
}>

export function useUpdateStockAttribute(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateStockAttributeInput) => {
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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { StockAttribute } from '@/lib/types/stock-attribute'

export type CreateStockAttributeInput = {
  descricao: string
  formato: 'TEXTO' | 'DATA'
  ativo?: boolean
}

export function useCreateStockAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateStockAttributeInput) => {
      return apiFetch<StockAttribute>(
        '/stock-attributes',
        {
          method: 'POST',
          body: JSON.stringify(input)
        }
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-attributes'] })
    }
  })
}

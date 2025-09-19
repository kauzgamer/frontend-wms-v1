import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteStockAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ deleted: boolean; reason?: string }>(
        `/stock-attributes/${id}`,
        { method: 'DELETE' }
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-attributes'] })
    }
  })
}

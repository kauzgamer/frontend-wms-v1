import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['product-categories', 'delete'],
    mutationFn: async (id: string): Promise<{ deleted: boolean }> => {
      return apiFetch<{ deleted: boolean }>(`/product-categories/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories'] })
    },
  })
}

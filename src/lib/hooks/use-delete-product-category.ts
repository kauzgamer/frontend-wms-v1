import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteProductCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['product-categories', 'delete'],
    mutationFn: async (id: string): Promise<{ deleted: boolean }> => {
      const res = (await apiFetch(`/product-categories/${id}`, { method: 'DELETE' })) as Response
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao excluir categoria'
        throw new Error(msg)
      }
      return (await res.json()) as { deleted: boolean }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories'] })
    },
  })
}

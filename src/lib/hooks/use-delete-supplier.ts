import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation<{ deleted: boolean }, Error, string>({
    mutationKey: ['suppliers', 'delete'],
    mutationFn: async (id) => {
      const res = (await apiFetch(`/suppliers/${id}`, { method: 'DELETE' })) as Response
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao excluir fornecedor'
        throw new Error(msg)
      }
      return (await res.json()) as { deleted: boolean }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation<{ deleted: boolean }, Error, string>({
    mutationKey: ['customers', 'delete'],
    mutationFn: async (id) => {
      const res = (await apiFetch(`/customers/${id}`, { method: 'DELETE' })) as Response
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao excluir cliente'
        throw new Error(msg)
      }
      return (await res.json()) as { deleted: boolean }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

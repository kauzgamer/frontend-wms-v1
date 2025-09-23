import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteCarrier() {
  const qc = useQueryClient()
  return useMutation<{ deleted: boolean }, Error, string>({
    mutationKey: ['carriers', 'delete'],
    mutationFn: async (id) => {
      const res = (await apiFetch(`/carriers/${id}`, { method: 'DELETE' })) as Response
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao excluir transportadora'
        throw new Error(msg)
      }
      return (await res.json()) as { deleted: boolean }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

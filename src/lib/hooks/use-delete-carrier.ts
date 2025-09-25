import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteCarrier() {
  const qc = useQueryClient()
  return useMutation<{ deleted: boolean }, Error, string>({
    mutationKey: ['carriers', 'delete'],
    mutationFn: async (id) => {
      return apiFetch<{ deleted: boolean }>(`/carriers/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation<{ deleted: boolean }, Error, string>({
    mutationKey: ['suppliers', 'delete'],
    mutationFn: async (id) => {
      return apiFetch<{ deleted: boolean }>(`/suppliers/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

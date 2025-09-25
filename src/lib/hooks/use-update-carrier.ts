import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Carrier, CarrierUpdateInput } from '@/lib/types/carrier'

export function useUpdateCarrier() {
  const qc = useQueryClient()
  return useMutation<Carrier | null, Error, { id: string; data: CarrierUpdateInput }>({
    mutationKey: ['carriers', 'update'],
    mutationFn: async (vars) => {
      return apiFetch<Carrier>(`/carriers/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.data),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

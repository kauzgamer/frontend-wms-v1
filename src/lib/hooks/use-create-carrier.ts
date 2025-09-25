import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Carrier, CarrierCreateInput } from '@/lib/types/carrier'

export function useCreateCarrier() {
  const qc = useQueryClient()
  return useMutation<Carrier, Error, CarrierCreateInput>({
    mutationKey: ['carriers', 'create'],
    mutationFn: async (input) => {
      return apiFetch<Carrier>('/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

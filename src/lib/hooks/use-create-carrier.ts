import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Carrier, CarrierCreateInput } from '@/lib/types/carrier'

export function useCreateCarrier() {
  const qc = useQueryClient()
  return useMutation<Carrier, Error, CarrierCreateInput>({
    mutationKey: ['carriers', 'create'],
    mutationFn: async (input) => {
      const res = (await apiFetch('/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })) as Response
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao criar transportadora'
        throw new Error(msg)
      }
      return (await res.json()) as Carrier
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

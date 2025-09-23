import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Carrier, CarrierUpdateInput } from '@/lib/types/carrier'

export function useUpdateCarrier() {
  const qc = useQueryClient()
  return useMutation<Carrier | null, Error, { id: string; data: CarrierUpdateInput }>({
    mutationKey: ['carriers', 'update'],
    mutationFn: async (vars) => {
      const res = (await apiFetch(`/carriers/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.data),
      })) as Response
      if (res.status === 404) return null
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao atualizar transportadora'
        throw new Error(msg)
      }
      return (await res.json()) as Carrier
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

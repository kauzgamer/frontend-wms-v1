import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Customer, CustomerCreateInput } from '@/lib/types/customer'

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation<Customer, Error, CustomerCreateInput>({
    mutationKey: ['customers', 'create'],
    mutationFn: async (input) => {
      const res = (await apiFetch('/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })) as Response
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao criar cliente'
        throw new Error(msg)
      }
      return (await res.json()) as Customer
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

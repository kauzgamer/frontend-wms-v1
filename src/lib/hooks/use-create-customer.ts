import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Customer, CustomerCreateInput } from '@/lib/types/customer'

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation<Customer, Error, CustomerCreateInput>({
    mutationKey: ['customers', 'create'],
    mutationFn: async (input) => {
      return apiFetch<Customer>('/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Customer, CustomerUpdateInput } from '@/lib/types/customer'

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation<Customer | null, Error, { id: string; data: CustomerUpdateInput }>({
    mutationKey: ['customers', 'update'],
    mutationFn: async (vars) => {
      return apiFetch<Customer>(`/customers/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.data),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Customer, CustomerUpdateInput } from '@/lib/types/customer'

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation<Customer | null, Error, { id: string; data: CustomerUpdateInput }>({
    mutationKey: ['customers', 'update'],
    mutationFn: async (vars) => {
      const res = (await apiFetch(`/customers/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.data),
      })) as Response
      if (res.status === 404) return null
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao atualizar cliente'
        throw new Error(msg)
      }
      return (await res.json()) as Customer
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

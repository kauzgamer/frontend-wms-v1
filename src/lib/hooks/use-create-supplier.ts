import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Supplier, SupplierCreateInput } from '@/lib/types/supplier'

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation<Supplier, Error, SupplierCreateInput>({
    mutationKey: ['suppliers', 'create'],
    mutationFn: async (input) => {
      return apiFetch<Supplier>('/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Supplier, SupplierCreateInput } from '@/lib/types/supplier'

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation<Supplier, Error, SupplierCreateInput>({
    mutationKey: ['suppliers', 'create'],
    mutationFn: async (input) => {
      const res = (await apiFetch('/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })) as Response
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao criar fornecedor'
        throw new Error(msg)
      }
      return (await res.json()) as Supplier
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

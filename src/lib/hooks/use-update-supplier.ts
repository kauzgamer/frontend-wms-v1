import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Supplier, SupplierUpdateInput } from '@/lib/types/supplier'

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation<Supplier | null, Error, { id: string; data: SupplierUpdateInput }>({
    mutationKey: ['suppliers', 'update'],
    mutationFn: async (vars) => {
      // apiFetch já lança erro para status não-2xx e retorna JSON tipado
      return apiFetch<Supplier>(`/suppliers/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.data),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

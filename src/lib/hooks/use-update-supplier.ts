import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Supplier, SupplierUpdateInput } from '@/lib/types/supplier'

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation<Supplier | null, Error, { id: string; data: SupplierUpdateInput }>({
    mutationKey: ['suppliers', 'update'],
    mutationFn: async (vars) => {
      const res = (await apiFetch(`/suppliers/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.data),
      })) as Response
      if (res.status === 404) return null
      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao atualizar fornecedor'
        throw new Error(msg)
      }
      return (await res.json()) as Supplier
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

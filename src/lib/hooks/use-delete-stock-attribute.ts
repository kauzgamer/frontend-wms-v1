import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteStockAttribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/stock-attributes/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || res.statusText)
      }
      return res.json() as Promise<{ deleted: boolean; reason?: string }>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-attributes'] })
    }
  })
}

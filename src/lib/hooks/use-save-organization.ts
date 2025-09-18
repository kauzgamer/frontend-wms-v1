import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Organization, UpsertOrganizationInput } from '@/lib/types/organization'

export function useSaveOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpsertOrganizationInput) => apiFetch<Organization>('/organization', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organization'] })
    }
  })
}

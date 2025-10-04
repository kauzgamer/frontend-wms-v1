import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeactivateAccount() {
  return useMutation<{ message: string }, Error>({
    mutationKey: ['users', 'account', 'deactivate'],
    mutationFn: async () => {
      return apiFetch<{ message: string }>('/users/status/deactivate', {
        method: 'PUT',
      })
    },
  })
}

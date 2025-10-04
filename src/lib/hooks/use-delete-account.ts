import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export function useDeleteAccount() {
  return useMutation<{ message: string }, Error>({
    mutationKey: ['users', 'account', 'delete'],
    mutationFn: async () => {
      return apiFetch<{ message: string }>('/users/account', {
        method: 'DELETE',
      })
    },
  })
}

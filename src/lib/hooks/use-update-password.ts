import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function useUpdatePassword() {
  return useMutation<{ message: string }, Error, UpdatePasswordInput>({
    mutationKey: ['users', 'password', 'update'],
    mutationFn: async (data) => {
      return apiFetch<{ message: string }>('/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
  })
}

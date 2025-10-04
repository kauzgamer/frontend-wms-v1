import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { User } from '@/lib/auth-context-base'

export interface UpdateProfileInput {
  name?: string
  email?: string
  phone?: string
  jobTitle?: string
  location?: string
  bio?: string
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation<User | null, Error, UpdateProfileInput>({
    mutationKey: ['users', 'profile', 'update'],
    mutationFn: async (data) => {
      return apiFetch<User>('/users/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'profile'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { User } from '@/lib/auth-context-base'

export interface UpdatePreferencesInput {
  language?: string
  timezone?: string
  theme?: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  weeklyDigest?: boolean
}

export function useUpdatePreferences() {
  const qc = useQueryClient()
  return useMutation<User | null, Error, UpdatePreferencesInput>({
    mutationKey: ['users', 'preferences', 'update'],
    mutationFn: async (data) => {
      return apiFetch<User>('/users/preferences', {
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

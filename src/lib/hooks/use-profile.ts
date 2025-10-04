import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { User } from '@/lib/auth-context-base'

export function useProfile() {
  return useQuery<User | null, Error>({
    queryKey: ['users', 'profile'],
    queryFn: async () => {
      return apiFetch<User>('/users/profile/me', {
        method: 'GET',
      })
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

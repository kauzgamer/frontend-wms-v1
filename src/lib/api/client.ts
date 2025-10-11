import { getStoredToken } from '../auth-storage'

export interface ApiClientOptions {
  baseUrl?: string
  token?: string | null
}

const DEFAULT_BASE = '/api'

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  clientOptions: ApiClientOptions = {}
): Promise<T> {
  const base = clientOptions.baseUrl ?? DEFAULT_BASE
  const token = clientOptions.token ?? getStoredToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    // Tratamento especial: se 401, limpar sessão e redirecionar para login
    if (res.status === 401) {
      try {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      } catch {
        // noop: storage may be unavailable
      }
      // Redirecionar para login mantendo URL de retorno
      if (typeof window !== 'undefined') {
        const current = window.location.pathname + window.location.search
        const redirect = `/login${current && current !== '/login' ? `?from=${encodeURIComponent(current)}` : ''}`
        if (window.location.pathname !== '/login') {
          window.location.replace(redirect)
        }
      }
    }
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

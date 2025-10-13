import { getStoredToken } from '../auth-storage'

export interface ApiClientOptions {
  baseUrl?: string
  token?: string | null
}

// Get API base URL - USANDO APENAS LOCALHOST PARA TESTES
const getApiBaseUrl = (): string => {
  // TESTE LOCAL: sempre usar localhost:3000
  return 'http://localhost:3000/api'
}

// Cache for API base URL
let cachedBaseUrl: string | null = null

const getCachedApiBaseUrl = (): string => {
  if (!cachedBaseUrl) {
    cachedBaseUrl = getApiBaseUrl()
  }
  return cachedBaseUrl
}

const DEFAULT_BASE = getCachedApiBaseUrl()

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

  // Try primary URL first
  try {
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
  } catch (error) {
    // TESTE LOCAL: sem fallback, lançar erro direto
    console.error('❌ Erro na API local:', error)
    throw error
  }
}

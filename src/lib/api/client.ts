import { getStoredToken } from '../auth-storage'

export interface ApiClientOptions {
  baseUrl?: string
  token?: string | null
}

// Get API base URL with intelligent fallback
const getApiBaseUrl = (): string => {
  // In production, always use the configured API URL
  if (!import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'https://backend-wms-fdsc.onrender.com/api'
  }

  // In development, prioritize remote API for testing
  if (import.meta.env.VITE_USE_REMOTE_API === 'true' || import.meta.env.VITE_USE_REMOTE_API === undefined) {
    return import.meta.env.VITE_API_URL || 'https://backend-wms-fdsc.onrender.com/api'
  }

  // Fallback to relative path for local development with proxy
  return '/api'
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

// Fallback API URLs for development
const FALLBACK_BASE_URLS = [
  'https://backend-wms-fdsc.onrender.com/api', // Remote API
]

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
    // If primary URL fails, try fallback URLs
    if (import.meta.env.DEV && error instanceof Error) {
      console.warn('Primary API failed, trying fallback APIs...', error.message)

      for (const fallbackUrl of FALLBACK_BASE_URLS) {
        try {
          const res = await fetch(`${fallbackUrl}${path}`, {
            ...options,
            headers,
          })

          if (!res.ok) {
            if (res.status === 401) {
              try {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
              } catch {
                // noop: storage may be unavailable
              }
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

          console.log(`Successfully connected to fallback API: ${fallbackUrl}`)
          return res.json() as Promise<T>
        } catch (fallbackError) {
          console.warn(`Fallback API ${fallbackUrl} also failed:`, fallbackError)
          // Continue to next fallback
        }
      }
    }

    // If all attempts failed, throw the original error
    throw error
  }
}

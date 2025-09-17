export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function getStoredUser(): unknown {
  const raw = localStorage.getItem('auth_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

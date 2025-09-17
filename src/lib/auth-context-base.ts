import { createContext } from 'react'

export interface User {
  email: string
  name: string
  provider: string
  providerId: string
  picture?: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

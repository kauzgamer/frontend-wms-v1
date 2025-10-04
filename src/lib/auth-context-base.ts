import { createContext } from 'react'

export interface User {
  email: string
  name: string
  provider: string
  providerId: string
  picture?: string
  // Profile fields
  phone?: string
  jobTitle?: string
  location?: string
  bio?: string
  // Preferences
  language?: string
  timezone?: string
  theme?: string
  // Notifications
  emailNotifications?: boolean
  pushNotifications?: boolean
  weeklyDigest?: boolean
  // Security
  twoFactorEnabled?: boolean
  // Status
  status?: string
  // Timestamps
  lastLoginAt?: Date
  createdAt?: Date
  updatedAt?: Date
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

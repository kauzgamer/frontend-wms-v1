import { createContext, useContext } from 'react'
import type { Toast } from './toast'

export const ToastContext = createContext<{
  show: (t: Omit<Toast, 'id'>) => void
} | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

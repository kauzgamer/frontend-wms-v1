import { useCallback, useEffect, useMemo, useState } from 'react'
import { ToastContext } from './toast-context'

export type ToastKind = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  kind: ToastKind
  message: string
  duration?: number // ms
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const toast: Toast = { id, ...t }
    setToasts((prev) => [...prev, toast])
    const duration = t.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, duration)
    }
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[min(92vw,640px)]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { kind, message } = toast
  const palette = kind === 'success'
    ? { bar: '#116b50', bg: '#e6fbf3', text: '#0a3d31' }
    : kind === 'error'
      ? { bar: '#9b1c1c', bg: '#fdecec', text: '#5f1212' }
      : { bar: '#2f8ac9', bg: '#e9f5fe', text: '#0e3b5a' }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="relative overflow-hidden rounded-md border shadow-sm" style={{ backgroundColor: palette.bg, color: palette.text }}>
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: palette.bar }} />
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-xl" aria-hidden>
          {kind === 'success' ? '✓' : kind === 'error' ? '!' : 'i'}
        </span>
        <div className="flex-1 text-sm">{message}</div>
        <button className="text-lg px-2" style={{ color: palette.text }} onClick={onClose} aria-label="Fechar">×</button>
      </div>
    </div>
  )
}

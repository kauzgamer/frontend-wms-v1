import { Suspense, lazy, useEffect, useState } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { FullPageSpinner } from "@/components/full-page-spinner"
import { useIsFetching } from '@tanstack/react-query'
import SidebarLayout from "@/layouts/sidebar-layout"

const DashboardPage = lazy(() => import("@/page/dashboard/page"))
const SettingsPage = lazy(() => import("@/page/settings/page"))
const FluxosPage = lazy(() => import("@/page/settings/fluxos/page"))
const UsuariosPage = lazy(() => import("@/page/settings/usuarios/page"))
const IntegrationPage = lazy(() => import("@/page/integration/page"))
const IntegrationSettingsPage = lazy(() => import("@/page/integration/settings/page"))

// Global route change overlay spinner
function GlobalRouteLoader({ minDuration = 300 }: { minDuration?: number }) {
  const location = useLocation()
  const isFetching = useIsFetching()
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setStartTime(Date.now())
  }, [location.pathname])

  useEffect(() => {
    if (loading && startTime) {
      const t = setTimeout(() => setLoading(false), minDuration)
      return () => clearTimeout(t)
    }
  }, [loading, startTime, minDuration])

  const networkBusy = isFetching > 0
  if (!loading && !networkBusy) return null
  return (
    <div className="fixed inset-0 z-40 pointer-events-none" aria-live="polite" aria-busy="true">
      <div className="absolute top-4 right-4">
        <FullPageSpinner className="w-8 h-8" />
      </div>
    </div>
  )
}

function App() {
  const location = useLocation()

  // After every route change, restore the sidebar scroll position robustly
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-scroll-position')
    if (!saved) return
    const value = parseInt(saved, 10)
    let attempts = 0
    const maxAttempts = 60 // ~1s at 60fps
    const tryRestore = () => {
      attempts += 1
      const el = document.querySelector('[data-sidebar="content"]') as HTMLElement | null
      if (el) {
        if (el.scrollHeight > el.clientHeight || attempts >= maxAttempts) {
          el.scrollTop = value
          return
        }
      }
      if (attempts < maxAttempts) requestAnimationFrame(tryRestore)
    }
    requestAnimationFrame(tryRestore)
  }, [location.pathname])

  return (
    <Suspense fallback={<div className="fixed inset-0 z-40 pointer-events-none"><div className="absolute top-4 right-4"><FullPageSpinner className="w-8 h-8" /></div></div>}>
      <GlobalRouteLoader />
      <Routes>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/fluxos" element={<FluxosPage />} />
          <Route path="/settings/usuarios" element={<UsuariosPage />} />
          <Route path="/integration" element={<IntegrationPage />} />
          <Route path="/integration/settings" element={<IntegrationSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App

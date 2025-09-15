import { Suspense, lazy, useEffect, useState } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { FullPageSpinner } from "@/components/full-page-spinner"

const DashboardPage = lazy(() => import("@/page/dashboard/page"))
const SettingsPage = lazy(() => import("@/page/settings/page"))
const IntegrationPage = lazy(() => import("@/page/integration/page"))

// Global route change overlay spinner
function GlobalRouteLoader({ minDuration = 300 }: { minDuration?: number }) {
  const location = useLocation()
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

  if (!loading) return null
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-background/70 backdrop-blur-sm">
      <FullPageSpinner />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<div className="fixed inset-0 grid place-items-center"><FullPageSpinner /></div>}>
      <GlobalRouteLoader />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/integration" element={<IntegrationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App

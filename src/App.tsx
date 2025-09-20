import { Suspense, lazy, useEffect, useState } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuth } from '@/lib/use-auth'
import { FullPageSpinner } from "@/components/full-page-spinner"
import { useIsFetching } from '@tanstack/react-query'
import { ProtectedRoute } from "@/components/protected-route"
import SidebarLayout from "@/layouts/sidebar-layout"

const DashboardPage = lazy(() => import("@/page/dashboard/page"))
const SettingsPage = lazy(() => import("@/page/settings/page"))
const FluxosPage = lazy(() => import("@/page/settings/fluxos/page"))
const DepositoPage = lazy(() => import("@/page/settings/deposito/page"))
const UsuariosPage = lazy(() => import("@/page/settings/usuarios/page"))
const IntegrationPage = lazy(() => import("@/page/integration/page"))
const IntegrationSettingsPage = lazy(() => import("@/page/integration/settings/page"))
const OrganizacaoIntegrationPage = lazy(() => import("@/page/integration/settings/organizacao/page"))
const LoginPage = lazy(() => import("@/page/login/page"))
const ProductsPage = lazy(() => import("@/page/settings/products/page"))
const NewProductPage = lazy(() => import("@/page/settings/products/new/page"))
const CaracteristicasEstoquePage = lazy(() => import("@/page/settings/caracteristicas-estoque/page"))
const CategoriaProdutoPage = lazy(() => import("@/page/settings/categoria-produto/page"))
const FornecedorPage = lazy(() => import("@/page/settings/fornecedor/page"))

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
  const { isAuthenticated } = useAuth()

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
        {/*
          Rota raiz:
          - Se autenticado envia para /dashboard
          - Se não autenticado envia para /login
          Isso evita efeito de "logout" quando o usuário clica em Início (sidebar agora aponta direto para /dashboard).
        */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings/products" element={<ProductsPage />} />
          <Route path="/settings/products/new" element={<NewProductPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/caracteristicas-estoque" element={<CaracteristicasEstoquePage />} />
          <Route path="/settings/categoria-produto" element={<CategoriaProdutoPage />} />
          <Route path="/settings/fornecedor" element={<FornecedorPage />} />
          <Route path="/settings/fluxos" element={<FluxosPage />} />
          <Route path="/settings/deposito" element={<DepositoPage />} />
          <Route path="/settings/usuarios" element={<UsuariosPage />} />
          <Route path="/integration" element={<IntegrationPage />} />
          <Route path="/integration/settings" element={<IntegrationSettingsPage />} />
          <Route path="/integration/settings/organizacao" element={<OrganizacaoIntegrationPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App

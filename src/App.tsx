import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useIsFetching } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import SidebarLayout from "@/layouts/sidebar-layout";

const DashboardPage = lazy(() => import("@/page/dashboard/page"));
const SettingsPage = lazy(() => import("@/page/settings/page"));
const FluxosPage = lazy(() => import("@/page/settings/fluxos/page"));
const DepositoPage = lazy(() => import("@/page/settings/deposito/page"));
const UsuariosPage = lazy(() => import("@/page/settings/usuarios/page"));
const IntegrationPage = lazy(() => import("@/page/integration/page"));
const IntegrationSettingsPage = lazy(
  () => import("@/page/integration/settings/page")
);
const OrganizacaoPage = lazy(
  () => import("@/page/integration/settings/organizacao/page")
);
const ErpIntegrationPage = lazy(
  () => import("@/page/integration/settings/erp-integration/page")
);
const UnifiedProductPage = lazy(
  () => import("@/page/integration/settings/unified-product/page")
);
const LoginPage = lazy(() => import("@/page/login/page"));
const ProductsPage = lazy(() => import("@/page/settings/products/page"));
const NewProductPage = lazy(() => import("@/page/settings/products/new/page"));
const CaracteristicasEstoquePage = lazy(
  () => import("@/page/settings/caracteristicas-estoque/page")
);
const CategoriaProdutoPage = lazy(
  () => import("@/page/settings/categoria-produto/page")
);
const FornecedorPage = lazy(() => import("@/page/settings/fornecedor/page"));
const NewFornecedorPage = lazy(
  () => import("@/page/settings/fornecedor/new/page")
);
const ClientePage = lazy(() => import("@/page/settings/cliente/page"));
const NewClientePage = lazy(() => import("@/page/settings/cliente/new/page"));
const TransportadoraPage = lazy(
  () => import("@/page/settings/transportadora/page")
);
const NewTransportadoraPage = lazy(
  () => import("@/page/settings/transportadora/new/page")
);
const EstruturaFisicaPage = lazy(
  () => import("@/page/settings/estrutura-fisica/page")
);
const EditEstruturaFisicaPage = lazy(
  () => import("@/page/settings/estrutura-fisica/[id]/edit/page")
);
const EnderecoPage = lazy(() => import("@/page/settings/endereco/page"));
const NewEnderecoPage = lazy(() => import("@/page/settings/endereco/new/page"));
const EstoquePage = lazy(() => import("@/page/estoque/page"));
// ⚠️ REMOVIDO: NewEstoquePage (módulo somente leitura)
const ProfilePage = lazy(() => import("@/page/settings/profile/page"));
const AccountPage = lazy(() => import("@/page/settings/account/page"));
const InventarioPage = lazy(() => import("@/page/inventario/page"));
const NovoInventarioPage = lazy(() => import("@/page/inventario/novo/page"));
const InventarioDetalhePage = lazy(() => import("@/page/inventario/[id]/page"));
const InventarioAjustesPage = lazy(
  () => import("@/page/inventario/[id]/ajustes")
);
const PickingPage = lazy(() => import("@/page/picking/page"));
const NovoPickingPage = lazy(() => import("@/page/picking/novo/page"));
const DefinirEnderecosPage = lazy(
  () => import("@/page/picking/definir-enderecos/[id]/page")
);
const PickingConfiguracaoPage = lazy(
  () => import("@/page/picking/configuracao/page")
);
const PickingCfgMovimentoVerticalPage = lazy(
  () => import("@/page/picking/configuracao/movimento-vertical/page")
);
const PickingCfgTrocaEstoquePage = lazy(
  () => import("@/page/picking/configuracao/troca-estoque/page")
);
const PickingCfgUnitizadorCompletoPage = lazy(
  () => import("@/page/picking/configuracao/unitizador-completo/page")
);
const PickingCfgReservaEstoquePage = lazy(
  () => import("@/page/picking/configuracao/reserva-estoque/page")
);
const PickingCfgCaracteristicasEstoquePage = lazy(
  () => import("@/page/picking/configuracao/caracteristicas-estoque/page")
);
const GrupoEnderecoPage = lazy(
  () => import("@/page/settings/grupo-endereco/page")
);
const NewGrupoEnderecoPage = lazy(
  () => import("@/page/settings/grupo-endereco/new/page")
);
const GrupoEnderecoDetailPage = lazy(
  () => import("@/page/settings/grupo-endereco/[id]/page")
);
const MapeamentoEnderecoPage = lazy(
  () => import("@/page/settings/mapeamento-endereco/page")
);
const NovoMapeamentoEnderecoPage = lazy(
  () => import("@/page/settings/mapeamento-endereco/new/page")
);
const TipoEstoquePage = lazy(() => import("@/page/settings/tipo-estoque/page"));
const DocsPage = lazy(() => import("@/page/docs/page"));
const NovoDocExpedicaoPage = lazy(() => import("@/page/docs/expedicao/new/page"));
const UploadXmlExpedicaoPage = lazy(() => import("@/page/docs/expedicao/new/xml/page"));
const NovoDocExpedicaoManualPage = lazy(() => import("@/page/docs/expedicao/new/manual/page"));
const NovoProcessoExpedicaoPage = lazy(() => import("@/page/expedicao/novo-processo/page"));
const NovoProcessoRecebimentoPage = lazy(() => import("@/page/recebimento/novo-processo/page"));
const NovoDocRecebimentoPage = lazy(() => import("@/page/docs/recebimento/new/page"));
const UploadXmlRecebimentoPage = lazy(() => import("@/page/docs/recebimento/new/xml/page"));
const NovoDocRecebimentoManualPage = lazy(() => import("@/page/docs/recebimento/new/manual/page"));

// Global route change overlay spinner
function GlobalRouteLoader({ minDuration = 300 }: { minDuration?: number }) {
  const location = useLocation();
  const isFetching = useIsFetching();
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setStartTime(Date.now());
  }, [location.pathname]);

  useEffect(() => {
    if (loading && startTime) {
      const t = setTimeout(() => setLoading(false), minDuration);
      return () => clearTimeout(t);
    }
  }, [loading, startTime, minDuration]);

  const networkBusy = isFetching > 0;
  if (!loading && !networkBusy) return null;
  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="absolute top-4 right-4">
        <FullPageSpinner className="w-8 h-8" />
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // After every route change, restore the sidebar scroll position robustly
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-scroll-position");
    if (!saved) return;
    const value = parseInt(saved, 10);
    let attempts = 0;
    const maxAttempts = 60; // ~1s at 60fps
    const tryRestore = () => {
      attempts += 1;
      const el = document.querySelector(
        '[data-sidebar="content"]'
      ) as HTMLElement | null;
      if (el) {
        if (el.scrollHeight > el.clientHeight || attempts >= maxAttempts) {
          el.scrollTop = value;
          return;
        }
      }
      if (attempts < maxAttempts) requestAnimationFrame(tryRestore);
    };
    requestAnimationFrame(tryRestore);
  }, [location.pathname]);

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute top-4 right-4">
            <FullPageSpinner className="w-8 h-8" />
          </div>
        </div>
      }
    >
      <GlobalRouteLoader />
      <Routes>
        {/*
          Rota raiz:
          - Se autenticado envia para /dashboard
          - Se não autenticado envia para /login
          Isso evita efeito de "logout" quando o usuário clica em Início (sidebar agora aponta direto para /dashboard).
        */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings/products" element={<ProductsPage />} />
          <Route path="/settings/products/new" element={<NewProductPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/settings/caracteristicas-estoque"
            element={<CaracteristicasEstoquePage />}
          />
          <Route
            path="/settings/categoria-produto"
            element={<CategoriaProdutoPage />}
          />
          <Route
            path="/settings/estrutura-fisica"
            element={<EstruturaFisicaPage />}
          />
          <Route
            path="/settings/estrutura-fisica/:id/edit"
            element={<EditEstruturaFisicaPage />}
          />
          <Route path="/settings/endereco" element={<EnderecoPage />} />
          <Route path="/settings/endereco/new" element={<NewEnderecoPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/inventario/novo" element={<NovoInventarioPage />} />
          <Route path="/inventario/:id" element={<InventarioDetalhePage />} />
          <Route
            path="/inventario/:id/ajustes"
            element={<InventarioAjustesPage />}
          />
          {/* ⚠️ REMOVIDO: /estoque/new (módulo somente leitura) */}
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/settings/account" element={<AccountPage />} />
          <Route path="/settings/fornecedor" element={<FornecedorPage />} />
          <Route
            path="/settings/fornecedor/new"
            element={<NewFornecedorPage />}
          />
          <Route path="/settings/cliente" element={<ClientePage />} />
          <Route path="/settings/cliente/new" element={<NewClientePage />} />
          <Route
            path="/settings/transportadora"
            element={<TransportadoraPage />}
          />
          <Route
            path="/settings/transportadora/new"
            element={<NewTransportadoraPage />}
          />
          <Route path="/settings/fluxos" element={<FluxosPage />} />
          <Route path="/settings/deposito" element={<DepositoPage />} />
          <Route path="/settings/usuarios" element={<UsuariosPage />} />
          <Route path="/settings/grupo-endereco" element={<GrupoEnderecoPage />} />
          <Route
            path="/settings/grupo-endereco/new"
            element={<NewGrupoEnderecoPage />}
          />
          <Route
            path="/settings/grupo-endereco/:id"
            element={<GrupoEnderecoDetailPage />}
          />
          <Route
            path="/settings/mapeamento-endereco"
            element={<MapeamentoEnderecoPage />}
          />
          <Route
            path="/settings/mapeamento-endereco/novo"
            element={<NovoMapeamentoEnderecoPage />}
          />
          <Route path="/settings/tipo-estoque" element={<TipoEstoquePage />} />
          <Route path="/integration" element={<IntegrationPage />} />
          <Route
            path="/integration/settings"
            element={<IntegrationSettingsPage />}
          />
          <Route
            path="/integration/settings/organizacao"
            element={<OrganizacaoPage />}
          />
          <Route
            path="/integration/settings/erp-integration"
            element={<ErpIntegrationPage />}
          />
          <Route
            path="/integration/settings/unified-product"
            element={<UnifiedProductPage />}
          />
          {/* Documentos */}
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/expedicao/new" element={<NovoDocExpedicaoPage />} />
          <Route path="/docs/expedicao/new/xml" element={<UploadXmlExpedicaoPage />} />
          <Route path="/docs/expedicao/new/manual" element={<NovoDocExpedicaoManualPage />} />
          {/* Novos processos */}
          <Route path="/expedicao/novo-processo" element={<NovoProcessoExpedicaoPage />} />
          <Route path="/recebimento/novo-processo" element={<NovoProcessoRecebimentoPage />} />
          <Route path="/docs/recebimento/new" element={<NovoDocRecebimentoPage />} />
          <Route path="/docs/recebimento/new/xml" element={<UploadXmlRecebimentoPage />} />
          <Route path="/docs/recebimento/new/manual" element={<NovoDocRecebimentoManualPage />} />
          <Route path="/picking" element={<PickingPage />} />
          <Route path="/picking/configuracao" element={<PickingConfiguracaoPage />} />
          <Route path="/picking/configuracao/movimento-vertical" element={<PickingCfgMovimentoVerticalPage />} />
          <Route path="/picking/configuracao/troca-estoque" element={<PickingCfgTrocaEstoquePage />} />
          <Route path="/picking/configuracao/unitizador-completo" element={<PickingCfgUnitizadorCompletoPage />} />
          <Route path="/picking/configuracao/reserva-estoque" element={<PickingCfgReservaEstoquePage />} />
          <Route path="/picking/configuracao/caracteristicas-estoque" element={<PickingCfgCaracteristicasEstoquePage />} />
          <Route path="/picking/novo" element={<NovoPickingPage />} />
          <Route
            path="/picking/definir-enderecos/:id"
            element={<DefinirEnderecosPage />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

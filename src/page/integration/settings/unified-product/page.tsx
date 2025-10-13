import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Loader2, Package, RefreshCw, CheckCircle, HomeIcon, ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/toast-context';
import { apiFetch } from '@/lib/api/client';

interface SyncResult {
  synced: number;
  errors: string[];
  details: string[];
}

export function UnifiedProduct() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const syncProducts = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const result = await apiFetch<SyncResult>('/odbc-integration/sync-products', {
        method: 'POST',
        body: JSON.stringify({
          connectionId: 'temp-connection',
          limit: 100,
          offset: 0,
        }),
      });

      setSyncResult(result);
      setLastSync(new Date());

      toast.show({
        message: `${result.synced} produtos sincronizados com sucesso!`,
        kind: "success",
      });
    } catch (error) {
      toast.show({
        message: error instanceof Error ? error.message : "Não foi possível conectar ao servidor.",
        kind: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">
                    <HomeIcon size={16} aria-hidden="true" />
                    <span className="sr-only">Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/integration">Integração</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/integration/settings">Configurações</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Produto Unificado</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-4 text-2xl font-semibold leading-tight flex items-center gap-2">
            <Package className="h-6 w-6" />
            Produto Unificado
          </h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/integration/settings')} className="shrink-0">
          <ChevronLeft className="size-4" /> Voltar
        </Button>
      </div>

      <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Sincronização com ERP</CardTitle>
          <CardDescription>
            Sincronize produtos do ERP com o cadastro unificado do sistema WMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Importe produtos do sistema ERP através da conexão ODBC configurada
              </p>
              {lastSync && (
                <p className="text-xs text-gray-500 mt-1">
                  Última sincronização: {lastSync.toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            <Button
              onClick={syncProducts}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sincronizar Produtos
            </Button>
          </div>

          {syncResult && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm text-green-800">
                  <strong>{syncResult.synced} produtos</strong> sincronizados com sucesso
                </p>
                {syncResult.errors.length > 0 && (
                  <p className="text-sm text-red-600">
                    <strong>{syncResult.errors.length} erros</strong> encontrados durante a sincronização
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração da Integração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Status da Conexão</Badge>
                <span className="text-sm">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Conectado
                  </span>
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Produtos no ERP</Badge>
                <span className="text-sm">∞ (ilimitado)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Processo de Sincronização</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Conecta ao banco de dados ERP via ODBC</p>
              <p>2. Executa query para buscar produtos ativos</p>
              <p>3. Mapeia dados do ERP para formato WMS</p>
              <p>4. Verifica produtos existentes e atualiza/cria conforme necessário</p>
              <p>5. Registra log de sincronização</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Sincronizações</CardTitle>
        </CardHeader>
        <CardContent>
          {lastSync ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {lastSync.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Badge variant="secondary">Sucesso</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma sincronização realizada ainda</p>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default UnifiedProduct;
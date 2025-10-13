import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  synced: number;
  errors: string[];
  details: string[];
}

export function UnifiedProduct() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const syncProducts = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('http://localhost:3000/odbc-integration/sync-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          connectionId: 'temp-connection',
          limit: 100,
          offset: 0,
        }),
      });

      if (response.ok) {
        const result: SyncResult = await response.json();
        setSyncResult(result);
        setLastSync(new Date());

        toast({
          title: "Sincronização concluída",
          description: `${result.synced} produtos sincronizados com sucesso.`,
        });
      } else {
        const error = await response.text();
        toast({
          title: "Erro na sincronização",
          description: `Erro: ${error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6" />
        <h2 className="text-lg font-semibold">Produto Unificado</h2>
      </div>

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
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>{syncResult.synced} produtos</strong> sincronizados com sucesso
                  </p>
                  {syncResult.errors.length > 0 && (
                    <p className="text-red-600">
                      <strong>{syncResult.errors.length} erros</strong> encontrados durante a sincronização
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
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
  );
}

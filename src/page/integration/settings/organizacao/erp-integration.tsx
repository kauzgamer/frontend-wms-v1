import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OdbcConnection {
  dsn: string;
  uid: string;
  pwd: string;
  host: string;
  port?: number;
  database: string;
}

interface SyncResult {
  synced: number;
  errors: string[];
  details: string[];
}

export function ErpIntegration() {
  const { toast } = useToast();
  const [connection, setConnection] = useState<OdbcConnection>({
    dsn: 'sm-ems2cad',
    uid: 'ODBC',
    pwd: 'St@M@r1aodbc',
    host: '181.41.190.57',
    port: 40001,
    database: 'ems2cad',
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const handleInputChange = (field: keyof OdbcConnection, value: string | number) => {
    setConnection(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:3000/odbc-integration/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(connection),
      });

      if (response.ok) {
        setTestResult(true);
        toast({
          title: "Conexão bem-sucedida",
          description: "A conexão ODBC foi estabelecida com sucesso.",
        });
      } else {
        const error = await response.text();
        setTestResult(false);
        toast({
          title: "Erro na conexão",
          description: `Erro: ${error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult(false);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

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
          connectionId: 'temp-connection', // Por enquanto usando ID temporário
          limit: 100,
          offset: 0,
        }),
      });

      if (response.ok) {
        const result: SyncResult = await response.json();
        setSyncResult(result);
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
        <Database className="h-6 w-6" />
        <h2 className="text-lg font-semibold">Integração ERP via ODBC</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Conexão ODBC</CardTitle>
          <CardDescription>
            Configure os parâmetros de conexão com o banco de dados do ERP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dsn">DSN</Label>
              <Input
                id="dsn"
                value={connection.dsn}
                onChange={(e) => handleInputChange('dsn', e.target.value)}
                placeholder="sm-ems2cad"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uid">UID</Label>
              <Input
                id="uid"
                value={connection.uid}
                onChange={(e) => handleInputChange('uid', e.target.value)}
                placeholder="ODBC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd">Senha</Label>
              <Input
                id="pwd"
                type="password"
                value={connection.pwd}
                onChange={(e) => handleInputChange('pwd', e.target.value)}
                placeholder="St@M@r1aodbc"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={connection.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                placeholder="181.41.190.57"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Porta</Label>
              <Input
                id="port"
                type="number"
                value={connection.port || ''}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 40001)}
                placeholder="40001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                value={connection.database}
                onChange={(e) => handleInputChange('database', e.target.value)}
                placeholder="ems2cad"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : testResult === true ? (
                <CheckCircle className="h-4 w-4" />
              ) : testResult === false ? (
                <AlertCircle className="h-4 w-4" />
              ) : null}
              Testar Conexão
            </Button>

            <Button
              onClick={syncProducts}
              disabled={isTesting || isSyncing || testResult !== true}
              variant="outline"
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

          {testResult === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Falha na conexão ODBC. Verifique os parâmetros de conexão.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {syncResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Sincronização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">
                {syncResult.synced} produtos sincronizados com sucesso
              </span>
            </div>

            {syncResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">
                  Erros encontrados ({syncResult.errors.length}):
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {syncResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {syncResult.details.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Produtos processados:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {syncResult.details.slice(0, 10).map((detail, index) => (
                    <div key={index} className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      {detail}
                    </div>
                  ))}
                  {syncResult.details.length > 10 && (
                    <div className="text-sm text-gray-500 italic">
                      ... e mais {syncResult.details.length - 10} produtos
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações da Integração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>Query utilizada:</strong>
            <pre className="bg-gray-50 p-2 rounded mt-1 text-xs overflow-x-auto">
              SELECT "it-codigo","desc-item","un","peso-bruto","fm-cod-com","comprim","altura","largura" FROM ems2cad.pub."item"
            </pre>
          </div>
          <div>
            <strong>Campos mapeados:</strong>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li><code>it-codigo</code> → SKU / Código externo</li>
            <li><code>desc-item</code> → Nome do produto / Descrição mobile</li>
            <li><code>un</code> → Unidade de medida</li>
            <li><code>peso-bruto</code> → Peso em kg</li>
            <li><code>comprim</code> → Comprimento</li>
            <li><code>altura</code> → Altura</li>
            <li><code>largura</code> → Largura</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

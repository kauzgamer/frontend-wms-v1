import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Database, HomeIcon, Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast-context';
import { useBatchStatus, useOdbcLogs, useProcessStage } from '@/lib/hooks/use-odbc-integration';

export function ErpIntegration() {
  const navigate = useNavigate();
  const toast = useToast();

  const [batchId, setBatchId] = useState('');
  const processStage = useProcessStage();
  const { data: status, refetch: refetchStatus, isFetching: fetchingStatus } = useBatchStatus(batchId || undefined);
  const { data: logs = [], isFetching: fetchingLogs, refetch: refetchLogs } = useOdbcLogs();

  const onProcess = (stage: 'categories' | 'products' | 'skus') => {
    if (!batchId) {
      toast.show({ kind: 'error', message: 'Informe o Batch ID para processar.' });
      return;
    }
    processStage.mutate(
      { batchId, stage },
      {
        onSuccess: (res) => {
          toast.show({ kind: 'success', message: `${res.processed} itens processados (${res.stage}).` });
          refetchStatus();
        },
        onError: (err) => {
          toast.show({ kind: 'error', message: err instanceof Error ? err.message : 'Falha ao processar etapa.' });
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <header className="flex items-start justify-between gap-4">
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
                <BreadcrumbPage>Integração ERP</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="mt-4 flex items-center gap-2 text-2xl font-semibold leading-tight">
            <Database className="h-6 w-6" />
            Integração ERP via Desktop Agent
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O Desktop Agent realiza a extração ODBC na sua rede e envia os dados ao backend. Aqui você acompanha e processa os lotes.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/integration/settings')}>
          <ChevronLeft className="size-4" />
          Voltar
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Instruções Desktop Agent */}
        <Card>
          <CardHeader>
            <CardTitle>Como configurar o Desktop Agent</CardTitle>
            <CardDescription>
              Execute o Agent na sua rede local para extrair os dados do ERP e enviar para o WMS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal pl-4 space-y-1">
              <li>Instale e abra o aplicativo Desktop Agent (Electron).</li>
              <li>Configure a conexão ODBC (DSN, usuário, senha, host, porta, database).</li>
              <li>Configure a URL da API do WMS e autentique-se.</li>
              <li>Inicie a sincronização para enviar os produtos ao backend.</li>
              <li>Use o Batch ID retornado para processar as etapas abaixo.</li>
            </ol>
            <p className="text-xs text-muted-foreground">
              As credenciais ODBC ficam apenas no Agent. O backend não acessa o ERP diretamente.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Processar Lote */}
          <Card>
            <CardHeader>
              <CardTitle>Processar lote (staging → categorias/produtos/SKUs)</CardTitle>
              <CardDescription>
                Informe o Batch ID retornado pelo Agent e execute as etapas em ordem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[220px]">
                  <label htmlFor="batch-id" className="text-sm font-medium">Batch ID</label>
                  <Input id="batch-id" placeholder="UUID do lote" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
                </div>
                <Button type="button" variant="outline" onClick={() => refetchStatus()} disabled={!batchId || fetchingStatus}>
                  {fetchingStatus ? <Loader2 className="mr-2 size-4 animate-spin"/> : <RefreshCw className="mr-2 size-4"/>}
                  Atualizar status
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button type="button" variant="secondary" disabled={processStage.isPending || !batchId} onClick={() => onProcess('categories')}>
                    {processStage.isPending ? <Loader2 className="mr-2 size-4 animate-spin"/> : null}
                    Categorias
                  </Button>
                  <Button type="button" variant="secondary" disabled={processStage.isPending || !batchId} onClick={() => onProcess('products')}>
                    {processStage.isPending ? <Loader2 className="mr-2 size-4 animate-spin"/> : null}
                    Produtos
                  </Button>
                  <Button type="button" disabled={processStage.isPending || !batchId} onClick={() => onProcess('skus')}>
                    {processStage.isPending ? <Loader2 className="mr-2 size-4 animate-spin"/> : null}
                    SKUs
                  </Button>
                </div>
              </div>

              {status && (
                <div className="rounded-md border p-3 text-sm">
                  <p className="font-medium">Status do lote {status.batchId}</p>
                  <p>Total de registros: {status.total}</p>
                  <ul className="mt-2 grid gap-1 md:grid-cols-3">
                    {status.breakdown.map((b) => (
                      <li key={b.status} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{b.status}</span>: {b.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Logs recentes</CardTitle>
                <CardDescription>Últimas integrações e sincronizações.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchLogs()} disabled={fetchingLogs}>
                {fetchingLogs ? <Loader2 className="mr-2 size-4 animate-spin"/> : <RefreshCw className="mr-2 size-4"/>}
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem logs disponíveis.</p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr className="text-left">
                        <th className="py-2 px-3 font-medium">Data</th>
                        <th className="py-2 px-3 font-medium">Documento</th>
                        <th className="py-2 px-3 font-medium">Chave</th>
                        <th className="py-2 px-3 font-medium">Processo</th>
                        <th className="py-2 px-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.slice(0, 10).map((row) => (
                        <tr key={row.id} className="border-t hover:bg-muted/30">
                          <td className="py-2 px-3 whitespace-nowrap">{new Date(row.date).toLocaleDateString('pt-BR')}</td>
                          <td className="py-2 px-3">{row.document}</td>
                          <td className="py-2 px-3 font-mono text-xs">{row.key}</td>
                          <td className="py-2 px-3">{row.process}</td>
                          <td className="py-2 px-3">
                            {row.status === 'success' && <span className="inline-flex items-center gap-1 text-green-600">✓ Sucesso</span>}
                            {row.status === 'failed' && <span className="inline-flex items-center gap-1 text-red-600">✗ Falha</span>}
                            {row.status === 'quarantine' && <span className="inline-flex items-center gap-1 text-amber-600">⚠ Parcial</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ErpIntegration;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Loader2, Package, Database, Layers, Box, CheckCircle2, HomeIcon, ChevronLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast-context';
import { apiFetch } from '@/lib/api/client';

interface StageStatus {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  processed?: number;
  errors?: number;
  message?: string;
}

export function UnifiedProduct() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [batchId, setBatchId] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(100);
  
  const [stages, setStages] = useState<StageStatus[]>([
    { name: 'Importar Dados', status: 'pending' },
    { name: 'Processar Categorias', status: 'pending' },
    { name: 'Processar Produtos', status: 'pending' },
    { name: 'Processar SKUs', status: 'pending' },
  ]);

  const connection = {
    dsn: 'sm-ems2cad',
    uid: 'ODBC',
    pwd: 'St@M@r1aodbc',
    host: '181.41.190.57',
    port: 40001,
    database: 'ems2cad',
  };

  const updateStage = (index: number, updates: Partial<StageStatus>) => {
    setStages(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  // ETAPA 1: Importar dados
  const importData = async () => {
    updateStage(0, { status: 'processing' });

    try {
      const result = await apiFetch<{ batchId: string; totalRecords: number; message: string }>('/odbc-integration/staged/import', {
        method: 'POST',
        body: JSON.stringify({ connection, limit }),
      });

      setBatchId(result.batchId);
      setTotalRecords(result.totalRecords);
      
      updateStage(0, { 
        status: 'completed', 
        processed: result.totalRecords,
        message: result.message,
      });

      toast.show({
        message: `✅ ${result.totalRecords} produtos importados!`,
        kind: 'success',
      });
    } catch (error: any) {
      updateStage(0, { 
        status: 'error',
        message: error.message,
      });
      toast.show({
        message: error.message || 'Erro ao importar dados',
        kind: 'error',
      });
    }
  };

  // ETAPA 2-4: Processar etapa
  const processStage = async (stageIndex: number, stageName: 'categories' | 'products' | 'skus') => {
    if (!batchId) {
      toast.show({ message: 'Execute a importação primeiro', kind: 'error' });
      return;
    }

    updateStage(stageIndex, { status: 'processing' });

    try {
      const result = await apiFetch<{ stage: string; processed: number; errors: number; details: string[] }>('/odbc-integration/staged/process', {
        method: 'POST',
        body: JSON.stringify({ batchId, stage: stageName }),
      });

      updateStage(stageIndex, { 
        status: result.errors > 0 ? 'error' : 'completed',
        processed: result.processed,
        errors: result.errors,
        message: `${result.processed} processados, ${result.errors} erros`,
      });

      toast.show({
        message: `✅ ${result.processed} ${stageName} processados!`,
        kind: result.errors > 0 ? 'info' : 'success',
      });
    } catch (error: any) {
      updateStage(stageIndex, { 
        status: 'error',
        message: error.message,
      });
      toast.show({
        message: error.message || `Erro ao processar ${stageName}`,
        kind: 'error',
      });
    }
  };

  // Executar tudo automaticamente
  const runAll = async () => {
    updateStage(0, { status: 'processing' });

    try {
      // ETAPA 1: Importar
      const importResult = await apiFetch<{ batchId: string; totalRecords: number; message: string }>('/odbc-integration/staged/import', {
        method: 'POST',
        body: JSON.stringify({ connection, limit }),
      });

      const currentBatchId = importResult.batchId;
      setBatchId(currentBatchId);
      setTotalRecords(importResult.totalRecords);
      
      updateStage(0, { 
        status: 'completed', 
        processed: importResult.totalRecords,
        message: importResult.message,
      });

      toast.show({
        message: `✅ ${importResult.totalRecords} produtos importados!`,
        kind: 'success',
      });

      await new Promise(r => setTimeout(r, 500));

      // ETAPA 2: Categorias
      updateStage(1, { status: 'processing' });
      const catResult = await apiFetch<{ stage: string; processed: number; errors: number; details: string[] }>('/odbc-integration/staged/process', {
        method: 'POST',
        body: JSON.stringify({ batchId: currentBatchId, stage: 'categories' }),
      });

      updateStage(1, { 
        status: catResult.errors > 0 ? 'error' : 'completed',
        processed: catResult.processed,
        errors: catResult.errors,
        message: `${catResult.processed} processados, ${catResult.errors} erros`,
      });

      await new Promise(r => setTimeout(r, 500));

      // ETAPA 3: Produtos
      updateStage(2, { status: 'processing' });
      const prodResult = await apiFetch<{ stage: string; processed: number; errors: number; details: string[] }>('/odbc-integration/staged/process', {
        method: 'POST',
        body: JSON.stringify({ batchId: currentBatchId, stage: 'products' }),
      });

      updateStage(2, { 
        status: prodResult.errors > 0 ? 'error' : 'completed',
        processed: prodResult.processed,
        errors: prodResult.errors,
        message: `${prodResult.processed} processados, ${prodResult.errors} erros`,
      });

      await new Promise(r => setTimeout(r, 500));

      // ETAPA 4: SKUs
      updateStage(3, { status: 'processing' });
      const skuResult = await apiFetch<{ stage: string; processed: number; errors: number; details: string[] }>('/odbc-integration/staged/process', {
        method: 'POST',
        body: JSON.stringify({ batchId: currentBatchId, stage: 'skus' }),
      });

      updateStage(3, { 
        status: skuResult.errors > 0 ? 'error' : 'completed',
        processed: skuResult.processed,
        errors: skuResult.errors,
        message: `${skuResult.processed} processados, ${skuResult.errors} erros`,
      });

      toast.show({
        message: '🎉 Todas as etapas concluídas com sucesso!',
        kind: 'success',
      });
    } catch (error: any) {
      toast.show({
        message: error.message || 'Erro durante o processamento',
        kind: 'error',
      });
    }
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="size-5 text-green-600" />;
      case 'processing': return <Loader2 className="size-5 text-blue-600 animate-spin" />;
      case 'error': return <AlertCircle className="size-5 text-red-600" />;
      default: return <div className="size-5 rounded-full border-2 border-gray-300" />;
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

          <h1 className="mt-4 text-2xl font-semibold">Sincronização de Produtos - Em Etapas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Importe e processe produtos do ERP em etapas controladas
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/integration/settings')}>
          <ChevronLeft className="size-4" />
          Voltar
        </Button>
      </div>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Configuração da Importação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Limite de produtos:</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
              className="w-32 h-9 rounded-md border px-3 text-sm"
              min="10"
              max="1000"
              step="10"
            />
            <span className="text-xs text-muted-foreground">
              Recomendado: 100-500 produtos por lote
            </span>
          </div>

          {batchId && (
            <div className="p-3 bg-muted/30 rounded-md">
              <div className="text-xs font-mono text-muted-foreground">Batch ID:</div>
              <div className="font-mono text-sm">{batchId}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Total de registros: {totalRecords}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Etapas */}
      <Card>
        <CardHeader>
          <CardTitle>Etapas de Processamento</CardTitle>
          <CardDescription>Execute as etapas em sequência ou use "Executar Tudo"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Etapa 1: Importar */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            {getStageIcon(stages[0].status)}
            <div className="flex-1">
              <div className="font-medium">1. Importar Dados do ERP</div>
              <div className="text-sm text-muted-foreground">
                {stages[0].message || 'Busca produtos do ERP e salva em tabela temporária'}
              </div>
            </div>
            <Button
              onClick={importData}
              disabled={stages[0].status === 'processing' || stages[0].status === 'completed'}
              size="sm"
            >
              {stages[0].status === 'processing' ? (
                <><Loader2 className="size-4 animate-spin" /> Importando...</>
              ) : stages[0].status === 'completed' ? (
                'Concluído'
              ) : (
                'Importar'
              )}
            </Button>
          </div>

          {/* Etapa 2: Categorias */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            {getStageIcon(stages[1].status)}
            <div className="flex-1">
              <div className="font-medium">2. Processar Categorias</div>
              <div className="text-sm text-muted-foreground">
                {stages[1].message || 'Cria categorias únicas dos produtos'}
              </div>
            </div>
            <Button
              onClick={() => processStage(1, 'categories')}
              disabled={!batchId || stages[0].status !== 'completed' || stages[1].status === 'processing'}
              size="sm"
            >
              {stages[1].status === 'processing' ? (
                <><Loader2 className="size-4 animate-spin" /> Processando...</>
              ) : stages[1].status === 'completed' ? (
                'Concluído'
              ) : (
                'Processar'
              )}
            </Button>
          </div>

          {/* Etapa 3: Produtos */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            {getStageIcon(stages[2].status)}
            <div className="flex-1">
              <div className="font-medium">3. Processar Produtos</div>
              <div className="text-sm text-muted-foreground">
                {stages[2].message || 'Cria/atualiza produtos no sistema'}
              </div>
            </div>
            <Button
              onClick={() => processStage(2, 'products')}
              disabled={!batchId || stages[1].status !== 'completed' || stages[2].status === 'processing'}
              size="sm"
            >
              {stages[2].status === 'processing' ? (
                <><Loader2 className="size-4 animate-spin" /> Processando...</>
              ) : stages[2].status === 'completed' ? (
                'Concluído'
              ) : (
                'Processar'
              )}
            </Button>
          </div>

          {/* Etapa 4: SKUs */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            {getStageIcon(stages[3].status)}
            <div className="flex-1">
              <div className="font-medium">4. Processar SKUs e Dimensões</div>
              <div className="text-sm text-muted-foreground">
                {stages[3].message || 'Cria SKUs vinculados aos produtos com dimensões'}
              </div>
            </div>
            <Button
              onClick={() => processStage(3, 'skus')}
              disabled={!batchId || stages[2].status !== 'completed' || stages[3].status === 'processing'}
              size="sm"
            >
              {stages[3].status === 'processing' ? (
                <><Loader2 className="size-4 animate-spin" /> Processando...</>
              ) : stages[3].status === 'completed' ? (
                'Concluído'
              ) : (
                'Processar'
              )}
            </Button>
          </div>

          {/* Botão executar tudo */}
          <div className="pt-4 border-t">
            <Button
              onClick={runAll}
              disabled={stages[0].status === 'processing' || stages[0].status === 'completed'}
              className="w-full"
              size="lg"
            >
              {stages[0].status === 'processing' ? (
                <><Loader2 className="size-4 animate-spin" /> Executando...</>
              ) : (
                <><Package className="size-4" /> Executar Todas as Etapas</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            <span><strong>Importar:</strong> Busca produtos do ERP e salva em tabela temporária</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            <span><strong>Categorias:</strong> Processa categorias únicas (fm-cod-com)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            <span><strong>Produtos:</strong> Cria/atualiza produtos com suas categorias</span>
                </div>
          <div className="flex gap-2">
            <span className="font-semibold text-foreground">4.</span>
            <span><strong>SKUs:</strong> Cria SKUs vinculados aos produtos com dimensões</span>
              </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-xs">
              💡 <strong>Dica:</strong> Processe em lotes de 100-500 produtos. Para importar todos os 7000+ produtos, 
              execute múltiplas vezes aumentando o limit ou use "Executar Tudo" várias vezes.
            </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnifiedProduct;

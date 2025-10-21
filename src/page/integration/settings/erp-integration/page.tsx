import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Database,
  HomeIcon,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash,
} from 'lucide-react';

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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast-context';

import {
  useCreateOdbcConfig,
  useDeleteOdbcConfig,
  useOdbcConfigs,
  useTestOdbcConnection,
  useTriggerOdbcImport,
  useTriggerOdbcSync,
  useUpdateOdbcConfig,
} from '@/lib/hooks/use-odbc-integration';
import type {
  OdbcIntegrationConfig,
  OdbcImportResponse,
  OdbcSyncResult,
  TestOdbcConnectionPayload,
} from '@/lib/types/odbc-integration';

type FormState = {
  name: string;
  description: string;
  query: string;
  connection: {
    dsn: string;
    uid: string;
    pwd: string;
    host: string;
    port?: number;
    database: string;
  };
};

const DEFAULT_QUERY = `SELECT "it-codigo","desc-item","un","peso-bruto","fm-cod-com","comprim","altura","largura" FROM ems2cad.pub."item"`;

const emptyForm = (): FormState => ({
  name: '',
  description: '',
  query: DEFAULT_QUERY,
  connection: {
    dsn: '',
    uid: '',
    pwd: '',
    host: '',
    port: undefined,
    database: '',
  },
});

const DEFAULT_BATCH_LIMIT = 100;

export function ErpIntegration() {
  const navigate = useNavigate();
  const toast = useToast();

  const { data: configs = [], isLoading: isLoadingConfigs } = useOdbcConfigs();
  const createConfig = useCreateOdbcConfig();
  const updateConfig = useUpdateOdbcConfig();
  const deleteConfig = useDeleteOdbcConfig();
  const testConnection = useTestOdbcConnection();
  const triggerImport = useTriggerOdbcImport();
  const triggerSync = useTriggerOdbcSync();

  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [batchLimit, setBatchLimit] = useState<number>(DEFAULT_BATCH_LIMIT);

  const [testStatus, setTestStatus] = useState<
    | { status: 'idle' }
    | { status: 'success'; message: string; details?: string[] }
    | { status: 'error'; message: string }
  >({ status: 'idle' });

  const [lastImport, setLastImport] = useState<OdbcImportResponse | null>(null);
  const [lastSync, setLastSync] = useState<OdbcSyncResult | null>(null);

  const isSaving = createConfig.isPending || updateConfig.isPending;

  const selectedConfig = useMemo(
    () => configs.find((config) => config.id === selectedConfigId) ?? null,
    [configs, selectedConfigId],
  );

  useEffect(() => {
    if (!selectedConfig) {
      setForm((prev) => prev);
      return;
    }

    setForm({
      name: selectedConfig.name,
      description: selectedConfig.description ?? '',
      query: selectedConfig.query,
      connection: {
        dsn: selectedConfig.connection.dsn,
        uid: selectedConfig.connection.uid,
        pwd: selectedConfig.connection.pwd,
        host: selectedConfig.connection.host,
        port: selectedConfig.connection.port ?? undefined,
        database: selectedConfig.connection.database,
      },
    });
  }, [selectedConfig]);

  const resetToNewConfig = () => {
    setSelectedConfigId(null);
    setForm(emptyForm());
    setTestStatus({ status: 'idle' });
    setLastImport(null);
    setLastSync(null);
  };

  const handleSelectConfig = (config: OdbcIntegrationConfig) => {
    setSelectedConfigId(config.id);
    setTestStatus({ status: 'idle' });
    setLastImport(null);
    setLastSync(null);
  };

  const handleFormChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnectionChange = <K extends keyof FormState['connection']>(
    field: K,
    value: FormState['connection'][K],
  ) => {
    setForm((prev) => ({
      ...prev,
      connection: {
        ...prev.connection,
        [field]: value,
      },
    }));
  };

  const buildPayload = (includeQuery = true): TestOdbcConnectionPayload => {
    const payload: TestOdbcConnectionPayload = selectedConfigId
      ? { configId: selectedConfigId }
      : { connection: { ...form.connection } };

    if (includeQuery) {
      payload.query = form.query;
    }
    payload.limit = batchLimit;
    return payload;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      query: form.query,
      connection: {
        ...form.connection,
        port: form.connection.port,
      },
    };

    if (!payload.name) {
      toast.show({ kind: 'error', message: 'Nome da configuração é obrigatório.' });
      return;
    }

    if (selectedConfigId) {
      updateConfig.mutate(
        { id: selectedConfigId, data: payload },
        {
          onSuccess: (updated) => {
            toast.show({ kind: 'success', message: `Configuração "${updated.name}" atualizada.` });
          },
          onError: (error) => {
            toast.show({
              kind: 'error',
              message:
                error instanceof Error
                  ? error.message
                  : 'Não foi possível atualizar a configuração.',
            });
          },
        },
      );
    } else {
      createConfig.mutate(payload, {
        onSuccess: (created) => {
          setSelectedConfigId(created.id);
          toast.show({ kind: 'success', message: `Configuração "${created.name}" criada.` });
        },
        onError: (error) => {
          toast.show({
            kind: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Não foi possível criar a configuração.',
          });
        },
      });
    }
  };

  const handleDeleteConfig = () => {
    if (!selectedConfigId) return;

    deleteConfig.mutate(selectedConfigId, {
      onSuccess: () => {
        toast.show({ kind: 'success', message: 'Configuração removida.' });
        resetToNewConfig();
      },
      onError: (error) => {
        toast.show({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Não foi possível remover a configuração.',
        });
      },
    });
  };

  const handleTestConnection = () => {
    setTestStatus({ status: 'idle' });
    setLastImport(null);
    setLastSync(null);

    const payload = buildPayload();

    testConnection.mutate(payload, {
      onSuccess: (result) => {
        setTestStatus({
          status: 'success',
          message: result.message ?? 'Conexão ODBC validada com sucesso.',
          details: result.details,
        });
        toast.show({
          kind: 'success',
          message: result.message ?? 'Conexão ODBC validada com sucesso.',
        });
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'Falha ao testar conexão ODBC.';
        setTestStatus({ status: 'error', message });
        toast.show({ kind: 'error', message });
      },
    });
  };

  const handleImport = () => {
    setLastImport(null);
    const payload = buildPayload();

    triggerImport.mutate(payload, {
      onSuccess: (data) => {
        setLastImport(data);
        toast.show({
          kind: 'success',
          message: `${data.totalRecords} registros importados para staging.`,
        });
      },
      onError: (error) => {
        toast.show({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Falha ao iniciar importação.',
        });
      },
    });
  };

  const handleSync = () => {
    setLastSync(null);
    if (!selectedConfigId) {
      toast.show({
        kind: 'error',
        message: 'Salve a configuração antes de executar a sincronização completa.',
      });
      return;
    }

    triggerSync.mutate(
      {
        configId: selectedConfigId,
        limit: batchLimit,
        offset: 0,
      },
      {
        onSuccess: (data) => {
          setLastSync(data);
          toast.show({
            kind: 'success',
            message: `${data.synced} registros sincronizados com sucesso.`,
          });
        },
        onError: (error) => {
          toast.show({
            kind: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Falha ao executar sincronização.',
          });
        },
      },
    );
  };

  const disabledConnectionActions =
    testConnection.isPending || triggerImport.isPending || triggerSync.isPending;

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
            Integração ERP via ODBC
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie múltiplas conexões e consultas ODBC para sincronizar dados do ERP.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/integration/settings')}>
          <ChevronLeft className="size-4" />
          Voltar
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configurações salvas</CardTitle>
              <CardDescription>
                Selecione uma configuração ou crie uma nova.
              </CardDescription>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={resetToNewConfig}
              title="Nova configuração"
            >
              <Plus className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingConfigs ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : configs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma configuração cadastrada até o momento.
              </p>
            ) : (
              <ul className="space-y-2">
                {configs.map((config) => {
                  const isActive = config.id === selectedConfigId;
                  return (
                    <li
                      key={config.id}
                      className="rounded-md border bg-card transition hover:border-primary"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectConfig(config)}
                        className={`flex w-full flex-col items-start gap-1 rounded-md px-3 py-2 text-left text-sm ${
                          isActive ? 'border border-primary bg-primary/10' : ''
                        }`}
                      >
                        <span className="font-medium text-foreground">{config.name}</span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {config.description || config.query}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {selectedConfigId && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                disabled={deleteConfig.isPending}
                onClick={handleDeleteConfig}
              >
                {deleteConfig.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash className="mr-2 size-4" />
                )}
                Remover configuração
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{selectedConfigId ? 'Editar configuração' : 'Nova configuração'}</CardTitle>
                <CardDescription>
                  Defina a consulta SQL e os parâmetros da conexão ODBC a serem utilizados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="config-name">Nome</Label>
                    <Input
                      id="config-name"
                      placeholder="Produtos ERP"
                      value={form.name}
                      onChange={(event) => handleFormChange('name', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-description">Descrição</Label>
                    <Input
                      id="config-description"
                      placeholder="Sincronização de produtos e dimensões"
                      value={form.description}
                      onChange={(event) => handleFormChange('description', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="config-query">Consulta SQL</Label>
                    <Textarea
                      id="config-query"
                      value={form.query}
                      onChange={(event) => handleFormChange('query', event.target.value)}
                      className="min-h-[140px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Utilize a sintaxe suportada pelo driver ODBC configurado.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <CardTitle className="text-base">Parâmetros de conexão</CardTitle>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="connection-dsn">DSN</Label>
                      <Input
                        id="connection-dsn"
                        value={form.connection.dsn}
                        onChange={(event) =>
                          handleConnectionChange('dsn', event.target.value)
                        }
                        placeholder="sm-ems2cad"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection-uid">Usuário</Label>
                      <Input
                        id="connection-uid"
                        value={form.connection.uid}
                        onChange={(event) =>
                          handleConnectionChange('uid', event.target.value)
                        }
                        placeholder="ODBC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection-pwd">Senha</Label>
                      <Input
                        id="connection-pwd"
                        type="password"
                        value={form.connection.pwd}
                        onChange={(event) =>
                          handleConnectionChange('pwd', event.target.value)
                        }
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection-host">Host</Label>
                      <Input
                        id="connection-host"
                        value={form.connection.host}
                        onChange={(event) =>
                          handleConnectionChange('host', event.target.value)
                        }
                        placeholder="127.0.0.1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection-port">Porta</Label>
                      <Input
                        id="connection-port"
                        type="number"
                        value={form.connection.port?.toString() ?? ''}
                        onChange={(event) =>
                          handleConnectionChange(
                            'port',
                            event.target.value
                              ? Number.parseInt(event.target.value, 10)
                              : undefined,
                          )
                        }
                        placeholder="40001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection-database">Database</Label>
                      <Input
                        id="connection-database"
                        value={form.connection.database}
                        onChange={(event) =>
                          handleConnectionChange('database', event.target.value)
                        }
                        placeholder="ems2cad"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="batch-limit">Limite (lote)</Label>
                    <Input
                      id="batch-limit"
                      type="number"
                      min={10}
                      max={1000}
                      step={10}
                      value={batchLimit}
                      onChange={(event) => {
                        const value = Number.parseInt(event.target.value, 10);
                        setBatchLimit(Number.isNaN(value) ? DEFAULT_BATCH_LIMIT : value);
                      }}
                      className="w-28"
                    />
                  </div>

                  <div className="flex flex-1 justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={disabledConnectionActions}
                    >
                      {testConnection.isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 size-4" />
                      )}
                      Testar conexão
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleImport}
                      disabled={disabledConnectionActions}
                    >
                      {triggerImport.isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Database className="mr-2 size-4" />
                      )}
                      Importar para staging
                    </Button>

                    <Button
                      type="button"
                      onClick={handleSync}
                      disabled={disabledConnectionActions || !selectedConfigId}
                    >
                      {triggerSync.isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 size-4" />
                      )}
                      Sincronizar dados
                    </Button>

                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 size-4" />
                      )}
                      {selectedConfigId ? 'Salvar alterações' : 'Salvar configuração'}
                    </Button>
                  </div>
                </div>

                {testStatus.status !== 'idle' && (
                  <div
                    className={`flex gap-3 rounded-lg border p-3 text-sm ${
                      testStatus.status === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {testStatus.status === 'success' ? (
                      <CheckCircle2 className="mt-0.5 size-4 flex-none" />
                    ) : (
                      <AlertCircle className="mt-0.5 size-4 flex-none" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">
                        {testStatus.status === 'success'
                          ? 'Conexão validada'
                          : 'Falha ao validar conexão'}
                      </p>
                      <p>{testStatus.message}</p>
                      {testStatus.status === 'success' && testStatus.details?.length ? (
                        <ul className="list-disc pl-4 text-xs">
                          {testStatus.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                )}

                {lastImport && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                    <p className="font-medium">
                      Importação criada — lote {lastImport.batchId}
                    </p>
                    <p>Total de registros: {lastImport.totalRecords}</p>
                    <p>{lastImport.message}</p>
                  </div>
                )}

                {lastSync && (
                  <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    <p className="font-medium">
                      {lastSync.synced} registros sincronizados com sucesso.
                    </p>

                    {lastSync.errors.length > 0 && (
                      <div>
                        <p className="font-medium text-red-700">
                          Erros encontrados ({lastSync.errors.length})
                        </p>
                        <ul className="list-disc pl-4 text-red-700">
                          {lastSync.errors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-xs">
                              {error}
                            </li>
                          ))}
                          {lastSync.errors.length > 5 && (
                            <li className="text-xs italic">
                              ... e mais {lastSync.errors.length - 5} erros.
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {lastSync.details.length > 0 && (
                      <div>
                        <p className="font-medium">Últimos itens processados</p>
                        <ul className="list-disc pl-4 text-xs">
                          {lastSync.details.slice(0, 5).map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                          {lastSync.details.length > 5 && (
                            <li className="italic">
                              ... e mais {lastSync.details.length - 5} itens.
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </form>

          <Card>
            <CardHeader>
              <CardTitle>Campos mapeados recomendados</CardTitle>
              <CardDescription>
                Ajuste a consulta para retornar os campos necessários às integrações do WMS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <pre className="rounded bg-muted p-3 font-mono text-xs">
SELECT "it-codigo",
       "desc-item",
       "un",
       "peso-bruto",
       "fm-cod-com",
       "comprim",
       "altura",
       "largura"
FROM ems2cad.pub."item";
              </pre>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                <li>
                  <code>it-codigo</code> → SKU / Código externo
                </li>
                <li>
                  <code>desc-item</code> → Nome do produto / Descrição mobile
                </li>
                <li>
                  <code>un</code> → Unidade de medida
                </li>
                <li>
                  <code>fm-cod-com</code> → Categoria do produto
                </li>
                <li>
                  <code>peso-bruto</code> → Peso em kg
                </li>
                <li>
                  <code>comprim</code>, <code>altura</code>, <code>largura</code> → Dimensões
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Utilize filtros e joins adicionais conforme a necessidade de cada integração.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ErpIntegration;
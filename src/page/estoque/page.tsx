// ⚠️ MÓDULO SOMENTE LEITURA - Consulta de estoque

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Search, RefreshCw, Package } from 'lucide-react';
import { useStocks } from '@/lib/hooks/use-stock';

export default function EstoquePage() {
  const [search, setSearch] = useState('');
  const [estabelecimento, setEstabelecimento] = useState('');
  const [deposito, setDeposito] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'DISPONIVEL' | 'RESERVADO' | 'BLOQUEADO' | 'QUARENTENA' | 'TODOS'
  >('TODOS');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch } = useStocks({
    search: search || undefined,
    estabelecimento: estabelecimento || undefined,
    deposito: deposito || undefined,
    status: statusFilter !== 'TODOS' ? statusFilter : undefined,
    page,
    limit,
  });

  const stocks = data ?? [];

  function formatDate(date: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  function formatQuantity(qty: number) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(qty);
  }

  function getStatusBadge(status: string) {
    const colors = {
      DISPONIVEL: 'bg-green-100 text-green-800',
      RESERVADO: 'bg-blue-100 text-blue-800',
      BLOQUEADO: 'bg-red-100 text-red-800',
      QUARENTENA: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Estoque</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consulta de Estoque</h1>
          <p className="text-muted-foreground">
            Visualização de quantidades em estoque com rastreamento de alocações
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Produto, lote, documento, endereço..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Estabelecimento
            </label>
            <Input
              placeholder="Ex: 01"
              value={estabelecimento}
              onChange={(e) => setEstabelecimento(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Depósito</label>
            <Input
              placeholder="Ex: A01"
              value={deposito}
              onChange={(e) => setDeposito(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="TODOS">Todos</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="BLOQUEADO">Bloqueado</option>
              <option value="QUARENTENA">Quarentena</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left text-sm font-medium">Produto</th>
                <th className="p-3 text-left text-sm font-medium">SKU</th>
                <th className="p-3 text-left text-sm font-medium">Estab.</th>
                <th className="p-3 text-left text-sm font-medium">Dep.</th>
                <th className="p-3 text-left text-sm font-medium">Endereço</th>
                <th className="p-3 text-left text-sm font-medium">Lote/Série</th>
                <th className="p-3 text-right text-sm font-medium">Qtd. Data</th>
                <th className="p-3 text-right text-sm font-medium">Qtd. Atual</th>
                <th className="p-3 text-right text-sm font-medium">Disponível</th>
                <th className="p-3 text-right text-sm font-medium">Alocada</th>
                <th className="p-3 text-right text-sm font-medium">Aloc. Prod.</th>
                <th className="p-3 text-right text-sm font-medium">Aloc. Pedido</th>
                <th className="p-3 text-left text-sm font-medium">Validade</th>
                <th className="p-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-muted-foreground">
                    Carregando estoques...
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-red-500">
                    Erro ao carregar estoques. Tente novamente.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && stocks.length === 0 && (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-muted-foreground">
                    <Package className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    Nenhum estoque encontrado
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                stocks.map((stock) => (
                  <tr key={stock.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-sm">
                      <div className="font-medium">{stock.product?.name ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        {stock.product?.sku ?? '-'}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {stock.sku?.description ?? '-'}
                    </td>
                    <td className="p-3 text-sm font-mono">
                      {stock.estabelecimento ?? '-'}
                    </td>
                    <td className="p-3 text-sm font-mono">
                      {stock.deposito ?? '-'}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="max-w-[150px] truncate">
                        {stock.address?.enderecoAbreviado ?? '-'}
                      </div>
                    </td>
                    <td className="p-3 text-sm font-mono">
                      {stock.lote ?? '-'}
                    </td>
                    <td className="p-3 text-right text-sm font-mono">
                      {formatQuantity(stock.quantidadeData)}
                    </td>
                    <td className="p-3 text-right text-sm font-mono font-semibold">
                      {formatQuantity(stock.quantidadeAtual)}
                    </td>
                    <td className="p-3 text-right text-sm font-mono text-green-600">
                      {formatQuantity(stock.quantidadeDisponivel)}
                    </td>
                    <td className="p-3 text-right text-sm font-mono text-blue-600">
                      {formatQuantity(stock.quantidadeAlocada)}
                    </td>
                    <td className="p-3 text-right text-sm font-mono text-orange-600">
                      {formatQuantity(stock.quantidadeAlocadaProducao)}
                    </td>
                    <td className="p-3 text-right text-sm font-mono text-purple-600">
                      {formatQuantity(stock.quantidadeAlocadaPedido)}
                    </td>
                    <td className="p-3 text-sm">
                      {formatDate(stock.validade)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(stock.status)}`}
                      >
                        {stock.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {stocks.length > 0 && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {stocks.length} registros (página {page})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={stocks.length < limit}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

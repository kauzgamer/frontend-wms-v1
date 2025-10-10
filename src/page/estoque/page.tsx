import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Plus, Search, SlidersHorizontal, Maximize2 } from 'lucide-react';
import { useStocks } from '@/lib/hooks/use-stock';
import type { StockWithDetails } from '@/lib/types/stock';

export default function EstoquePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'DISPONIVEL' | 'RESERVADO' | 'BLOQUEADO' | 'AVARIADO' | 'TODOS'
  >('TODOS');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useStocks({
    search,
    status: statusFilter,
    page,
    limit,
  });

  const stocks = data?.data ?? [];
  const meta = data?.meta;

  function formatDate(date: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  function formatQuantity(qty: number) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(qty);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'DISPONIVEL':
        return 'text-green-600';
      case 'RESERVADO':
        return 'text-blue-600';
      case 'BLOQUEADO':
        return 'text-red-600';
      case 'AVARIADO':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 pt-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Estoque</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Estoque</h1>
          <div className="flex gap-2">
            <Button asChild variant="default" size="sm">
              <Link to="/estoque/new">
                <Plus className="size-4 mr-2" />
                Novo
              </Link>
            </Button>
            <Button variant="outline" size="icon" aria-label="Filtros">
              <SlidersHorizontal className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Exportar XLS">
              XLS
            </Button>
            <div className="relative">
              <input
                className="h-9 w-72 rounded-md border px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="Pesquisar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute right-2 top-2.5 size-4 text-muted-foreground" />
            </div>
            <Button variant="outline" size="icon" aria-label="Zoom">
              <Maximize2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <select
            className="h-9 rounded-md border px-3 text-sm bg-background"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | 'DISPONIVEL'
                  | 'RESERVADO'
                  | 'BLOQUEADO'
                  | 'AVARIADO'
                  | 'TODOS',
              )
            }
          >
            <option value="TODOS">Todos os status</option>
            <option value="DISPONIVEL">Disponível</option>
            <option value="RESERVADO">Reservado</option>
            <option value="BLOQUEADO">Bloqueado</option>
            <option value="AVARIADO">Avariado</option>
          </select>
        </div>

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        )}

        {isError && (
          <div className="text-center py-8 text-red-600">
            Erro ao carregar estoque
          </div>
        )}

        {!isLoading && !isError && stocks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum registro encontrado
          </div>
        )}

        {!isLoading && !isError && stocks.length > 0 && (
          <>
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Produto
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      SKU
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Endereço
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Lote
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Quantidade
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Reservado
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium">
                      Disponível
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Validade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock: StockWithDetails) => (
                    <tr key={stock.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-sm">
                        <Link
                          to={`/estoque/${stock.id}`}
                          className="hover:underline text-[#0c9abe]"
                        >
                          {stock.product?.name || '-'}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {stock.sku?.description || '-'}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {stock.address?.enderecoAbreviado || '-'}
                      </td>
                      <td className="px-3 py-2 text-sm">{stock.lote || '-'}</td>
                      <td className="px-3 py-2 text-sm text-right">
                        {formatQuantity(stock.quantity)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        {formatQuantity(stock.quantityReserved)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        {formatQuantity(stock.quantityAvailable)}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span className={getStatusColor(stock.status)}>
                          {stock.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {formatDate(stock.validade)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {stocks.length} de {meta.total} registros
                </p>
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
                    disabled={page >= meta.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

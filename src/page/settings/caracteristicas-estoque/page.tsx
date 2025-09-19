import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Plus, Search, SlidersHorizontal, Maximize2 } from 'lucide-react'
import { useStockAttributes } from '@/lib/hooks/use-stock-attributes'
import type { StockAttribute } from '@/lib/types/stock-attribute'

type Caracteristica = StockAttribute

export default function CaracteristicasEstoquePage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('ATIVO')
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading, isError } = useStockAttributes({ q: query, status: statusFilter })

  const rows: Caracteristica[] = useMemo(() => data ?? [], [data])

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
              <BreadcrumbLink asChild>
                <Link to="/settings">Configurador</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Características de estoque</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-4 text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Características de estoque</h1>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Filtrando por:</span>
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              Situação igual a: {statusFilter}
              <button className="ml-1" onClick={() => setStatusFilter('TODOS')} aria-label="Limpar filtro">×</button>
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Filtros"><SlidersHorizontal className="size-4" /></Button>
            <Button variant="outline" size="icon" aria-label="Exportar XLS">XLS</Button>
            <div className="relative">
              <input
                className="h-9 w-72 rounded-md border px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="Pesquisar"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <Search className="absolute right-2 top-2.5 size-4 text-muted-foreground" />
            </div>
            <Button variant="outline" size="icon" aria-label="Zoom"><Maximize2 className="size-4" /></Button>
          </div>
        </div>
      </Card>

  <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-3">
          <Button className="bg-[#0c9abe] hover:bg-[#0a869d] text-white"><Plus className="size-4 mr-2" /> Nova característica</Button>
          <span className="text-sm text-muted-foreground">Arraste a coluna até aqui para agrupar</span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full border-t text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="w-10 text-left px-3 py-2"> </th>
                <th className="text-left px-3 py-2">Descrição</th>
                <th className="text-left px-3 py-2">Formato</th>
                <th className="text-left px-3 py-2">Origem</th>
                <th className="text-left px-3 py-2">Situação</th>
                <th className="w-10 px-3 py-2"> </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>Carregando...</td></tr>
              )}
              {isError && !isLoading && (
                <tr><td className="px-3 py-6 text-sm text-red-600" colSpan={6}>Erro ao carregar dados.</td></tr>
              )}
              {!isLoading && !isError && rows.length === 0 && (
                <tr><td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>Nenhum resultado.</td></tr>
              )}
              {rows.map(row => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">...</td>
                  <td className="px-3 py-2">{row.descricao}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded bg-[#b3c559] text-white px-2 py-0.5 text-xs font-semibold">
                      {row.formato}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded bg-[#2f8ac9] text-white px-2 py-0.5 text-xs font-semibold">
                      {row.origem}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded bg-[#00b894] text-white px-2 py-0.5 text-xs font-semibold">
                      {row.situacao}
                    </span>
                  </td>
                  <td className="px-3 py-2">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 text-sm">
          <span>1 - {rows.length} DE {rows.length} RESULTADOS</span>
          <div className="flex items-center gap-3">
            <Button variant="secondary" disabled className="bg-[#9aa3a7] text-white hover:bg-[#8a9397]">Carregar mais 10 resultados</Button>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">EXIBIR</span>
              <select
                className="h-9 rounded-md border px-2 text-sm bg-background"
                value={pageSize}
                onChange={e => setPageSize(parseInt(e.target.value, 10))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-muted-foreground">RESULTADOS POR VEZ</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

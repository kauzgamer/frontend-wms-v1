import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Filter, Download, Settings, HomeIcon } from "lucide-react"
import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useMemo, useState } from "react"
import { useQuery } from '@tanstack/react-query'
import { fetchIntegrationTransactions } from '@/lib/api/integration'
import type { IntegrationTransaction } from '@/lib/api/integration'

export function IntegrationPage() {
  // Query remote (mock) data
  const { data: all = [], isFetching, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['integration','transactions'],
    queryFn: () => fetchIntegrationTransactions(42, 800),
    staleTime: 30_000,
  })

  const [filterKey, setFilterKey] = useState("")
  const [visible, setVisible] = useState(10)

  const filtered = useMemo(() =>
    all.filter(t => (!filterKey || t.key.includes(filterKey)))
  , [all, filterKey])

  const successToday = filtered.filter(t => t.status === 'success').length
  const failedToday = filtered.filter(t => t.status === 'failed').length
  const quarantine15 = filtered.filter(t => t.status === 'quarantine').length

  const navigate = useNavigate()
  const refresh = () => refetch()

  return (
        <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Monitor de transações</h1>
            <div className="mt-2">
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
                    <BreadcrumbPage>Integração</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sucessos hoje</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-4xl font-light text-cyan-600">{successToday}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Falharam hoje</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-4xl font-light text-amber-600">{failedToday}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quarentena últimos 15 dias</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-4xl font-light text-red-600">{quarantine15}</CardContent>
            </Card>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Atualizado em: {new Date(dataUpdatedAt || Date.now()).toLocaleString()}</span>
            <Button variant="ghost" size="sm" onClick={refresh} className="h-7 px-2" disabled={isLoading}>
              <RefreshCcw className={"size-4" + (isFetching ? " animate-spin" : "")} />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => navigate('/integration/settings')}>
              <Settings className="size-4" /> Configurações
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="size-4" /> Filtros
              </Button>
              <Button variant="outline" size="sm" className="h-8" disabled>
                <Download className="size-4" /> XLS
              </Button>
              <Button variant="outline" size="sm" className="h-8" disabled>
                <Download className="size-4" /> PDF
              </Button>
              <input
                placeholder="Buscar por chave"
                value={filterKey}
                onChange={e => setFilterKey(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Table */}
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
                {isError && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-red-600 text-sm">
                      Erro ao carregar: {(error as Error).message}
                    </td>
                  </tr>
                )}
                {!isError && (isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">Carregando...</td>
                  </tr>
                ) : (
                  filtered.slice(0, visible).map((row: IntegrationTransaction) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-2 px-3 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="py-2 px-3">{row.document}</td>
                      <td className="py-2 px-3 font-mono text-xs">{row.key}</td>
                      <td className="py-2 px-3">{row.process}</td>
                      <td className="py-2 px-3">
                        {row.status === 'success' && <span className="text-cyan-600">Sucesso</span>}
                        {row.status === 'failed' && <span className="text-amber-600">Falha</span>}
                        {row.status === 'quarantine' && <span className="text-red-600">Quarentena</span>}
                      </td>
                    </tr>
                  ))
                ))}
                {!isLoading && !isError && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                      Nenhum resultado para a pesquisa com filtros informados.
                    </td>
                  </tr>
                )}
                {isFetching && !isLoading && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground text-xs tracking-wide">Atualizando...</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t p-4 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                disabled={visible >= filtered.length || filtered.length === 0 || isLoading}
                onClick={() => setVisible(v => v + 10)}
              >
                Carregar mais 10 resultados
              </Button>
            </div>
          </div>
        </div>
  )
}

export default IntegrationPage

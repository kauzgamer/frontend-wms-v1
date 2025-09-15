import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Filter, Download } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface Transaction {
  id: string
  date: string // ISO
  document: string
  key: string
  process: string
  status: "success" | "failed" | "quarantine"
}

// Mock generator (could be replaced by API call later)
function generateMock(count = 0): Transaction[] {
  const base: Transaction[] = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    base.push({
      id: String(i + 1),
      date: d.toISOString(),
      document: `DOC-${(i + 1).toString().padStart(4, "0")}`,
      key: `KEY-${(i + 1).toString().padStart(6, "0")}`,
      process: ["Import", "Export", "Sync"][i % 3],
      status: ["success", "failed", "quarantine"][i % 5 === 0 ? 1 : i % 11 === 0 ? 2 : 0] as Transaction["status"],
    })
  }
  return base
}

export function IntegrationPage() {
  const [all, setAll] = useState<Transaction[]>(() => generateMock(0))
  const [filterKey, setFilterKey] = useState("")
  const [visible, setVisible] = useState(10)
  const [refreshAt, setRefreshAt] = useState<Date>(new Date())

  const filtered = useMemo(() => {
    return all.filter(t => (!filterKey || t.key.includes(filterKey)))
  }, [all, filterKey])

  const successToday = filtered.filter(t => t.status === "success").length
  const failedToday = filtered.filter(t => t.status === "failed").length
  const quarantine15 = filtered.filter(t => t.status === "quarantine").length

  const refresh = () => {
    setRefreshAt(new Date())
    // placeholder for API fetch
    setAll(generateMock(0))
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Monitor de transações</h1>
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
            <span className="text-muted-foreground">Atualizado em: {refreshAt.toLocaleString()}</span>
            <Button variant="ghost" size="sm" onClick={refresh} className="h-7 px-2">
              <RefreshCcw className="size-4" />
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
                {filtered.slice(0, visible).map(row => (
                  <tr key={row.id} className="border-t">
                    <td className="py-2 px-3 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="py-2 px-3">{row.document}</td>
                    <td className="py-2 px-3 font-mono text-xs">{row.key}</td>
                    <td className="py-2 px-3">{row.process}</td>
                    <td className="py-2 px-3">
                      {row.status === "success" && <span className="text-cyan-600">Sucesso</span>}
                      {row.status === "failed" && <span className="text-amber-600">Falha</span>}
                      {row.status === "quarantine" && <span className="text-red-600">Quarentena</span>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                      Nenhum resultado para a pesquisa com filtros informados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t p-4 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                disabled={visible >= filtered.length || filtered.length === 0}
                onClick={() => setVisible(v => v + 10)}
              >
                Carregar mais 10 resultados
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default IntegrationPage

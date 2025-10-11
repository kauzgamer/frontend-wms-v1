import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useInventoryDashboard, useInventories } from '@/lib/hooks/use-inventory'
import type { ListInventoriesResponse, InventorySummary } from '@/lib/types/inventory'

export default function InventarioPage() {
  const { data: dash } = useInventoryDashboard()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const { data } = useInventories({ page, limit, search: search || undefined })

  const counts = useMemo(() => ({
    pendentes: dash?.pendentes ?? 0,
    aguardando: dash?.aguardandoContagem ?? 0,
    andamento: dash?.emAndamento ?? 0,
    finalizados: dash?.finalizados ?? 0,
    atualizadoEm: dash?.atualizadoEm ?? '',
  }), [dash])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" style={{ color: '#4a5c60' }}>Inventário</h1>
        <div className="flex gap-2">
          <Button variant="outline">Configuração</Button>
          <Button variant="outline">Histórico</Button>
          <Button asChild>
            <Link to="/inventario/novo">+ Novo inventário</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <CardKpi title="Pendentes" value={counts.pendentes} />
        <CardKpi title="Aguardando contagem" value={counts.aguardando} />
        <CardKpi title="Em andamento" value={counts.andamento} />
        <CardKpi title="Contagem finalizada" value={counts.finalizados} />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Inventários cadastrados</div>
        <div>Atualizado em: {counts.atualizadoEm || '-'}</div>
      </div>

      <div className="border rounded-md">
        <div className="flex items-center gap-2 p-3">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm bg-white"
            placeholder="Pesquisar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline">Pesquisa Avançada</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <Th>Identificador</Th>
                <Th>Descrição</Th>
                <Th>Data de criação</Th>
                <Th>Progresso</Th>
              </tr>
            </thead>
            <tbody>
              {((data as ListInventoriesResponse | undefined)?.data?.length ?? 0) > 0 ? (data as ListInventoriesResponse).data.map((inv: InventorySummary) => (
                  <tr key={inv.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => window.location.assign(`/inventario/${inv.id}`)}>
                  <Td>{inv.identificador}</Td>
                  <Td>{inv.descricao}</Td>
                  <Td>{new Date(inv.criadoEm).toLocaleString()}</Td>
                  <Td>{inv.progresso}%</Td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                    Nenhum resultado para a pesquisa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 border-t text-sm">
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>Carregar mais 10 resultados</Button>
          <div className="flex items-center gap-2">
            <span>Exibir</span>
            <select
              className="border rounded px-2 py-1 bg-white"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>RESULTADOS POR VEZ</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardKpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="border rounded-md p-4 bg-white">
      <div className="text-2xl font-bold" style={{ color: '#4a5c60' }}>{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left p-3 text-sm font-medium">{children}</th>
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 text-sm">{children}</td>
}

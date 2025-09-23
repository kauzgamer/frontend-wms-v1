import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Filter, FileSpreadsheet, Maximize2, MoreHorizontal, Search } from 'lucide-react'
import { useToast } from '@/components/ui/toast-context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useCustomers } from '@/lib/hooks/use-customers'
import { useUpdateCustomer } from '@/lib/hooks/use-update-customer'
import { useDeleteCustomer } from '@/lib/hooks/use-delete-customer'
import type { Customer } from '@/lib/types/customer'

export default function ClientePage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('ATIVO')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [items, setItems] = useState<Customer[]>([])

  const { data, refetch, isFetching } = useCustomers({ q, status, page, limit: pageSize, sort: 'createdAt', order: 'asc' })

  useEffect(() => {
    if (!data) return
    if (page === 1) setItems(data.items)
    else setItems((prev) => {
      const ids = new Set(prev.map((i) => i.id))
      const merged = [...prev]
      for (const it of data.items) if (!ids.has(it.id)) merged.push(it)
      return merged
    })
  }, [data, page])

  const total = data?.total ?? 0

  return (
    <div className="p-6 space-y-4">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Configurador</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Cadastro de cliente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-semibold">Cliente</h1>

      <div className="border rounded-md p-3">
        <div className="text-sm font-medium mb-2">Clientes cadastrados</div>
        {status !== 'TODOS' && (
          <div className="mb-2 text-sm">
            Filtrando por:
            <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs">
              Situação igual a: {status === 'ATIVO' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Link to="/settings/cliente/new" className="px-3 py-2 rounded-md text-white" style={{ backgroundColor: '#2f8ac9' }}>+ Novo cliente</Link>
          <div className="text-sm text-gray-500">Arraste a coluna até aqui para agrupar</div>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Filtros" className="p-2 rounded border hover:bg-gray-50"><Filter size={16} /></button>
            <button aria-label="Exportar XLS" className="p-2 rounded border hover:bg-gray-50"><FileSpreadsheet size={16} /></button>
            <div className="relative">
              <input className="border rounded pl-8 pr-2 py-1 text-sm w-64" placeholder="Pesquisar por nome ou documento" value={q} onChange={(e) => setQ(e.target.value)} />
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button aria-label="Tela cheia" className="p-2 rounded border hover:bg-gray-50"><Maximize2 size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Situação</label>
          <select className="border rounded px-2 py-1" value={status} onChange={(e) => { setStatus(e.target.value as 'ATIVO' | 'INATIVO' | 'TODOS'); setPage(1) }}>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="TODOS">Todos</option>
          </select>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="w-12"></th>
              <th className="py-2 px-3">Documento</th>
              <th className="py-2 px-3">Nome</th>
              <th className="py-2 px-3">Unidade federativa</th>
              <th className="py-2 px-3">Inscrição estadual</th>
              <th className="py-2 px-3">Situação</th>
              <th className="py-2 px-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((cli) => (
              <Row key={cli.id} cli={cli} onChanged={() => { setPage(1); refetch() }} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{total > 0 ? (<span>{items.length} de {total} resultados</span>) : (<span>0 resultados</span>)}</div>
        <div className="flex items-center gap-3">
          <button type="button" className="px-4 py-2 rounded-md text-gray-800 border bg-gray-100 hover:bg-gray-200 disabled:opacity-50" onClick={()=>setPage(p=>p+1)} disabled={isFetching || items.length >= total}>{isFetching? 'Carregando...' : `Carregar mais ${pageSize} resultados`}</button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Exibir</span>
            <select className="border rounded px-2 py-1" value={pageSize} onChange={(e)=>{ const v=parseInt(e.target.value,10); setPageSize(v); setPage(1) }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-600">resultados por vez</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ cli, onChanged }: { cli: Customer; onChanged: () => void }) {
  const toastApi = useToast()
  const updateMut = useUpdateCustomer()
  const deleteMut = useDeleteCustomer()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggleAtivo = async () => {
    try {
      await updateMut.mutateAsync({ id: cli.id, data: { active: cli.situacao !== 'ATIVO' } })
      toastApi.show({ message: 'Situação atualizada', kind: 'success' })
      onChanged()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao atualizar'
      toastApi.show({ message: msg, kind: 'error' })
    }
  }

  const onDelete = async () => {
    try {
      await deleteMut.mutateAsync(cli.id)
      toastApi.show({ message: 'Cliente excluído', kind: 'success' })
      onChanged()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao excluir'
      toastApi.show({ message: msg, kind: 'error' })
    }
  }

  return (
    <tr className="border-t">
      <td className="px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Ações" className="p-1 rounded hover:bg-gray-100"><MoreHorizontal size={22} color="#2f8ac9" /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={toggleAtivo}>{cli.situacao === 'ATIVO' ? 'Inativar' : 'Ativar'}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toastApi.show({ message: 'Edição inline futura', kind: 'info' })}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmOpen(true)} className="text-red-600">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmationDialog open={confirmOpen} title="Confirmação" description={`Deseja excluir o cliente “${cli.nome}”?`} confirmText="Excluir" onConfirm={onDelete} onCancel={() => setConfirmOpen(false)} />
      </td>
      <td className="px-3 py-2">{cli.documento}</td>
      <td className="px-3 py-2">{cli.nome}</td>
      <td className="px-3 py-2">{cli.uf}</td>
      <td className="px-3 py-2">{cli.inscricaoEstadual ?? 'Não informada'}</td>
      <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs ${cli.situacao === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{cli.situacao}</span></td>
      <td className="px-3 py-2"></td>
    </tr>
  )
}

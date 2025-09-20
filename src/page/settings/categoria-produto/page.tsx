import { useEffect, useState } from 'react'
import { useProductCategories } from '@/lib/hooks/use-product-categories'
import { useCreateProductCategory } from '@/lib/hooks/use-create-product-category'
import { useUpdateProductCategory } from '@/lib/hooks/use-update-product-category'
import { useDeleteProductCategory } from '@/lib/hooks/use-delete-product-category'
import type { ProductCategory } from '@/lib/types/product-category'
import { Filter, FileSpreadsheet, Maximize2, MoreHorizontal, Search } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast-context'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

export default function CategoriaProdutoPage() {
  const toastApi = useToast()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('TODOS')
  const [showDraft, setShowDraft] = useState(false)
  const [draft, setDraft] = useState<{ descricao: string }>({ descricao: '' })
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sort] = useState<string>('descricao')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [items, setItems] = useState<ProductCategory[]>([])

  const { data, refetch, isFetching } = useProductCategories({ q, status, page, limit: pageSize, sort, order })
  const createMut = useCreateProductCategory()

  const handleCreate = async (keepOpen: boolean) => {
    if (!draft.descricao.trim()) {
  toastApi.show({ message: 'Informe a descrição', kind: 'info' })
      return
    }
    try {
      await createMut.mutateAsync({ descricao: draft.descricao.trim(), ativo: true })
  toastApi.show({ message: 'Categoria criada com sucesso', kind: 'success' })
      setDraft({ descricao: '' })
      if (!keepOpen) setShowDraft(false)
      refetch()
    } catch (e) {
  const msg = e instanceof Error ? e.message : 'Erro ao criar'
  toastApi.show({ message: msg, kind: 'error' })
    }
  }

  // accumulate or replace items when data changes
  // Update accumulated items when page/data changes
  useEffect(() => {
    if (!data) return
    if (page === 1) setItems(data.items)
    else setItems(prev => {
      // avoid duplicates if refetch returns overlapping pages
      const seen = new Set(prev.map(i => i.id))
      const merged = [...prev]
      for (const it of data.items) if (!seen.has(it.id)) merged.push(it)
      return merged
    })
  }, [data, page])

  const total = data?.total ?? 0
  const visibleRows = items

  return (
    <div className="p-6 space-y-4">
      {/* Breadcrumbs */}
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
            <BreadcrumbPage>Categoria de produto</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-semibold">Categoria de produto</h1>

      {/* Toolbar */}
      <div className="border rounded-md p-3">
        <div className="text-sm font-medium mb-2">Categoria de produto</div>

        {status !== 'TODOS' && (
          <div className="mb-2 text-sm">
            Filtrando por:
            <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs">
              Situação igual a: {status === 'ATIVO' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDraft(true)}
            className="px-3 py-2 rounded-md text-white"
            style={{ backgroundColor: '#2f8ac9' }}
          >
            + Nova categoria
          </button>
          <div className="text-sm text-gray-500">Arraste a coluna até aqui para agrupar</div>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Filtros" className="p-2 rounded border hover:bg-gray-50"><Filter size={16} /></button>
            <button aria-label="Exportar XLS" className="p-2 rounded border hover:bg-gray-50"><FileSpreadsheet size={16} /></button>
            <div className="relative">
              <input
                className="border rounded pl-8 pr-2 py-1 text-sm w-64"
                placeholder="Pesquisar"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button aria-label="Tela cheia" className="p-2 rounded border hover:bg-gray-50"><Maximize2 size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex flex-col">
          <label htmlFor="search" className="text-sm">Pesquisar</label>
          <input
            id="search"
            name="search"
            className="border rounded px-2 py-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por descrição"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="status" className="text-sm">Situação</label>
          <select
            id="status"
            name="status"
            className="border rounded px-2 py-1"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ATIVO' | 'INATIVO' | 'TODOS')}
          >
            <option value="TODOS">Todos</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="w-12"></th>
              <th className="py-2 px-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:underline"
                  onClick={() => {
                    const next = order === 'asc' ? 'desc' : 'asc'
                    setOrder(next as 'asc' | 'desc')
                    setPage(1)
                  }}
                  title={`Ordenar por descrição (${order === 'asc' ? 'asc' : 'desc'})`}
                >
                  Descrição {order === 'asc' ? '↑' : '↓'}
                </button>
              </th>
              <th className="py-2 px-3">Situação</th>
              <th className="py-2 px-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {showDraft && (
              <tr className="border-t">
                <td className="px-3 py-2 text-gray-500">Novo</td>
                <td className="px-3 py-2">
                  <input
                    id="descricao"
                    name="descricao"
                    className="border rounded px-2 py-1 w-full"
                    value={draft.descricao}
                    onChange={(e) => setDraft((d) => ({ ...d, descricao: e.target.value }))}
                    placeholder="Descrição da categoria"
                  />
                </td>
                <td className="px-3 py-2">
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">ATIVO</span>
                </td>
                <td className="px-3 py-2 flex gap-2 items-center">
                  <button
                    type="button"
                    title="Salvar"
                    className="px-2 py-1 rounded text-white"
                    style={{ backgroundColor: '#28a745' }}
                    onClick={() => handleCreate(false)}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    title="Salvar e adicionar outro"
                    className="px-2 py-1 rounded text-white"
                    style={{ backgroundColor: '#2f8ac9' }}
                    onClick={() => handleCreate(true)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    title="Cancelar"
                    className="px-2 py-1 rounded text-white"
                    style={{ backgroundColor: '#dc3545' }}
                    onClick={() => setShowDraft(false)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            )}

            {visibleRows.map((cat) => (
              <Row
                key={cat.id}
                cat={cat}
                onUpdated={() => {
                  toastApi.show({ message: 'Categoria atualizada', kind: 'success' })
                  // refresh current page; reset accumulation to keep consistent
                  setPage(1)
                  refetch()
                }}
                onDeleted={() => {
                  toastApi.show({ message: 'Categoria excluída', kind: 'success' })
                  setPage(1)
                  refetch()
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Paging footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {total > 0 ? (
            <span>
              {items.length} de {total} resultados
            </span>
          ) : (
            <span>0 resultados</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-md text-gray-800 border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage(p => p + 1)}
            disabled={isFetching || items.length >= total}
          >
            {isFetching ? 'Carregando...' : `Carregar mais ${pageSize} resultados`}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Exibir</span>
            <select
              className="border rounded px-2 py-1"
              value={pageSize}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                setPageSize(val)
                setPage(1)
              }}
            >
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

function Row({ cat, onUpdated, onDeleted }: { cat: ProductCategory; onUpdated: () => void; onDeleted: () => void }) {
  const updateMut = useUpdateProductCategory()
  const deleteMut = useDeleteProductCategory()
    const toastApi = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggleAtivo = async () => {
    try {
      await updateMut.mutateAsync({ id: cat.id, data: { ativo: cat.situacao !== 'ATIVO' } })
      onUpdated()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao atualizar'
      toastApi.show({ message: msg, kind: 'error' })
    }
  }

  const onDelete = async () => {
    try {
      await deleteMut.mutateAsync(cat.id)
      onDeleted()
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
            <button aria-label="Ações" className="p-1 rounded hover:bg-gray-100">
              <MoreHorizontal size={22} color="#2f8ac9" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={toggleAtivo}>{cat.situacao === 'ATIVO' ? 'Inativar' : 'Ativar'}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toastApi.show({ message: 'Edição inline futura', kind: 'info' })}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmOpen(true)} className="text-red-600">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmationDialog
          open={confirmOpen}
          title="Confirmação"
          description={`Deseja excluir a categoria “${cat.descricao}”?`}
          confirmText="Excluir"
          onConfirm={onDelete}
          onCancel={() => setConfirmOpen(false)}
    />
      </td>
      <td className="px-3 py-2">
        {cat.descricao}
      </td>
      <td className="px-3 py-2">
        <span className={`px-2 py-1 rounded text-xs ${cat.situacao === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
          {cat.situacao}
        </span>
      </td>
      <td className="px-3 py-2"></td>
    </tr>
  )
}

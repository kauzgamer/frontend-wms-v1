import { useMemo, useState } from 'react'
import { useProductCategories } from '@/lib/hooks/use-product-categories'
import { useCreateProductCategory } from '@/lib/hooks/use-create-product-category'
import { useUpdateProductCategory } from '@/lib/hooks/use-update-product-category'
import { useDeleteProductCategory } from '@/lib/hooks/use-delete-product-category'
import type { ProductCategory } from '@/lib/types/product-category'
import { MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast-context'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

export default function CategoriaProdutoPage() {
  const toastApi = useToast()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('TODOS')
  const [showDraft, setShowDraft] = useState(false)
  const [draft, setDraft] = useState<{ descricao: string; ativo: boolean }>({ descricao: '', ativo: true })

  const { data, refetch } = useProductCategories({ q, status })
  const createMut = useCreateProductCategory()

  const handleCreate = async (keepOpen: boolean) => {
    if (!draft.descricao.trim()) {
  toastApi.show({ message: 'Informe a descrição', kind: 'info' })
      return
    }
    try {
      await createMut.mutateAsync({ descricao: draft.descricao.trim(), ativo: draft.ativo })
  toastApi.show({ message: 'Categoria criada com sucesso', kind: 'success' })
      setDraft({ descricao: '', ativo: true })
      if (!keepOpen) setShowDraft(false)
      refetch()
    } catch (e) {
  const msg = e instanceof Error ? e.message : 'Erro ao criar'
  toastApi.show({ message: msg, kind: 'error' })
    }
  }

  const rows: ProductCategory[] = useMemo(() => data ?? [], [data])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categoria de produto</h1>
        <button
          type="button"
          onClick={() => setShowDraft(true)}
          className="px-3 py-2 rounded-md text-white"
          style={{ backgroundColor: '#2f8ac9' }}
        >
          Nova categoria
        </button>
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
              <th className="py-2 px-3">Descrição</th>
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
                  <select
                    id="ativo"
                    name="ativo"
                    className="border rounded px-2 py-1"
                    value={draft.ativo ? 'ATIVO' : 'INATIVO'}
                    onChange={(e) => setDraft((d) => ({ ...d, ativo: e.target.value === 'ATIVO' }))}
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <button
                    type="button"
                    title="Salvar"
                    className="px-2 py-1 rounded text-white"
                    style={{ backgroundColor: '#2f8ac9' }}
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
                    className="px-2 py-1 rounded border"
                    onClick={() => setShowDraft(false)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            )}

            {rows.map((cat) => (
              <Row
                key={cat.id}
                cat={cat}
                onUpdated={() => {
                  toastApi.show({ message: 'Categoria atualizada', kind: 'success' })
                  refetch()
                }}
                onDeleted={() => {
                  toastApi.show({ message: 'Categoria excluída', kind: 'success' })
                  refetch()
                }}
              />
            ))}
          </tbody>
        </table>
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

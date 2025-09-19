import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Plus, Search, SlidersHorizontal, Maximize2, Check, X } from 'lucide-react'
import { useStockAttributes } from '@/lib/hooks/use-stock-attributes'
import type { StockAttribute } from '@/lib/types/stock-attribute'
import { useDeleteStockAttribute } from '@/lib/hooks/use-delete-stock-attribute'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useToast } from '@/components/ui/toast-context'
import { useCreateStockAttribute } from '@/lib/hooks/use-create-stock-attribute'
import { nanoid } from 'nanoid'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useUpdateStockAttributeMutation } from '@/lib/hooks/use-update-stock-attribute-mutation'

type Caracteristica = StockAttribute

export default function CaracteristicasEstoquePage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('ATIVO')
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading, isError } = useStockAttributes({ q: query, status: statusFilter })
  const del = useDeleteStockAttribute()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const { show } = useToast()
  const create = useCreateStockAttribute()
  const updateMutation = useUpdateStockAttributeMutation()

  type Draft = { id: string; descricao: string; formato: '' | 'TEXTO' | 'DATA'; saving?: boolean }
  const [drafts, setDrafts] = useState<Draft[]>([])

  function addDraft() {
    setDrafts((d) => [{ id: nanoid(), descricao: '', formato: '' }, ...d])
  }

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function removeDraft(id: string) {
    setDrafts((ds) => ds.filter((d) => d.id !== id))
  }

  async function saveDraft(id: string, addAnother = false) {
    const d = drafts.find((x) => x.id === id)
    if (!d) return
    const descricao = d.descricao.trim()
    if (!descricao || (d.formato !== 'TEXTO' && d.formato !== 'DATA')) return
    updateDraft(id, { saving: true })
    try {
      await create.mutateAsync({ descricao, formato: d.formato, ativo: true })
      removeDraft(id)
      show({ kind: 'success', message: 'Característica de estoque criada com sucesso!' })
      if (addAnother) addDraft()
    } catch {
      updateDraft(id, { saving: false })
      show({ kind: 'error', message: 'Erro ao criar característica de estoque.' })
    }
  }

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
          <Button className="bg-[#c2c7c9] hover:bg-[#b3b8ba] text-white" onClick={addDraft}><Plus className="size-4 mr-2" /> Nova característica</Button>
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
              {drafts.map((d) => (
                <tr key={d.id} className="border-t bg-muted/20">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <button
                        className="text-[#00b894] hover:opacity-80 disabled:opacity-50"
                        title="Salvar"
                        aria-label="Salvar"
                        disabled={d.saving || !d.descricao.trim() || !(d.formato === 'TEXTO' || d.formato === 'DATA')}
                        onClick={() => saveDraft(d.id, false)}
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        className="text-[#2f8ac9] hover:opacity-80 disabled:opacity-50"
                        title="Salvar e adicionar outra"
                        aria-label="Salvar e adicionar outra"
                        disabled={d.saving || !d.descricao.trim() || !(d.formato === 'TEXTO' || d.formato === 'DATA')}
                        onClick={() => saveDraft(d.id, true)}
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        title="Cancelar"
                        aria-label="Cancelar"
                        disabled={d.saving}
                        onClick={() => removeDraft(d.id)}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="h-9 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                      placeholder="Informe a descrição"
                      value={d.descricao}
                      onChange={(e) => updateDraft(d.id, { descricao: e.target.value })}
                      disabled={d.saving}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 w-[220px] rounded-md border px-3 text-sm bg-background"
                      value={d.formato}
                      onChange={(e) => updateDraft(d.id, { formato: e.target.value as Draft['formato'] })}
                      disabled={d.saving}
                    >
                      <option value="">Selecione o formato</option>
                      <option value="TEXTO">TEXTO</option>
                      <option value="DATA">DATA</option>
                    </select>
                  </td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2">...</td>
                </tr>
              ))}
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
                  <td className="px-3 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="px-2 py-1 rounded hover:bg-muted" aria-label="Ações">⋯</button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={async () => {
                            if (row.origem === 'PADRÃO') return
                            const nextAtivo = row.situacao !== 'ATIVO'
                            try {
                              await updateMutation.mutateAsync({ id: row.id, ativo: nextAtivo })
                            } catch {
                              show({ kind: 'error', message: 'Erro ao atualizar situação.' })
                            }
                          }}
                          variant="destructive"
                          disabled={row.origem === 'PADRÃO' || updateMutation.isPending}
                        >
                          {row.situacao === 'ATIVO' ? 'Inativar' : 'Ativar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            show({ kind: 'info', message: 'Edição inline será adicionada em seguida.' })
                          }}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (row.origem === 'PADRÃO') {
                              show({ kind: 'info', message: 'Esta característica padrão do sistema não pode ser excluída.' })
                            } else {
                              setConfirmId(row.id)
                            }
                          }}
                          variant="destructive"
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
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
      <ConfirmationDialog
        open={!!confirmId}
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          if (!confirmId) return
          try {
            const res = await del.mutateAsync(confirmId)
            if (res.deleted) {
              setConfirmId(null)
              show({ kind: 'success', message: 'Característica de estoque excluída com sucesso!' })
            } else {
              setConfirmId(null)
              if (res.reason === 'DEFAULT_PROTECTED') {
                show({ kind: 'info', message: 'Esta característica padrão do sistema não pode ser excluída.' })
              }
            }
          } catch {
            setConfirmId(null)
            show({ kind: 'error', message: 'Erro ao excluir característica de estoque.' })
          }
        }}
        title="Excluir"
        description="Deseja excluir esta característica de estoque?"
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  )
}

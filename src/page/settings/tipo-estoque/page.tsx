import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreateStockType, useStockTypes, useUpdateStockType } from '@/lib/hooks/use-stock-types';
import { Check, Search as SearchIcon, SlidersHorizontal, RefreshCw, Plus, X } from 'lucide-react';
import { DataTableHeader } from '@/components/ui/data-table-header';
import { RowActionsCell } from '@/components/ui/row-actions-cell';
import { useToast } from '@/components/ui/toast-context';

export default function TipoEstoquePage() {
  const [q, setQ] = useState('');
  const [situacao, setSituacao] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('ATIVO');
  const [creating, setCreating] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newExpedicao, setNewExpedicao] = useState(false);
  const [newManufatura, setNewManufatura] = useState(false);
  const { data, isLoading, error, refetch, isFetching } = useStockTypes({ q, situacao: situacao === 'TODOS' ? undefined : situacao });
  const { mutateAsync: createAsync, isPending: creatingPending } = useCreateStockType();
  const { mutateAsync: updateAsync, isPending: updatingPending } = useUpdateStockType();
  const { show: showToast } = useToast();

  const items = useMemo(() => data ?? [], [data]);

  // Gerenciador de colunas (similar ao de produtos)
  const defaultVisibleCols: Record<string, boolean> = {
    descricao: true,
    usarNaExpedicao: true,
    usarNaManufatura: true,
    situacao: true,
  };
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(defaultVisibleCols);
  const [draftVisibleCols, setDraftVisibleCols] = useState<Record<string, boolean>>(defaultVisibleCols);
  const [openColumns, setOpenColumns] = useState(false);

  // Edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editSituacao, setEditSituacao] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [editExpedicao, setEditExpedicao] = useState<boolean>(false);
  const [editManufatura, setEditManufatura] = useState<boolean>(false);

  function startEdit(row: { id: string; descricao: string; situacao: 'ATIVO' | 'INATIVO'; usarNaExpedicao: boolean; usarNaManufatura: boolean }) {
    setEditingId(row.id);
    setEditDesc(row.descricao);
    setEditSituacao(row.situacao);
    setEditExpedicao(!!row.usarNaExpedicao);
    setEditManufatura(!!row.usarNaManufatura);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDesc('');
    setEditSituacao('ATIVO');
    setEditExpedicao(false);
    setEditManufatura(false);
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    if (!editDesc.trim()) return;
    try {
      await updateAsync({ id: editingId, data: { descricao: editDesc.trim(), situacao: editSituacao, usarNaExpedicao: editExpedicao, usarNaManufatura: editManufatura } });
      showToast({ kind: 'success', message: 'Alterações salvas com sucesso.' });
      cancelEdit();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar alterações';
      showToast({ kind: 'error', message: msg });
    }
  }

  async function handleCreate() {
    if (!newDesc.trim()) return;
    try {
      await createAsync({
        descricao: newDesc.trim(),
        situacao: 'ATIVO',
        usarNaExpedicao: newExpedicao,
        usarNaManufatura: newManufatura,
      });
      showToast({ kind: 'success', message: 'Tipo de estoque criado com sucesso.' });
      setNewDesc('');
      setNewExpedicao(false);
      setNewManufatura(false);
      setCreating(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao criar';
      showToast({ kind: 'error', message: msg });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
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
              <BreadcrumbPage>Tipo de estoque</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>
            Tipo de estoque
          </h1>
          <Button asChild size="lg" variant="outline" className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap">
            <Link to="/settings">Voltar</Link>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border">
        <div className="flex items-center gap-3 px-5 py-3 border-b bg-white/60 overflow-x-auto">
          <Button
            className="bg-[#0082a1] hover:bg-[#006c85] text-white h-9 px-4 text-[13px] font-semibold tracking-wide"
            onClick={() => setCreating(true)}
          >
            + Novo tipo de estoque
          </Button>
          <div className="text-[11px] flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 bg-white leading-none">
              <span className="font-medium" style={{ color: '#555' }}>
                Filtrando por:
              </span>
              <span className="text-[#0c9abe] font-semibold">Situação: {situacao === 'TODOS' ? 'Todos' : situacao}</span>
              {situacao !== 'TODOS' && (
                <button className="text-muted-foreground hover:text-foreground text-xs leading-none" onClick={() => setSituacao('TODOS')}>
                  ×
                </button>
              )}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              className="text-[#0c9abe] hover:opacity-80 transition text-sm flex-shrink-0"
              title="Gerenciador de colunas"
              onClick={() => {
                setDraftVisibleCols(visibleCols);
                setOpenColumns(true);
              }}
            >
              <SlidersHorizontal className="size-4" />
            </button>
            <Button
              size="sm"
              variant="outline"
              className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`size-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
            <div className="relative w-56">
              <label htmlFor="stocktype-search" className="sr-only">Pesquisar</label>
              <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="stocktype-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-7 pr-3 h-9 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground"
                placeholder="Pesquisar"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-white">
                <th className="w-10 border-r sticky left-0 z-20 bg-white" />
                {visibleCols.descricao && (
                  <DataTableHeader
                    title="Descrição"
                    width={320}
                    onHide={() => setVisibleCols((prev) => ({ ...prev, descricao: false }))}
                  />
                )}
                {visibleCols.usarNaExpedicao && (
                  <DataTableHeader
                    title="Utilizar na expedição"
                    width={200}
                    onHide={() => setVisibleCols((prev) => ({ ...prev, usarNaExpedicao: false }))}
                  />
                )}
                {visibleCols.usarNaManufatura && (
                  <DataTableHeader
                    title="Utilizar na manufatura"
                    width={200}
                    onHide={() => setVisibleCols((prev) => ({ ...prev, usarNaManufatura: false }))}
                  />
                )}
                {visibleCols.situacao && (
                  <DataTableHeader
                    title="Situação"
                    width={140}
                    onHide={() => setVisibleCols((prev) => ({ ...prev, situacao: false }))}
                  />
                )}
              </tr>
            </thead>
            <tbody>
              {creating && (
                <tr className="border-b bg-white/60">
                  <td className="px-2 text-center align-middle border-r sticky left-0 z-10 bg-white">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        className={`p-1 rounded ${creatingPending || !newDesc.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'}`}
                        title="Salvar"
                        onClick={(e) => { e.stopPropagation(); void handleCreate(); }}
                        disabled={creatingPending || !newDesc.trim()}
                        aria-label="Salvar novo tipo de estoque"
                      >
                        <Check className="text-emerald-600" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-cyan-50"
                        title="Limpar"
                        onClick={(e) => { e.stopPropagation(); setNewDesc(''); setNewExpedicao(false); setNewManufatura(false); }}
                        aria-label="Limpar campos"
                      >
                        <Plus className="text-cyan-600" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-rose-50"
                        title="Cancelar"
                        onClick={(e) => { e.stopPropagation(); setCreating(false); setNewDesc(''); setNewExpedicao(false); setNewManufatura(false); }}
                        aria-label="Cancelar criação"
                      >
                        <X className="text-rose-600" />
                      </button>
                    </div>
                  </td>
                  {visibleCols.descricao && (
                    <td className="p-2">
                      <input
                        autoFocus
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="h-8 rounded border px-3 text-sm bg-white shadow-sm w-full"
                      />
                    </td>
                  )}
                  {visibleCols.usarNaExpedicao && (
                    <td className="p-2 text-center">
                      <button
                        className={`inline-flex items-center justify-center w-6 h-6 rounded ${newExpedicao ? 'bg-emerald-600' : 'bg-gray-300'}`}
                        onClick={() => setNewExpedicao((v) => !v)}
                        title="Alternar Utilizar na expedição"
                      >
                        {newExpedicao && <Check className="size-4 text-white" />}
                      </button>
                    </td>
                  )}
                  {visibleCols.usarNaManufatura && (
                    <td className="p-2 text-center">
                      <button
                        className={`inline-flex items-center justify-center w-6 h-6 rounded ${newManufatura ? 'bg-emerald-600' : 'bg-gray-300'}`}
                        onClick={() => setNewManufatura((v) => !v)}
                        title="Alternar Utilizar na manufatura"
                      >
                        {newManufatura && <Check className="size-4 text-white" />}
                      </button>
                    </td>
                  )}
                  {visibleCols.situacao && <td className="p-2 text-center">—</td>}
                </tr>
              )}
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center py-12">Erro ao carregar</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12">Nenhum resultado</td></tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-muted/30">
                    {editingId === row.id ? (
                      <td className="px-2 text-center align-middle border-r sticky left-0 z-10 bg-white">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            className={`p-1 rounded ${!editDesc.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'}`}
                            title="Salvar"
                            onClick={(e) => { e.stopPropagation(); void handleSaveEdit(); }}
                            disabled={!editDesc.trim()}
                            aria-label="Salvar alterações"
                          >
                            <Check className="text-emerald-600" />
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-rose-50"
                            title="Cancelar"
                            onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                            aria-label="Cancelar edição"
                          >
                            <X className="text-rose-600" />
                          </button>
                        </div>
                      </td>
                    ) : (
                      <RowActionsCell
                        ariaLabel="Ações do tipo de estoque"
                        onEdit={() => startEdit(row)}
                      />
                    )}
                    {visibleCols.descricao && (
                      <td className="p-3 text-sm">
                        {editingId === row.id ? (
                          <input
                            autoFocus
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="h-8 rounded border px-3 text-sm bg-white shadow-sm w-full"
                          />
                        ) : (
                          row.descricao
                        )}
                      </td>
                    )}
                    {visibleCols.usarNaExpedicao && (
                      <td className="p-3 text-sm text-center">
                        {editingId === row.id ? (
                          <button
                            className={`inline-flex items-center justify-center w-6 h-6 rounded ${editExpedicao ? 'bg-emerald-600' : 'bg-gray-300'}`}
                            onClick={() => setEditExpedicao((v) => !v)}
                            title="Alternar Utilizar na expedição"
                          >
                            {editExpedicao && <Check className="size-4 text-white" />}
                          </button>
                        ) : (
                          <button
                            className={`inline-flex items-center justify-center w-6 h-6 rounded ${row.usarNaExpedicao ? 'bg-emerald-600' : 'bg-gray-300'}`}
                            onClick={async () => {
                              try {
                                await updateAsync({ id: row.id, data: { usarNaExpedicao: !row.usarNaExpedicao } });
                                showToast({ kind: 'success', message: 'Atualizado com sucesso.' });
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : 'Falha ao atualizar';
                                showToast({ kind: 'error', message: msg });
                              }
                            }}
                            title="Alternar Utilizar na expedição"
                            disabled={updatingPending}
                          >
                            {row.usarNaExpedicao && <Check className="size-4 text-white" />}
                          </button>
                        )}
                      </td>
                    )}
                    {visibleCols.usarNaManufatura && (
                      <td className="p-3 text-sm text-center">
                        {editingId === row.id ? (
                          <button
                            className={`inline-flex items-center justify-center w-6 h-6 rounded ${editManufatura ? 'bg-emerald-600' : 'bg-gray-300'}`}
                            onClick={() => setEditManufatura((v) => !v)}
                            title="Alternar Utilizar na manufatura"
                          >
                            {editManufatura && <Check className="size-4 text-white" />}
                          </button>
                        ) : (
                          <button
                            className={`inline-flex items-center justify-center w-6 h-6 rounded ${row.usarNaManufatura ? 'bg-emerald-600' : 'bg-gray-300'}`}
                            onClick={async () => {
                              try {
                                await updateAsync({ id: row.id, data: { usarNaManufatura: !row.usarNaManufatura } });
                                showToast({ kind: 'success', message: 'Atualizado com sucesso.' });
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : 'Falha ao atualizar';
                                showToast({ kind: 'error', message: msg });
                              }
                            }}
                            title="Alternar Utilizar na manufatura"
                            disabled={updatingPending}
                          >
                            {row.usarNaManufatura && <Check className="size-4 text-white" />}
                          </button>
                        )}
                      </td>
                    )}
                    {visibleCols.situacao && (
                      <td className="p-3 text-sm text-center">
                        {editingId === row.id ? (
                          <select
                            className="border rounded px-2 py-1 text-sm bg-white"
                            value={editSituacao}
                            onChange={(e) => setEditSituacao(e.target.value as 'ATIVO' | 'INATIVO')}
                          >
                            <option value="ATIVO">ATIVO</option>
                            <option value="INATIVO">INATIVO</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-0.5 rounded text-white text-[11px] ${row.situacao === 'ATIVO' ? 'bg-emerald-600' : 'bg-gray-400'}`}>{row.situacao}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Gerenciador de colunas */}
        <Dialog.Root open={openColumns} onOpenChange={setOpenColumns}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[560px] max-w-[95vw] max-h-[80vh] overflow-auto rounded-md bg-white shadow-xl border">
              <div className="px-6 py-5 border-b">
                <Dialog.Title className="text-2xl font-semibold">Gerenciador de colunas</Dialog.Title>
                <Dialog.Description className="sr-only">Selecione as colunas que deseja exibir na tabela de tipos de estoque.</Dialog.Description>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[15px]">
                {[
                  { key: 'descricao', label: 'Descrição' },
                  { key: 'usarNaExpedicao', label: 'Utilizar na expedição' },
                  { key: 'usarNaManufatura', label: 'Utilizar na manufatura' },
                  { key: 'situacao', label: 'Situação' },
                ].map(({ key, label }) => (
                  <label key={key} className="inline-flex items-center gap-3 select-none">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#0c9abe]"
                      checked={!!draftVisibleCols[key]}
                      onChange={() =>
                        setDraftVisibleCols((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof prev],
                        }))
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50">
                <Button variant="outline" onClick={() => setOpenColumns(false)}>Cancelar</Button>
                <Button className="bg-[#0c9abe] hover:bg-[#0a86a1] text-white" onClick={() => { setVisibleCols(draftVisibleCols); setOpenColumns(false); }}>Aplicar</Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Card>
    </div>
  );
}

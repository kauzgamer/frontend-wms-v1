import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreateStockType, useStockTypes, useUpdateStockType } from '@/lib/hooks/use-stock-types';
import { Check } from 'lucide-react';

export default function TipoEstoquePage() {
  const [q, setQ] = useState('');
  const [situacao, setSituacao] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('ATIVO');
  const [creating, setCreating] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newExpedicao, setNewExpedicao] = useState(false);
  const [newManufatura, setNewManufatura] = useState(false);
  const { data, isLoading, error } = useStockTypes({ q, situacao: situacao === 'TODOS' ? undefined : situacao });
  const { mutateAsync: createAsync, isPending: creatingPending } = useCreateStockType();
  const { mutateAsync: updateAsync } = useUpdateStockType();

  const items = useMemo(() => data ?? [], [data]);

  async function handleCreate() {
    if (!newDesc.trim()) return;
    await createAsync({
      descricao: newDesc.trim(),
      situacao: 'ATIVO',
      usarNaExpedicao: newExpedicao,
      usarNaManufatura: newManufatura,
    });
    setNewDesc('');
    setNewExpedicao(false);
    setNewManufatura(false);
    setCreating(false);
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
          <div className="ml-auto relative w-56">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-3 pr-3 h-9 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground"
              placeholder="Pesquisar"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-white">
                <th className="w-10" />
                <th className="p-3 font-medium text-xs whitespace-nowrap text-cyan-700" style={{ width: '320px' }}>Descrição</th>
                <th className="p-3 font-medium text-xs whitespace-nowrap text-cyan-700">Utilizar na expedição</th>
                <th className="p-3 font-medium text-xs whitespace-nowrap text-cyan-700">Utilizar na manufatura</th>
                <th className="p-3 font-medium text-xs whitespace-nowrap text-cyan-700">Situação</th>
              </tr>
            </thead>
            <tbody>
              {creating && (
                <tr className="border-b bg-white/60">
                  <td className="px-2 text-center align-middle">
                    <button
                      className="text-emerald-600 font-bold px-1"
                      title="Salvar"
                      onClick={handleCreate}
                      disabled={creatingPending || !newDesc.trim()}
                    >
                      ✓
                    </button>
                    <button
                      className="text-rose-600 font-bold px-1"
                      title="Cancelar"
                      onClick={() => {
                        setCreating(false);
                        setNewDesc('');
                        setNewExpedicao(false);
                        setNewManufatura(false);
                      }}
                    >
                      ×
                    </button>
                  </td>
                  <td className="p-2">
                    <input
                      autoFocus
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="h-8 rounded border px-3 text-sm bg-white shadow-sm w-full"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      className={`inline-flex items-center justify-center w-6 h-6 rounded ${newExpedicao ? 'bg-emerald-600' : 'bg-gray-300'}`}
                      onClick={() => setNewExpedicao((v) => !v)}
                      title="Alternar Utilizar na expedição"
                    >
                      {newExpedicao && <Check className="size-4 text-white" />}
                    </button>
                  </td>
                  <td className="p-2 text-center">
                    <button
                      className={`inline-flex items-center justify-center w-6 h-6 rounded ${newManufatura ? 'bg-emerald-600' : 'bg-gray-300'}`}
                      onClick={() => setNewManufatura((v) => !v)}
                      title="Alternar Utilizar na manufatura"
                    >
                      {newManufatura && <Check className="size-4 text-white" />}
                    </button>
                  </td>
                  <td className="p-2 text-center">—</td>
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
                    <td className="px-2 text-center align-middle">...</td>
                    <td className="p-3 text-sm">{row.descricao}</td>
                    <td className="p-3 text-sm text-center">
                      <button
                        className={`inline-flex items-center justify-center w-6 h-6 rounded ${row.usarNaExpedicao ? 'bg-emerald-600' : 'bg-gray-300'}`}
                        onClick={() => updateAsync({ id: row.id, data: { usarNaExpedicao: !row.usarNaExpedicao } })}
                        title="Alternar Utilizar na expedição"
                      >
                        {row.usarNaExpedicao && <Check className="size-4 text-white" />}
                      </button>
                    </td>
                    <td className="p-3 text-sm text-center">
                      <button
                        className={`inline-flex items-center justify-center w-6 h-6 rounded ${row.usarNaManufatura ? 'bg-emerald-600' : 'bg-gray-300'}`}
                        onClick={() => updateAsync({ id: row.id, data: { usarNaManufatura: !row.usarNaManufatura } })}
                        title="Alternar Utilizar na manufatura"
                      >
                        {row.usarNaManufatura && <Check className="size-4 text-white" />}
                      </button>
                    </td>
                    <td className="p-3 text-sm text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-white text-[11px] ${row.situacao === 'ATIVO' ? 'bg-emerald-600' : 'bg-gray-400'}`}>{row.situacao}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

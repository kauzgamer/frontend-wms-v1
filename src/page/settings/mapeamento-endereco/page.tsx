import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search as SearchIcon, SlidersHorizontal, MoreVertical } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAddressMappings } from '@/lib/hooks/use-address-mapping';

export default function MapeamentoEnderecoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [situacao, setSituacao] = useState<'ATIVO' | 'INATIVO' | 'TODOS'>('ATIVO');
  const [openColumns, setOpenColumns] = useState(false);

  const { data, isLoading, error } = useAddressMappings({
    q: searchTerm || undefined,
    situacao: situacao === 'TODOS' ? undefined : situacao,
  });

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    descricao: true,
    categoria: true,
    produto: true,
    tipoEstoque: true,
    nivel: true,
    situacao: true,
  });
  const [draftCols, setDraftCols] = useState(visibleCols);

  const filtered = useMemo(() => {
    const items = data ?? [];
    return items.filter((i) => {
      if (situacao !== 'TODOS' && i.situacao !== situacao) return false;
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        return (
          i.descricao.toLowerCase().includes(t) ||
          (i.produto ?? '').toLowerCase().includes(t) ||
          (i.categoriaProduto ?? '').toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [data, situacao, searchTerm]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filtered.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4 max-w-[calc(100vw-80px)]">
      <div className="w-full">
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Início</Link>
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
              <BreadcrumbPage>Mapeamento de endereços</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold leading-tight flex-shrink-0" style={{ color: '#4a5c60' }}>
            Mapeamento de endereços
          </h1>
          <div className="flex gap-3 flex-shrink-0">
            <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white whitespace-nowrap">
              <Link to="/settings/mapeamento-endereco/novo">Novo mapeamento</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap">
              <Link to="/settings">Voltar</Link>
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border w-full">
        <div className="flex items-center gap-3 px-5 py-3 border-b bg-white/60 overflow-x-auto">
          <Button asChild className="bg-[#0082a1] hover:bg-[#006c85] text-white h-9 px-4 text-[13px] font-semibold tracking-wide">
            <Link to="/settings/mapeamento-endereco/novo"><Plus className="size-4 mr-1" /> Novo mapeamento</Link>
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
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <button
              className="text-[#0c9abe] hover:opacity-80 transition text-sm flex-shrink-0"
              title="Gerenciador de colunas"
              onClick={() => {
                setDraftCols(visibleCols);
                setOpenColumns(true);
              }}
            >
              <SlidersHorizontal className="size-4" />
            </button>
            <div className="relative w-56 flex-shrink-0">
              <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 h-9 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground"
                placeholder="Pesquisar"
              />
            </div>
          </div>
        </div>

        <Dialog.Root open={openColumns} onOpenChange={setOpenColumns}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[720px] max-w-[95vw] rounded-md bg-white shadow-xl border">
              <div className="px-6 py-5 border-b">
                <Dialog.Title className="text-xl font-semibold">Gerenciador de colunas</Dialog.Title>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'descricao', label: 'Descrição' },
                  { key: 'categoria', label: 'Categoria do produto' },
                  { key: 'produto', label: 'Produto' },
                  { key: 'tipoEstoque', label: 'Tipo de estoque' },
                  { key: 'nivel', label: 'Nível de especificação' },
                  { key: 'situacao', label: 'Situação' },
                ].map(({ key, label }) => (
                  <label key={key} className="inline-flex items-center gap-3 select-none">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#0c9abe]"
                      checked={!!draftCols[key]}
                      onChange={() => setDraftCols((prev) => ({ ...prev, [key]: !prev[key] }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50">
                <Button variant="outline" onClick={() => setOpenColumns(false)}>
                  Cancelar
                </Button>
                <Button className="bg-[#0c9abe] hover:bg-[#0a86a1] text-white" onClick={() => { setVisibleCols(draftCols); setOpenColumns(false); }}>
                  Aplicar
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Tabela */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : error ? (
          <div className="text-center py-12">Erro ao carregar</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b bg-white">
                  <th className="w-10 border-r sticky left-0 z-20 bg-white" />
                  {visibleCols.descricao && (
                    <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '220px' }}>
                      <div className="relative flex items-center justify-between">
                        <span className="text-cyan-700">Descrição</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </th>
                  )}
                  {visibleCols.categoria && (
                    <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '200px' }}>
                      <div className="relative flex items-center justify-between">
                        <span className="text-cyan-700">Categoria do produto</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </th>
                  )}
                  {visibleCols.produto && (
                    <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '220px' }}>
                      <div className="relative flex items-center justify-between">
                        <span className="text-cyan-700">Produto</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </th>
                  )}
                  {visibleCols.tipoEstoque && (
                    <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '140px' }}>
                      <div className="relative flex items-center justify-between">
                        <span className="text-cyan-700">Tipo de estoque</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </th>
                  )}
                  {visibleCols.nivel && (
                    <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '160px' }}>
                      <div className="relative flex items-center justify-between">
                        <span className="text-cyan-700">Nível de especificação</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </th>
                  )}
                  {visibleCols.situacao && (
                    <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '120px' }}>
                      <div className="relative flex items-center justify-between">
                        <span className="text-cyan-700">Situação</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="px-2 text-center align-middle border-r sticky left-0 z-10 bg-white">...</td>
                    {visibleCols.descricao && <td className="p-3 text-sm">{row.descricao}</td>}
                    {visibleCols.categoria && (
                      <td className="p-3 text-sm whitespace-nowrap">{row.categoriaProduto ?? '-'}</td>
                    )}
                    {visibleCols.produto && (
                      <td className="p-3 text-sm whitespace-nowrap">{row.produto ?? '-'}</td>
                    )}
                    {visibleCols.tipoEstoque && (
                      <td className="p-3 text-sm whitespace-nowrap">{row.stockTypeDescricao ?? row.tipoEstoque}</td>
                    )}
                    {visibleCols.nivel && (
                      <td className="p-3 text-sm whitespace-nowrap">{row.nivelEspecificacao}</td>
                    )}
                    {visibleCols.situacao && (
                      <td className="p-3 text-sm whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-white text-[11px] ${
                          row.situacao === 'ATIVO' ? 'bg-emerald-600' : 'bg-gray-400'
                        }`}>{row.situacao}</span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="border-t p-3 bg-white">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="font-medium">
              {filtered.length === 0
                ? '0 - 0 DE 0 RESULTADOS'
                : `${startIndex + 1} - ${Math.min(endIndex, filtered.length)} DE ${filtered.length} RESULTADOS`}
            </span>
            <div className="flex items-center gap-4">
              {currentPage < totalPages && (
                <Button
                  variant="link"
                  className="text-cyan-600 hover:text-cyan-700 h-auto p-0 font-medium"
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Carregar mais {Math.min(pageSize, filtered.length - endIndex)} resultados
                </Button>
              )}
              <div className="flex items-center gap-2">
                <span className="uppercase font-medium">EXIBIR</span>
                <select
                  className="border border-gray-300 rounded px-3 py-1.5 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="uppercase font-medium">RESULTADOS POR VEZ</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

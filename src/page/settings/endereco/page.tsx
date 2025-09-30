import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search as SearchIcon, SlidersHorizontal, MoreVertical, Eye, Pencil, Maximize2, ChevronDown, Info } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAddresses } from '@/lib/hooks/use-addresses';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { AddressDetail, AddressFunction } from '@/lib/types/addresses';

export default function EnderecoPage() {
  const navigate = useNavigate();
  const { data: addresses, isLoading, error } = useAddresses();
  const [searchTerm, setSearchTerm] = useState('');
  // Filtro de situação: AB = Ativo e Bloqueado (padrão), ALL = mostrar todos (sem chip)
  const [filterSituacao, setFilterSituacao] = useState<'ALL' | 'AB' | 'ATIVO' | 'BLOQUEADO'>('AB');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [openColumns, setOpenColumns] = useState(false);

  // Estados da Pesquisa Avançada
  const [advEnderecoCompleto, setAdvEnderecoCompleto] = useState('');
  const [advEnderecoAbreviado, setAdvEnderecoAbreviado] = useState('');
  const [advSituacoes, setAdvSituacoes] = useState<Array<'ATIVO' | 'BLOQUEADO'>>(['ATIVO', 'BLOQUEADO']);
  const [advFuncoes, setAdvFuncoes] = useState<AddressFunction[]>([]);
  const [advDeposito, setAdvDeposito] = useState<string | null>(null);
  const [advEstrutura, setAdvEstrutura] = useState<string | null>(null);
  const [advAcessivel, setAdvAcessivel] = useState<'NA' | 'SIM' | 'NAO'>('NA');

  // Gerenciador de colunas (todas visíveis por padrão)
  const defaultVisibleCols: Record<string, boolean> = {
    deposito: true,
    enderecoCompleto: true,
    enderecoAbreviado: true,
    estruturaFisica: true,
    funcao: true,
    acessivelAMao: true,
    capUnitizador: true,
    capAltura: true,
    capComprimento: true,
    capLargura: true,
    capPeso: true,
    ocCubagem: true,
    ocCubagemPrev: true,
    ocPeso: true,
    ocPesoPrev: true,
    ocUnitizador: true,
    ocUnitizadorPrev: true,
    codigoBarras: true,
    situacao: true,
    motivoBloqueio: true,
  };
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(defaultVisibleCols);
  const [draftVisibleCols, setDraftVisibleCols] = useState<Record<string, boolean>>(defaultVisibleCols);

  const depositoOptions = useMemo(() => {
    return Array.from(new Set((addresses ?? []).map(a => a.deposito))).sort();
  }, [addresses]);

  const estruturaOptions = useMemo(() => {
    return Array.from(new Set((addresses ?? []).map(a => a.estruturaFisica))).sort();
  }, [addresses]);

  const filteredAddresses = useMemo(() => {
    if (!addresses) return [];
    
    return addresses.filter((addr) => {
      // Filtro de situação
      if (filterSituacao !== 'ALL' && filterSituacao !== 'AB') {
        if (addr.situacao !== filterSituacao) return false;
      }

      // Filtros da pesquisa avançada
      if (advEnderecoCompleto && !addr.enderecoCompleto.toLowerCase().includes(advEnderecoCompleto.toLowerCase())) {
        return false;
      }
      if (advEnderecoAbreviado && !addr.enderecoAbreviado.toLowerCase().includes(advEnderecoAbreviado.toLowerCase())) {
        return false;
      }
      if (advDeposito && addr.deposito !== advDeposito) {
        return false;
      }
      if (advEstrutura && addr.estruturaFisica !== advEstrutura) {
        return false;
      }
      if (advFuncoes.length > 0 && !advFuncoes.includes(addr.funcao)) {
        return false;
      }
      if (advAcessivel !== 'NA') {
        if (advAcessivel === 'SIM' && !addr.acessivelAMao) return false;
        if (advAcessivel === 'NAO' && addr.acessivelAMao) return false;
      }
      
      // Filtro de busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          addr.enderecoCompleto.toLowerCase().includes(term) ||
          addr.enderecoAbreviado.toLowerCase().includes(term) ||
          addr.deposito.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
  }, [
    addresses,
    searchTerm,
    filterSituacao,
    advEnderecoCompleto,
    advEnderecoAbreviado,
    advDeposito,
    advEstrutura,
    advFuncoes,
    advAcessivel,
  ]);

  const paginatedAddresses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAddresses.slice(startIndex, endIndex);
  }, [filteredAddresses, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAddresses.length / pageSize);
  const startResult = filteredAddresses.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endResult = Math.min(currentPage * pageSize, filteredAddresses.length);

  return (
    <div className="flex flex-col gap-6 p-6 pt-4">
      {/* Breadcrumb e header */}
      <div>
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
              <BreadcrumbPage>Cadastro de endereço</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>
            Cadastro de endereço
          </h1>
          <div className="flex gap-3">
            <Button asChild size="lg" variant="outline" className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50">
              <Link to="/settings">Voltar</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50">
              Imprimir em lote
            </Button>
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
              Alterar em lote
            </Button>
          </div>
        </div>
      </div>

      {/* Card de endereços */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Endereços</h2>

            {/* Toolbar superior (gerenciador de colunas, export, busca, avançada, tela cheia) */}
            <div className="hidden md:flex items-center text-cyan-700">
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <button
                className="p-2 rounded hover:bg-cyan-50"
                title="Gerenciador de colunas"
                aria-label="Gerenciador de colunas"
                onClick={() => { setDraftVisibleCols(visibleCols); setOpenColumns(true); }}
              >
                <SlidersHorizontal className="size-5" />
              </button>
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <div className="flex items-center gap-2">
                <button className="rounded border border-cyan-600 text-cyan-700 px-2 py-1 text-xs font-semibold hover:bg-cyan-50">
                  XLS
                </button>
                <button className="rounded border border-cyan-600 text-cyan-700 px-2 py-1 text-xs font-semibold hover:bg-cyan-50">
                  PDF
                </button>
              </div>
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <div className="relative">
                <Input
                  placeholder="Pesquisar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-[340px]"
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-cyan-700" />
              </div>
              <button className="ml-3 text-cyan-700 font-medium hover:underline">
                <span onClick={() => setOpenAdvanced(true)}>Pesquisa.Avançada</span>
              </button>
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <button className="p-2 rounded hover:bg-cyan-50" title="Tela cheia">
                <Maximize2 className="size-5" />
              </button>
            </div>
          </div>

          {/* Botão Novo endereço e Filtros na mesma linha */}
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => navigate('/settings/endereco/new')}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="size-4" /> Novo endereço
            </Button>
            
            {/* Chip "Filtrando por" conforme print: Situação: Ativo, Bloqueado [X] */}
            {filterSituacao !== 'ALL' && (
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-sm font-medium">Filtrando por:</span>
                <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 bg-white leading-none text-gray-700">
                  <span className="font-medium">Situação:</span>
                  <span className="text-[#0c9abe] font-semibold">
                    {filterSituacao === 'AB'
                      ? 'Ativo, Bloqueado'
                      : filterSituacao === 'ATIVO'
                        ? 'Ativo'
                        : 'Bloqueado'}
                  </span>
                  <button
                    className="text-muted-foreground hover:text-foreground text-xs leading-none"
                    aria-label="Limpar filtro de situação"
                    onClick={() => setFilterSituacao('ALL')}
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
            {/* Campo de busca movido para a barra superior */}
          </div>

          {/* Modal de Pesquisa Avançada */}
          <Dialog.Root open={openAdvanced} onOpenChange={setOpenAdvanced}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[940px] max-w-[95vw] rounded-md bg-white shadow-xl border">
                <div className="px-6 py-5 border-b">
                  <Dialog.Title className="text-2xl font-semibold">Pesquisa Avançada</Dialog.Title>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Endereço completo (Desktop)</label>
                    <Input placeholder="Informe a descrição" value={advEnderecoCompleto} onChange={(e) => setAdvEnderecoCompleto(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Endereço abreviado (Dispositivos móveis)</label>
                    <Input placeholder="Informe a descrição mobile" value={advEnderecoAbreviado} onChange={(e) => setAdvEnderecoAbreviado(e.target.value)} />
                  </div>

                  {/* Situação (chips + dropdown icone) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Situação</label>
                    <div className="flex items-center justify-between rounded-md border px-2 py-1.5">
                      <div className="flex flex-wrap gap-2">
                        {(['ATIVO','BLOQUEADO'] as const).map(s => (
                          advSituacoes.includes(s) ? (
                            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                              {s}
                              <button className="text-gray-500 hover:text-gray-700" aria-label={`Remover ${s}`} onClick={() => setAdvSituacoes(prev => prev.filter(x => x !== s))}>×</button>
                            </span>
                          ) : (
                            <button key={s} className="text-xs text-gray-500 hover:text-gray-700 underline" onClick={() => setAdvSituacoes(prev => [...prev, s])}>{s}</button>
                          )
                        ))}
                      </div>
                      <ChevronDown className="size-4 text-gray-500" />
                    </div>
                  </div>

                  {/* Função (multi-select simples via dropdown) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Função</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm">
                          <span className="truncate">
                            {advFuncoes.length === 0 ? 'Selecione uma ou mais funções' : advFuncoes.join(', ')}
                          </span>
                          <ChevronDown className="size-4 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[320px]">
                        {(['Stage','Doca','Produção','Picking','Armazenagem'] as AddressFunction[]).map(fn => (
                          <DropdownMenuItem key={fn} onClick={(e) => {
                            e.preventDefault();
                            setAdvFuncoes(prev => prev.includes(fn) ? prev.filter(x => x !== fn) : [...prev, fn]);
                          }}>
                            <input type="checkbox" readOnly checked={advFuncoes.includes(fn)} className="mr-2" /> {fn}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Depósito */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Depósito</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm">
                          <span className="truncate">{advDeposito ?? 'Selecione o depósito'}</span>
                          <ChevronDown className="size-4 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[320px]">
                        <DropdownMenuItem onClick={() => setAdvDeposito(null)}>— Limpar —</DropdownMenuItem>
                        {depositoOptions.map(opt => (
                          <DropdownMenuItem key={opt} onClick={() => setAdvDeposito(opt)}>{opt}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="text-xs text-muted-foreground flex items-center gap-2"><Info className="size-4" /> Escolha o depósito e a estrutura física</div>
                  </div>

                  {/* Estrutura física */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Estrutura física</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm">
                          <span className="truncate">{advEstrutura ?? 'Selecione a estrutura física'}</span>
                          <ChevronDown className="size-4 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[320px] max-h-64 overflow-auto">
                        <DropdownMenuItem onClick={() => setAdvEstrutura(null)}>— Limpar —</DropdownMenuItem>
                        {estruturaOptions.map(opt => (
                          <DropdownMenuItem key={opt} onClick={() => setAdvEstrutura(opt)}>{opt}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Acessível a mão */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold">Acessível a mão</label>
                      <div className="flex items-center gap-6">
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={advAcessivel==='SIM'} onChange={(e) => setAdvAcessivel(e.target.checked ? 'SIM' : 'NA')} /> Acessível a mão</label>
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={advAcessivel==='NAO'} onChange={(e) => setAdvAcessivel(e.target.checked ? 'NAO' : 'NA')} /> Não acessível a mão</label>
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={advAcessivel==='NA'} onChange={() => setAdvAcessivel('NA')} /> Não aplicavel</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50">
                  <Button variant="outline" onClick={() => setOpenAdvanced(false)}>Cancelar</Button>
                  <Button className="bg-[#0c9abe] hover:bg-[#0a86a1] text-white" onClick={() => {
                    // Aplicar situação no chip externo
                    const setVal = (advSituacoes.includes('ATIVO') && advSituacoes.includes('BLOQUEADO')) ? 'AB' : advSituacoes.includes('ATIVO') ? 'ATIVO' : advSituacoes.includes('BLOQUEADO') ? 'BLOQUEADO' : 'ALL';
                    setFilterSituacao(setVal as typeof filterSituacao);
                    setOpenAdvanced(false);
                  }}>Aplicar filtros</Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Modal Gerenciador de colunas */}
          <Dialog.Root open={openColumns} onOpenChange={setOpenColumns}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[860px] max-w-[95vw] max-h-[80vh] overflow-auto rounded-md bg-white shadow-xl border">
                <div className="px-6 py-5 border-b">
                  <Dialog.Title className="text-2xl font-semibold">Gerenciador de colunas</Dialog.Title>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[15px]">
                  {[
                    { key: 'deposito', label: 'Depósito' },
                    { key: 'enderecoCompleto', label: 'Endereço completo (Desktop)' },
                    { key: 'enderecoAbreviado', label: 'Endereço abreviado (Dispositivos móveis)' },
                    { key: 'estruturaFisica', label: 'Estrutura física' },
                    { key: 'funcao', label: 'Função' },
                    { key: 'acessivelAMao', label: 'Acessível a mão' },
                    { key: 'capUnitizador', label: 'Capacidade unitizador' },
                    { key: 'capAltura', label: 'Capacidade altura' },
                    { key: 'capComprimento', label: 'Capacidade comprimento' },
                    { key: 'capLargura', label: 'Capacidade largura' },
                    { key: 'capPeso', label: 'Capacidade peso' },
                    { key: 'ocCubagem', label: 'Ocupação cubagem' },
                    { key: 'ocCubagemPrev', label: 'Ocupação cubagem prevista' },
                    { key: 'ocPeso', label: 'Ocupação peso' },
                    { key: 'ocPesoPrev', label: 'Ocupação peso prevista' },
                    { key: 'ocUnitizador', label: 'Ocupação unitizador' },
                    { key: 'ocUnitizadorPrev', label: 'Ocupação unitizador prevista' },
                    { key: 'codigoBarras', label: 'Código de barras' },
                    { key: 'situacao', label: 'Situação' },
                    { key: 'motivoBloqueio', label: 'Motivo bloqueio' },
                  ].map(({ key, label }) => (
                    <label key={key} className="inline-flex items-center gap-3 select-none">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#0c9abe]"
                        checked={!!draftVisibleCols[key]}
                        onChange={() => setDraftVisibleCols(prev => ({ ...prev, [key]: !prev[key] }))}
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

          {/* Área de agrupamento removida a pedido do cliente */}

          {/* Tabela de endereços */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando endereços...
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-amber-600 font-medium mb-2">
                Backend não configurado
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Os endpoints de endereços ainda não foram implementados no backend.
              </p>
              <Button onClick={() => navigate('/settings/endereco/new')}>
                <Plus className="size-4" /> Criar novos endereços
              </Button>
            </div>
          ) : filteredAddresses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">
                Nenhum endereço cadastrado
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Comece criando seu primeiro endereço.
              </p>
              <Button onClick={() => navigate('/settings/endereco/new')}>
                <Plus className="size-4" /> Criar primeiro endereço
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Limitamos a largura visível para caber até a coluna "Acessível a mão"; colunas seguintes exigem scroll */}
              <div className="overflow-x-auto overflow-y-auto max-h-[600px] max-w-[1100px]">
                <table className="w-full" style={{ minWidth: '2000px' }}>
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr className="text-gray-700 divide-x divide-gray-200">
                      {/* Cabeçalho da coluna de ações vazio, igual ao print */}
                      <th className="p-3 sticky left-0 z-20 bg-gray-100" style={{ width: '64px' }} />
                      {visibleCols.deposito && (
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '100px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Depósito</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                              <DropdownMenuItem>Fixar à esquerda</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </th>
                      )}
                      {visibleCols.enderecoCompleto && (
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '280px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Endereço completo (Desktop)</span>
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
                      {visibleCols.enderecoAbreviado && (
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '220px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Endereço abreviado (Dispositivos móveis)</span>
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
                      {visibleCols.estruturaFisica && (
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '140px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Estrutura física</span>
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
                      {visibleCols.funcao && (
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '120px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Função</span>
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
                      {visibleCols.acessivelAMao && (
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '180px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Acessível a mão</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                              <DropdownMenuItem>Fixar à direita</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </th>
                      )}
                      {visibleCols.capUnitizador && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[160px]">Cap. Unitizador</th>)}
                      {visibleCols.capAltura && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[120px]">Cap. Altura</th>)}
                      {visibleCols.capComprimento && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[150px]">Cap. Comprimento</th>)}
                      {visibleCols.capLargura && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[120px]">Cap. Largura</th>)}
                      {visibleCols.capPeso && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[120px]">Cap. Peso</th>)}
                      {visibleCols.ocCubagem && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[150px]">Ocup. Cubagem</th>)}
                      {visibleCols.ocCubagemPrev && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[180px]">Ocup. Cubagem Prev.</th>)}
                      {visibleCols.ocPeso && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[140px]">Ocup. Peso</th>)}
                      {visibleCols.ocPesoPrev && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[160px]">Ocup. Peso Prev.</th>)}
                      {visibleCols.ocUnitizador && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[180px]">Ocup. Unitizador</th>)}
                      {visibleCols.ocUnitizadorPrev && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[200px]">Ocup. Unitizador Prev.</th>)}
                      {visibleCols.codigoBarras && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[160px]">Código de barras</th>)}
                      {visibleCols.situacao && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[100px]">Situação</th>)}
                      {visibleCols.motivoBloqueio && (<th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[180px]">Motivo bloqueio</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAddresses.map((addr) => {
                      const det = addr as Partial<AddressDetail>;
                      return (
                      <tr 
                        key={addr.id}
                        className="border-t hover:bg-muted/30 cursor-pointer transition-colors divide-x divide-gray-200"
                        onClick={() => navigate(`/settings/endereco/${addr.id}`)}
                      >
                        <td className="p-3 text-sm whitespace-nowrap sticky left-0 z-10 bg-white">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="inline-flex items-center justify-center rounded-md border bg-white hover:bg-muted/50 w-8 h-8"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Ações do endereço"
                              >
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => navigate(`/settings/endereco/${addr.id}`)}>
                                <Eye className="size-4" /> Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/settings/endereco/${addr.id}?edit=1`)}>
                                <Pencil className="size-4" /> Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        {visibleCols.deposito && (<td className="p-3 text-sm whitespace-nowrap">{addr.deposito}</td>)}
                        {visibleCols.enderecoCompleto && (<td className="p-3 text-sm whitespace-nowrap">{addr.enderecoCompleto}</td>)}
                        {visibleCols.enderecoAbreviado && (<td className="p-3 text-sm whitespace-nowrap">{addr.enderecoAbreviado}</td>)}
                        {visibleCols.estruturaFisica && (<td className="p-3 text-sm whitespace-nowrap">{addr.estruturaFisica}</td>)}
                        {visibleCols.funcao && (<td className="p-3 text-sm whitespace-nowrap">{addr.funcao}</td>)}
                        {visibleCols.acessivelAMao && (<td className="p-3 text-sm whitespace-nowrap">
                          {addr.acessivelAMao ? (
                            <Badge className="bg-green-600 hover:bg-green-700 text-white">ACESSÍVEL A MÃO</Badge>
                          ) : (
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white">NÃO ACESSÍVEL A MÃO</Badge>
                          )}
                        </td>)}
                        {visibleCols.capUnitizador && (<td className="p-3 text-sm whitespace-nowrap">{det.unitizador || '-'}</td>)}
                        {visibleCols.capAltura && (<td className="p-3 text-sm whitespace-nowrap">{det.altura != null ? `${det.altura}cm` : '-'}</td>)}
                        {visibleCols.capComprimento && (<td className="p-3 text-sm whitespace-nowrap">{det.comprimento != null ? `${det.comprimento}cm` : '-'}</td>)}
                        {visibleCols.capLargura && (<td className="p-3 text-sm whitespace-nowrap">{det.largura != null ? `${det.largura}cm` : '-'}</td>)}
                        {visibleCols.capPeso && (<td className="p-3 text-sm whitespace-nowrap">{det.peso != null ? `${det.peso}kg` : '-'}</td>)}
                        {visibleCols.ocCubagem && (<td className="p-3 text-sm whitespace-nowrap text-right">-</td>)}
                        {visibleCols.ocCubagemPrev && (<td className="p-3 text-sm whitespace-nowrap text-right">-</td>)}
                        {visibleCols.ocPeso && (<td className="p-3 text-sm whitespace-nowrap text-right">-</td>)}
                        {visibleCols.ocPesoPrev && (<td className="p-3 text-sm whitespace-nowrap text-right">-</td>)}
                        {visibleCols.ocUnitizador && (<td className="p-3 text-sm whitespace-nowrap text-right">-</td>)}
                        {visibleCols.ocUnitizadorPrev && (<td className="p-3 text-sm whitespace-nowrap text-right">-</td>)}
                        {visibleCols.codigoBarras && (<td className="p-3 text-sm whitespace-nowrap">-</td>)}
                        {visibleCols.situacao && (<td className="p-3 text-sm whitespace-nowrap">
                          <Badge variant={addr.situacao === 'ATIVO' ? 'default' : 'warning'}>
                            {addr.situacao}
                          </Badge>
                        </td>)}
                        {visibleCols.motivoBloqueio && (<td className="p-3 text-sm whitespace-nowrap text-muted-foreground">-</td>)}
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              
              {/* Footer com paginação */}
              <div className="border-t p-3 bg-white">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span className="font-medium">
                    {startResult} - {endResult} DE {filteredAddresses.length} RESULTADOS
                  </span>
                  <div className="flex items-center gap-4">
                    {currentPage < totalPages && (
                      <Button 
                        variant="link" 
                        className="text-cyan-600 hover:text-cyan-700 h-auto p-0 font-medium"
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        Carregar mais {Math.min(pageSize, filteredAddresses.length - endResult)} resultados
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

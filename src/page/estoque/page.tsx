import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, Maximize2, Package } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { useStocks } from '@/lib/hooks/use-stock';

export default function EstoquePage() {
  const navigate = useNavigate();

  // Filtros simples (toolbar)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DISPONIVEL' | 'RESERVADO' | 'BLOQUEADO' | 'QUARENTENA'>('ALL');

  // Paginação local (visual)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modais
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [openColumns, setOpenColumns] = useState(false);

  // Pesquisa avançada
  const [advEstabelecimento, setAdvEstabelecimento] = useState('');
  const [advDeposito, setAdvDeposito] = useState('');
  const [advLote, setAdvLote] = useState('');
  const [advProduto, setAdvProduto] = useState('');
  const [advEndereco, setAdvEndereco] = useState('');

  // Gerenciador de colunas
  const defaultVisibleCols: Record<string, boolean> = {
    produto: true,
    sku: true,
    estabelecimento: true,
    deposito: true,
    endereco: true,
    lote: true,
    quantidadeData: true,
    quantidadeAtual: true,
    quantidadeDisponivel: true,
    quantidadeAlocada: true,
    quantidadeAlocadaProducao: true,
    quantidadeAlocadaPedido: true,
    validade: true,
    status: true,
  };
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(defaultVisibleCols);
  const [draftVisibleCols, setDraftVisibleCols] = useState<Record<string, boolean>>(defaultVisibleCols);

  // Buscar do backend (read-only)
  const { data, isLoading } = useStocks({
    search: searchTerm || undefined,
    estabelecimento: advEstabelecimento || undefined,
    deposito: advDeposito || undefined,
    lote: advLote || undefined,
    status: filterStatus !== 'ALL' ? filterStatus : undefined,
    page: currentPage,
    limit: pageSize,
  });

  // Backend retorna array diretamente (memoizado para dependências estáveis)
  const stocks = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Filtro local adicional (produto, endereço etc.)
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      if (filterStatus !== 'ALL' && stock.status !== filterStatus) return false;
      if (advProduto && !stock.product?.name?.toLowerCase().includes(advProduto.toLowerCase())) return false;
      if (advEndereco && !stock.address?.enderecoCompleto?.toLowerCase().includes(advEndereco.toLowerCase())) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !(stock.product?.name?.toLowerCase().includes(term) ||
            stock.product?.sku?.toLowerCase().includes(term) ||
            stock.sku?.description?.toLowerCase().includes(term) ||
            stock.lote?.toLowerCase().includes(term) ||
            stock.estabelecimento?.toLowerCase().includes(term) ||
            stock.deposito?.toLowerCase().includes(term) ||
            stock.address?.enderecoAbreviado?.toLowerCase().includes(term) ||
            stock.address?.enderecoCompleto?.toLowerCase().includes(term))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [stocks, filterStatus, searchTerm, advProduto, advEndereco]);

  // Paginação local
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStocks.slice(start, start + pageSize);
  }, [filteredStocks, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / pageSize) || 1);

  function formatDate(date: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  function formatQuantity(qty: number) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(qty);
  }

  type StockStatus = 'DISPONIVEL' | 'RESERVADO' | 'BLOQUEADO' | 'QUARENTENA';
  function getStatusBadge(status: string) {
    const colors: Record<StockStatus, string> = {
      DISPONIVEL: 'bg-green-100 text-green-800',
      RESERVADO: 'bg-blue-100 text-blue-800',
      BLOQUEADO: 'bg-red-100 text-red-800',
      QUARENTENA: 'bg-yellow-100 text-yellow-800',
    };
    return colors[(status as StockStatus)] ?? 'bg-gray-100 text-gray-800';
  }

  function handleResetAdvanced() {
    setAdvEstabelecimento('');
    setAdvDeposito('');
    setAdvLote('');
    setAdvProduto('');
    setAdvEndereco('');
  }

  function handleApplyColumns() {
    setVisibleCols(draftVisibleCols);
    setOpenColumns(false);
  }

  function handleResetColumns() {
    setDraftVisibleCols(defaultVisibleCols);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header fixo */}
      <div className="border-b bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold">Estoque</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Estoque</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Toolbar - mesma linguagem visual da página de endereços */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {/* Chip de Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {filterStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                Status: {filterStatus}
                <button
                  className="hover:text-red-600"
                  aria-label="Limpar filtro de status"
                  onClick={() => setFilterStatus('ALL')}
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {/* Toolbar direita */}
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
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
            <button className="text-[#0c9abe] hover:opacity-80 transition text-sm inline-flex items-center gap-1 flex-shrink-0">
              <span className="text-xs font-semibold">XLS</span>
            </button>
            <button className="text-[#0c9abe] hover:opacity-80 transition text-sm inline-flex items-center gap-1 flex-shrink-0">
              <span className="text-xs font-semibold">PDF</span>
            </button>
            <div className="relative w-44 flex-shrink-0">
              <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 h-9 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground"
                placeholder="Pesquisar"
              />
            </div>
            <button
              className="text-[#0c9abe] hover:underline text-sm font-medium whitespace-nowrap flex-shrink-0"
              onClick={() => setOpenAdvanced(true)}
            >
              Pesquisa Avançada
            </button>
            <div className="h-6 w-px bg-border flex-shrink-0" />
            <button className="text-[#0c9abe] hover:opacity-80 flex-shrink-0" title="Tela cheia">
              <Maximize2 className="size-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-[#0c9abe] hover:bg-[#0a869d] text-white rounded-md px-4 h-9 text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Modal de Pesquisa Avançada */}
        <Dialog.Root open={openAdvanced} onOpenChange={setOpenAdvanced}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[940px] max-w-[95vw] rounded-md bg-white shadow-xl border">
              <div className="px-6 py-5 border-b">
                <Dialog.Title className="text-2xl font-semibold">Pesquisa Avançada</Dialog.Title>
                <Dialog.Description className="sr-only">Defina critérios adicionais de filtragem para a lista de estoque.</Dialog.Description>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Estabelecimento</label>
                  <Input placeholder="Ex: 01" value={advEstabelecimento} onChange={(e) => setAdvEstabelecimento(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Depósito</label>
                  <Input placeholder="Ex: A01" value={advDeposito} onChange={(e) => setAdvDeposito(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Lote/Série</label>
                  <Input placeholder="Número do lote" value={advLote} onChange={(e) => setAdvLote(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Produto</label>
                  <Input placeholder="Nome do produto" value={advProduto} onChange={(e) => setAdvProduto(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Endereço</label>
                  <Input placeholder="Endereço do estoque" value={advEndereco} onChange={(e) => setAdvEndereco(e.target.value)} />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  >
                    <option value="ALL">Todos</option>
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="BLOQUEADO">Bloqueado</option>
                    <option value="QUARENTENA">Quarentena</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <button className="text-[#0c9abe] hover:underline text-sm font-medium" onClick={handleResetAdvanced}>Limpar filtros</button>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm font-medium" onClick={() => setOpenAdvanced(false)}>Cancelar</button>
                  <button className="px-4 py-2 rounded-md bg-[#0c9abe] hover:bg-[#0a869d] text-white text-sm font-medium" onClick={() => setOpenAdvanced(false)}>Aplicar</button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Modal Gerenciador de Colunas */}
        <Dialog.Root open={openColumns} onOpenChange={setOpenColumns}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[600px] max-w-[95vw] rounded-md bg-white shadow-xl border">
              <div className="px-6 py-5 border-b">
                <Dialog.Title className="text-2xl font-semibold">Gerenciador de Colunas</Dialog.Title>
                <Dialog.Description className="sr-only">Selecione quais colunas deseja visualizar na tabela.</Dialog.Description>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {Object.entries(defaultVisibleCols).map(([key]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftVisibleCols[key]}
                      onChange={(e) => setDraftVisibleCols((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="size-4 rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {key === 'produto' && 'Produto'}
                      {key === 'sku' && 'SKU'}
                      {key === 'estabelecimento' && 'Estabelecimento'}
                      {key === 'deposito' && 'Depósito'}
                      {key === 'endereco' && 'Endereço'}
                      {key === 'lote' && 'Lote/Série'}
                      {key === 'quantidadeData' && 'Qtd. Data'}
                      {key === 'quantidadeAtual' && 'Qtd. Atual'}
                      {key === 'quantidadeDisponivel' && 'Disponível'}
                      {key === 'quantidadeAlocada' && 'Alocada'}
                      {key === 'quantidadeAlocadaProducao' && 'Aloc. Produção'}
                      {key === 'quantidadeAlocadaPedido' && 'Aloc. Pedido'}
                      {key === 'validade' && 'Validade'}
                      {key === 'status' && 'Status'}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <button className="text-[#0c9abe] hover:underline text-sm font-medium" onClick={handleResetColumns}>Resetar padrão</button>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm font-medium" onClick={() => setOpenColumns(false)}>Cancelar</button>
                  <button className="px-4 py-2 rounded-md bg-[#0c9abe] hover:bg-[#0a869d] text-white text-sm font-medium" onClick={handleApplyColumns}>Aplicar</button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Tabela com header sticky e scroll horizontal como em Endereços */}
      <div className="flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-white sticky top-0 z-10">
                {visibleCols.produto && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '240px' }}>Produto</th>
                )}
                {visibleCols.sku && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '200px' }}>SKU</th>
                )}
                {visibleCols.estabelecimento && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '90px' }}>Estab.</th>
                )}
                {visibleCols.deposito && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '120px' }}>Depósito</th>
                )}
                {visibleCols.endereco && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '240px' }}>Endereço</th>
                )}
                {visibleCols.lote && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '160px' }}>Lote/Série</th>
                )}
                {visibleCols.quantidadeData && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap text-right min-w-[120px]">Qtd. Data</th>
                )}
                {visibleCols.quantidadeAtual && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap text-right min-w-[120px]">Qtd. Atual</th>
                )}
                {visibleCols.quantidadeDisponivel && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap text-right min-w-[120px]">Disponível</th>
                )}
                {visibleCols.quantidadeAlocada && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap text-right min-w-[120px]">Alocada</th>
                )}
                {visibleCols.quantidadeAlocadaProducao && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap text-right min-w-[140px]">Aloc. Prod.</th>
                )}
                {visibleCols.quantidadeAlocadaPedido && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap text-right min-w-[140px]">Aloc. Pedido</th>
                )}
                {visibleCols.validade && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '120px' }}>Validade</th>
                )}
                {visibleCols.status && (
                  <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '100px' }}>Status</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-sm text-gray-500">Carregando estoques...</td>
                </tr>
              )}
              {!isLoading && paginatedStocks.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-500">Nenhum estoque encontrado</p>
                  </td>
                </tr>
              )}
              {!isLoading &&
                paginatedStocks.map((stock) => (
                  <tr key={stock.id} className="border-t hover:bg-muted/30">
                    {visibleCols.produto && (
                      <td className="p-3 text-sm whitespace-nowrap">
                        <div className="font-medium truncate" title={stock.product?.name ?? ''}>{stock.product?.name ?? '-'}</div>
                        <div className="text-xs text-muted-foreground">{stock.product?.sku ?? '-'}</div>
                      </td>
                    )}
                    {visibleCols.sku && (
                      <td className="p-3 text-sm whitespace-nowrap">{stock.sku?.description ?? '-'}</td>
                    )}
                    {visibleCols.estabelecimento && (
                      <td className="p-3 text-sm whitespace-nowrap font-mono">{stock.estabelecimento ?? '-'}</td>
                    )}
                    {visibleCols.deposito && (
                      <td className="p-3 text-sm whitespace-nowrap font-mono">{stock.deposito ?? '-'}</td>
                    )}
                    {visibleCols.endereco && (
                      <td className="p-3 text-sm whitespace-nowrap"><div className="truncate" title={stock.address?.enderecoAbreviado ?? ''}>{stock.address?.enderecoAbreviado ?? '-'}</div></td>
                    )}
                    {visibleCols.lote && (
                      <td className="p-3 text-sm whitespace-nowrap font-mono">{stock.lote ?? '-'}</td>
                    )}
                    {visibleCols.quantidadeData && (
                      <td className="p-3 text-sm whitespace-nowrap text-right font-mono">{formatQuantity(stock.quantidadeData)}</td>
                    )}
                    {visibleCols.quantidadeAtual && (
                      <td className="p-3 text-sm whitespace-nowrap text-right font-mono font-semibold">{formatQuantity(stock.quantidadeAtual)}</td>
                    )}
                    {visibleCols.quantidadeDisponivel && (
                      <td className="p-3 text-sm whitespace-nowrap text-right font-mono text-green-600">{formatQuantity(stock.quantidadeDisponivel)}</td>
                    )}
                    {visibleCols.quantidadeAlocada && (
                      <td className="p-3 text-sm whitespace-nowrap text-right font-mono text-blue-600">{formatQuantity(stock.quantidadeAlocada)}</td>
                    )}
                    {visibleCols.quantidadeAlocadaProducao && (
                      <td className="p-3 text-sm whitespace-nowrap text-right font-mono text-orange-600">{formatQuantity(stock.quantidadeAlocadaProducao)}</td>
                    )}
                    {visibleCols.quantidadeAlocadaPedido && (
                      <td className="p-3 text-sm whitespace-nowrap text-right font-mono text-purple-600">{formatQuantity(stock.quantidadeAlocadaPedido)}</td>
                    )}
                    {visibleCols.validade && (
                      <td className="p-3 text-sm whitespace-nowrap">{formatDate(stock.validade)}</td>
                    )}
                    {visibleCols.status && (
                      <td className="p-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(stock.status)}`}>{stock.status}</span>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação fixa no rodapé */}
      <div className="border-t bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Exibir</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700">
            registros por página. Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filteredStocks.length)} de {filteredStocks.length} registros.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Primeira
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-sm">Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Próxima
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Última
          </button>
        </div>
      </div>
    </div>
  );
}

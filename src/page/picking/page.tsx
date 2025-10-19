import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search as SearchIcon,
  SlidersHorizontal,
  Maximize2,
  RefreshCw,
  ShoppingCart,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { DataTableHeader } from "@/components/ui/data-table-header";
import {
  exportToXLSX,
  exportToPDF,
  canExport,
  type ExportColumn,
} from "@/lib/export";
import { useToast } from "@/components/ui/toast-context";
import { usePickingList, useUpdatePicking } from "@/lib/hooks/use-picking";

export default function PickingPage() {
  const { show: showToast } = useToast();

  // Query
  const {
    data: picking,
    isLoading,
    isError,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = usePickingList();
  const { mutateAsync: updateMapping } = useUpdatePicking();

  // Busca e filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Pesquisa avançada
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [advProduct, setAdvProduct] = useState("");
  const [advSku, setAdvSku] = useState("");
  const [advDeposit, setAdvDeposit] = useState("");
  const [advAddress, setAdvAddress] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ATIVO" | "INATIVO">(
    "ALL"
  );

  // Paginacao (client-side como em produtos)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Seleção de linhas
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Colunas visíveis
  const defaultVisibleCols: Record<string, boolean> = {
    id: true,
    deposit: true,
    address: true,
    product: true,
    sku: true,
    stockType: true,
    saldoAtual: true,
    reorderPoint: true,
    maxQuantity: true,
    status: true,
    createdAt: false,
    updatedAt: false,
  };
  const [visibleCols, setVisibleCols] =
    useState<Record<string, boolean>>(defaultVisibleCols);
  const [draftVisibleCols, setDraftVisibleCols] =
    useState<Record<string, boolean>>(defaultVisibleCols);
  const [openColumns, setOpenColumns] = useState(false);
  const [canXLS, setCanXLS] = useState(false);
  const [canPDF, setCanPDF] = useState(false);

  useEffect(() => {
    let mounted = true;
    canExport()
      .then(({ xlsx, pdf }) => {
        if (!mounted) return;
        setCanXLS(!!xlsx);
        setCanPDF(!!pdf);
      })
      .catch(() => {
        if (!mounted) return;
        setCanXLS(false);
        setCanPDF(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const showExportButtons = canXLS || canPDF;

  const items = useMemo(
    () => (Array.isArray(picking) ? picking : []),
    [picking]
  );

  function getExportColumns(): ExportColumn[] {
    const cols: { key: string; header: string }[] = [];
    if (visibleCols.id) cols.push({ key: "id", header: "ID" });
    if (visibleCols.deposit) cols.push({ key: "deposit", header: "Depósito" });
    if (visibleCols.address) cols.push({ key: "address", header: "Endereço" });
    if (visibleCols.product) cols.push({ key: "product", header: "Produto" });
    if (visibleCols.sku) cols.push({ key: "sku", header: "SKU" });
    if (visibleCols.stockType)
      cols.push({ key: "stockType", header: "Tipo de estoque" });
    if (visibleCols.saldoAtual)
      cols.push({ key: "saldoAtual", header: "Saldo atual" });
    if (visibleCols.reorderPoint)
      cols.push({ key: "reorderPoint", header: "Ponto de reabastec." });
    if (visibleCols.maxQuantity)
      cols.push({ key: "maxQuantity", header: "Quantidade máxima" });
    if (visibleCols.status) cols.push({ key: "status", header: "Situação" });
    if (visibleCols.createdAt)
      cols.push({ key: "createdAt", header: "Criado" });
    if (visibleCols.updatedAt)
      cols.push({ key: "updatedAt", header: "Atualizado" });
    return cols as ExportColumn[];
  }

  const filtered = useMemo(() => {
    return items.filter((it) => {
      // status
      if (filterStatus !== "ALL" && it.status !== filterStatus) return false;
      // pesquisa avançada
      if (
        advProduct &&
        !(it.product?.name ?? "")
          .toLowerCase()
          .includes(advProduct.toLowerCase())
      )
        return false;
      if (
        advSku &&
        !(it.sku?.description ?? "")
          .toLowerCase()
          .includes(advSku.toLowerCase())
      )
        return false;
      if (
        advDeposit &&
        !(
          (it.deposit?.nome ?? "")
            .toLowerCase()
            .includes(advDeposit.toLowerCase()) ||
          (it.deposit?.codigo ?? "")
            .toLowerCase()
            .includes(advDeposit.toLowerCase())
        )
      )
        return false;
      if (
        advAddress &&
        !(
          (it.address?.enderecoCompleto ?? "")
            .toLowerCase()
            .includes(advAddress.toLowerCase()) ||
          (it.address?.enderecoAbreviado ?? "")
            .toLowerCase()
            .includes(advAddress.toLowerCase())
        )
      )
        return false;
      // busca simples
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          (it.deposit?.nome ?? "").toLowerCase().includes(term) ||
          (it.deposit?.codigo ?? "").toLowerCase().includes(term) ||
          (it.address?.enderecoAbreviado ?? "").toLowerCase().includes(term) ||
          (it.address?.enderecoCompleto ?? "").toLowerCase().includes(term) ||
          (it.product?.name ?? "").toLowerCase().includes(term) ||
          (it.sku?.description ?? "").toLowerCase().includes(term) ||
          String(it.reorderPoint ?? "").includes(term) ||
          String(it.maxQuantity ?? "").includes(term) ||
          String(it.saldoAtual ?? "").includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [
    items,
    filterStatus,
    advProduct,
    advSku,
    advDeposit,
    advAddress,
    searchTerm,
  ]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil((filtered.length || 0) / pageSize);
  const startResult =
    filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endResult = Math.min(currentPage * pageSize, filtered.length);

  // Seleção baseada na página atual (definido após filtered/paginated)
  const allPageSelected = useMemo(() => {
    return (
      paginated.length > 0 && paginated.every((it) => selectedIds.has(it.id))
    );
  }, [paginated, selectedIds]);

  function toggleSelectAllPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const everySelected = paginated.every((it) => next.has(it.id));
      if (everySelected) paginated.forEach((it) => next.delete(it.id));
      else paginated.forEach((it) => next.add(it.id));
      return next;
    });
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleExportXLS() {
    try {
      const cols = getExportColumns();
      const rows = filtered.map((it) => ({
        id: it.id,
        deposit: it.deposit?.nome ?? it.depositId,
        address: it.address?.enderecoAbreviado ?? "-",
        product: it.product?.name ?? "-",
        sku: it.sku?.description ?? "-",
        stockType: "EXP",
        saldoAtual: it.saldoAtual ?? 0,
        reorderPoint: it.reorderPoint,
        maxQuantity: it.maxQuantity,
        status: it.status,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
      }));
      await exportToXLSX(
        "picking",
        cols,
        rows as unknown as Record<string, unknown>[]
      );
      showToast({ kind: "success", message: "Exportação XLSX concluída." });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Falha ao exportar para XLSX";
      showToast({ kind: "error", message: msg });
    }
  }

  async function handleExportPDF() {
    try {
      const cols = getExportColumns();
      const rows = filtered.map((it) => ({
        id: it.id,
        deposit: it.deposit?.nome ?? it.depositId,
        address: it.address?.enderecoAbreviado ?? "-",
        product: it.product?.name ?? "-",
        sku: it.sku?.description ?? "-",
        stockType: "EXP",
        saldoAtual: it.saldoAtual ?? 0,
        reorderPoint: it.reorderPoint,
        maxQuantity: it.maxQuantity,
        status: it.status,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
      }));
      await exportToPDF(
        "picking",
        cols,
        rows as unknown as Record<string, unknown>[]
      );
      showToast({ kind: "success", message: "Exportação PDF concluída." });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Falha ao exportar para PDF";
      showToast({ kind: "error", message: msg });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4 max-w-[calc(100vw-80px)]">
      {/* Breadcrumb */}
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
              <BreadcrumbPage>Picking</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1
          className="text-3xl font-semibold leading-tight"
          style={{ color: "#4a5c60" }}
        >
          Picking
        </h1>
        <div className="flex gap-3 flex-shrink-0">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap"
            onClick={() => {
              /* abrir config */
            }}
          >
            Configuração
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap"
            onClick={() => {
              /* abrir agendamento */
            }}
          >
            Agendamento
          </Button>
          <Button
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700 text-white whitespace-nowrap"
            asChild
          >
            <Link to="/picking/novo">
              <Plus className="size-4 mr-1" /> Novo mapeamento
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border w-full">
        {/* Cabeçalho do card com timestamp */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b bg-white/75">
          <div className="text-[15px] font-semibold">Picking</div>
          <div className="text-xs text-muted-foreground flex items-center gap-4">
            <span>
              Atualizado em:{" "}
              {new Date(dataUpdatedAt || Date.now()).toLocaleString("pt-BR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-[12px]"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`size-3 mr-1 ${isFetching ? "animate-spin" : ""}`}
              />{" "}
              Atualizar
            </Button>
          </div>
        </div>
        {/* Top control bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b bg-white/60 overflow-x-auto">
          <Button
            size="sm"
            variant="secondary"
            className="h-9 px-4 text-[13px] font-semibold tracking-wide"
            disabled={selectedIds.size === 0}
            onClick={() =>
              showToast({
                kind: "info",
                message: `Reabastecer ${selectedIds.size} selecionados (placeholder)`,
              })
            }
          >
            Reabastecer selecionados
          </Button>

          {/* Chips de filtro opcionais */}
          <div className="text-[11px] flex items-center gap-2">
            {filterStatus !== "ALL" && (
              <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 bg-white leading-none">
                <span className="font-medium" style={{ color: "#555" }}>
                  Filtrando por:
                </span>
                <span>
                  Situação igual a:{" "}
                  <span className="text-[#0c9abe] font-semibold">
                    {filterStatus === "ATIVO" ? "Ativo" : "Inativo"}
                  </span>
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground text-xs leading-none"
                  aria-label="Limpar filtro de status"
                  onClick={() => setFilterStatus("ALL")}
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {/* Barra de agrupamento visual */}
          <div className="text-xs text-muted-foreground hidden md:block">
            Arraste a coluna até aqui para agrupar
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
            {showExportButtons && (
              <div className="flex items-center gap-2">
                {canXLS && (
                  <button
                    className="text-[#0c9abe] hover:opacity-80 transition text-sm inline-flex items-center gap-1 flex-shrink-0"
                    onClick={handleExportXLS}
                    aria-label="Exportar XLS"
                    title="Exportar XLS"
                  >
                    <FileSpreadsheet className="size-4" />
                  </button>
                )}
                {canPDF && (
                  <button
                    className="text-[#0c9abe] hover:opacity-80 transition text-sm inline-flex items-center gap-1 flex-shrink-0"
                    onClick={handleExportPDF}
                    aria-label="Exportar PDF"
                    title="Exportar PDF"
                  >
                    <FileText className="size-4" />
                  </button>
                )}
              </div>
            )}
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
            <button
              className="text-[#0c9abe] hover:opacity-80 flex-shrink-0"
              title="Tela cheia"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal de Pesquisa Avançada */}
        <Dialog.Root open={openAdvanced} onOpenChange={setOpenAdvanced}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[720px] max-w-[95vw] rounded-md bg-white shadow-xl border">
              <div className="px-6 py-5 border-b">
                <Dialog.Title className="text-2xl font-semibold">
                  Pesquisa Avançada
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Defina critérios adicionais de filtragem para a lista de
                  mapeamentos de picking.
                </Dialog.Description>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Produto</label>
                  <Input
                    placeholder="Nome do produto"
                    value={advProduct}
                    onChange={(e) => setAdvProduct(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">SKU</label>
                  <Input
                    placeholder="Descrição do SKU"
                    value={advSku}
                    onChange={(e) => setAdvSku(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Depósito</label>
                  <Input
                    placeholder="Nome ou código"
                    value={advDeposit}
                    onChange={(e) => setAdvDeposit(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Endereço</label>
                  <Input
                    placeholder="Endereço"
                    value={advAddress}
                    onChange={(e) => setAdvAddress(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Status</label>
                  <div className="flex items-center gap-3 text-xs">
                    {(["ATIVO", "INATIVO"] as const).map((s) => (
                      <label key={s} className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="pick-status"
                          checked={filterStatus === s}
                          onChange={() => setFilterStatus(s)}
                        />{" "}
                        {s}
                      </label>
                    ))}
                    <button
                      className="text-xs text-gray-500 hover:underline"
                      onClick={() => setFilterStatus("ALL")}
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => setOpenAdvanced(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-[#0c9abe] hover:bg-[#0a86a1] text-white"
                  onClick={() => setOpenAdvanced(false)}
                >
                  Aplicar filtros
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Modal Gerenciador de colunas */}
        <Dialog.Root open={openColumns} onOpenChange={setOpenColumns}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[720px] max-w-[95vw] max-h-[80vh] overflow-auto rounded-md bg-white shadow-xl border">
              <div className="px-6 py-5 border-b">
                <Dialog.Title className="text-2xl font-semibold">
                  Gerenciador de colunas
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Selecione as colunas que deseja exibir na tabela de picking.
                </Dialog.Description>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[15px]">
                {[
                  { key: "id", label: "ID" },
                  { key: "deposit", label: "Depósito" },
                  { key: "address", label: "Endereço" },
                  { key: "product", label: "Produto" },
                  { key: "sku", label: "SKU" },
                  { key: "stockType", label: "Tipo de estoque" },
                  { key: "saldoAtual", label: "Saldo atual" },
                  { key: "reorderPoint", label: "Ponto de reabastec." },
                  { key: "maxQuantity", label: "Quantidade máxima" },
                  { key: "status", label: "Situação" },
                  { key: "createdAt", label: "Criado em" },
                  { key: "updatedAt", label: "Atualizado em" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="inline-flex items-center gap-3 select-none"
                  >
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#0c9abe]"
                      checked={!!draftVisibleCols[key]}
                      onChange={() =>
                        setDraftVisibleCols((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50">
                <Button variant="outline" onClick={() => setOpenColumns(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-[#0c9abe] hover:bg-[#0a86a1] text-white"
                  onClick={() => {
                    setVisibleCols(draftVisibleCols);
                    setOpenColumns(false);
                  }}
                >
                  Aplicar
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Tabela */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando mapeamentos...
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="text-amber-600 font-medium mb-2">
              Backend não configurado
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Os endpoints de picking ainda não responderam.
            </p>
            <Button asChild>
              <Link to="/picking/novo">
                <Plus className="size-4" /> Criar novo mapeamento
              </Link>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">Nenhum mapeamento</div>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando seu primeiro mapeamento de picking.
            </p>
            <Button asChild>
              <Link to="/picking/novo">
                <Plus className="size-4" /> Criar primeiro mapeamento
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b bg-white">
                    {/* seleção */}
                    <th className="w-10 border-r sticky left-0 z-20 bg-white">
                      <input
                        type="checkbox"
                        aria-label="Selecionar página"
                        checked={allPageSelected}
                        onChange={toggleSelectAllPage}
                      />
                    </th>
                    {/* ícones por linha */}
                    <th className="w-14 border-r sticky left-10 z-20 bg-white" />
                    {visibleCols.id && (
                      <DataTableHeader
                        title="ID"
                        width={220}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, id: false }))
                        }
                      />
                    )}
                    {visibleCols.deposit && (
                      <DataTableHeader
                        title="Depósito"
                        width={180}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, deposit: false }))
                        }
                      />
                    )}
                    {visibleCols.address && (
                      <DataTableHeader
                        title="Endereço"
                        width={220}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, address: false }))
                        }
                      />
                    )}
                    {visibleCols.product && (
                      <DataTableHeader
                        title="Produto"
                        width={240}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, product: false }))
                        }
                      />
                    )}
                    {visibleCols.sku && (
                      <DataTableHeader
                        title="SKU"
                        width={160}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, sku: false }))
                        }
                      />
                    )}
                    {visibleCols.stockType && (
                      <DataTableHeader
                        title="Tipo de estoque"
                        width={140}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, stockType: false }))
                        }
                      />
                    )}
                    {visibleCols.saldoAtual && (
                      <DataTableHeader
                        title="Saldo atual"
                        width={140}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, saldoAtual: false }))
                        }
                      />
                    )}
                    {visibleCols.reorderPoint && (
                      <DataTableHeader
                        title="Ponto de reabastec."
                        width={170}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, reorderPoint: false }))
                        }
                      />
                    )}
                    {visibleCols.maxQuantity && (
                      <DataTableHeader
                        title="Quantidade máxima"
                        width={170}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, maxQuantity: false }))
                        }
                      />
                    )}
                    {visibleCols.status && (
                      <DataTableHeader
                        title="Situação"
                        width={120}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, status: false }))
                        }
                      />
                    )}
                    {visibleCols.createdAt && (
                      <DataTableHeader
                        title="Criado"
                        width={140}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, createdAt: false }))
                        }
                      />
                    )}
                    {visibleCols.updatedAt && (
                      <DataTableHeader
                        title="Atualizado"
                        width={160}
                        onHide={() =>
                          setVisibleCols((p) => ({ ...p, updatedAt: false }))
                        }
                      />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((it) => (
                    <tr
                      key={it.id}
                      className="border-t hover:bg-muted/30 cursor-pointer transition-colors divide-x divide-gray-200"
                    >
                      {/* seleção */}
                      <td className="p-2 sticky left-0 bg-white">
                        <input
                          type="checkbox"
                          aria-label="Selecionar linha"
                          checked={selectedIds.has(it.id)}
                          onChange={() => toggleSelectOne(it.id)}
                        />
                      </td>
                      {/* ícones */}
                      <td className="p-2 sticky left-10 bg-white">
                        <div className="flex items-center gap-2">
                          <button
                            title="Adicionar"
                            className="text-[#0c9abe] hover:opacity-80"
                          >
                            <Plus className="size-4" />
                          </button>
                          <button
                            title="Reabastecer"
                            className="text-[#0c9abe] hover:opacity-80"
                          >
                            <ShoppingCart className="size-4" />
                          </button>
                        </div>
                      </td>
                      {visibleCols.id && (
                        <td className="p-3 whitespace-nowrap font-mono text-xs">
                          {it.id}
                        </td>
                      )}
                      {visibleCols.deposit && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {it.deposit?.nome ?? it.depositId}
                        </td>
                      )}
                      {visibleCols.address && (
                        <td className="p-3 text-sm">
                          <div
                            className="truncate"
                            title={it.address?.enderecoCompleto}
                          >
                            {it.address?.enderecoAbreviado ?? "-"}
                          </div>
                        </td>
                      )}
                      {visibleCols.product && (
                        <td className="p-3 text-sm">
                          <div
                            className="truncate"
                            title={it.product?.name ?? ""}
                          >
                            {it.product?.name ?? "-"}
                          </div>
                        </td>
                      )}
                      {visibleCols.sku && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {it.sku?.description ?? "-"}
                        </td>
                      )}
                      {visibleCols.stockType && (
                        <td className="p-3 text-sm whitespace-nowrap">EXP</td>
                      )}
                      {visibleCols.saldoAtual && (
                        <td className="p-3 text-sm text-right font-mono">
                          {(it.saldoAtual ?? 0).toLocaleString("pt-BR")}
                        </td>
                      )}
                      {visibleCols.reorderPoint && (
                        <td className="p-3 text-sm text-right">
                          <input
                            type="number"
                            className="w-20 h-8 border rounded px-2 text-right"
                            defaultValue={it.reorderPoint}
                            onBlur={async (e) => {
                              const value = Number(e.target.value);
                              if (
                                !Number.isNaN(value) &&
                                value !== it.reorderPoint
                              ) {
                                await updateMapping({
                                  id: it.id,
                                  data: { reorderPoint: value },
                                });
                              }
                            }}
                          />
                        </td>
                      )}
                      {visibleCols.maxQuantity && (
                        <td className="p-3 text-sm text-right">
                          <input
                            type="number"
                            className="w-20 h-8 border rounded px-2 text-right"
                            defaultValue={it.maxQuantity}
                            onBlur={async (e) => {
                              const value = Number(e.target.value);
                              if (
                                !Number.isNaN(value) &&
                                value !== it.maxQuantity
                              ) {
                                await updateMapping({
                                  id: it.id,
                                  data: { maxQuantity: value },
                                });
                              }
                            }}
                          />
                        </td>
                      )}
                      {visibleCols.status && (
                        <td className="p-3 text-sm">
                          <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
                            {it.status}
                          </span>
                        </td>
                      )}
                      {visibleCols.createdAt && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {it.createdAt
                            ? new Date(it.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                      )}
                      {visibleCols.updatedAt && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {it.updatedAt
                            ? new Date(it.updatedAt).toLocaleDateString()
                            : "-"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer com paginação */}
            <div className="border-t p-3 bg-white">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-medium">
                  {startResult} - {endResult} DE {filtered.length} RESULTADOS
                </span>
                <div className="flex items-center gap-4">
                  {currentPage < totalPages && (
                    <Button
                      variant="link"
                      className="text-cyan-600 hover:text-cyan-700 h-auto p-0 font-medium"
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Carregar mais{" "}
                      {Math.min(pageSize, filtered.length - endResult)}{" "}
                      resultados
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
                    <span className="uppercase font-medium">
                      RESULTADOS POR VEZ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Pequena legenda (placeholder) */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-600"
        >
          EXEMPLO
        </Badge>
        <span>Legenda de status futura</span>
      </div>
    </div>
  );
}

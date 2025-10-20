import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
// dropdowns já encapsulados nos componentes reutilizáveis
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search as SearchIcon,
  SlidersHorizontal,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { useProducts } from "@/lib/hooks/use-products";
import { DataTableHeader } from "@/components/ui/data-table-header";
import { RowActionsCell } from "@/components/ui/row-actions-cell";
import {
  exportToXLSX,
  exportToPDF,
  canExport,
  type ExportColumn,
} from "@/lib/export";
import { useToast } from "@/components/ui/toast-context";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { show: showToast } = useToast();
  const {
    data: products,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useProducts();

  // Busca e filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Pesquisa avançada
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [advName, setAdvName] = useState("");
  const [advSku, setAdvSku] = useState("");
  const [advUnit, setAdvUnit] = useState("");
  const [advUom, setAdvUom] = useState("");

  // Paginacao
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtros opcionais (se backend tiver campos)
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ATIVO" | "INATIVO">(
    "ALL"
  );
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Colunas visíveis
  const defaultVisibleCols: Record<string, boolean> = {
    id: true,
    sku: true,
    name: true,
    unit: true,
    unitOfMeasure: true,
    createdAt: true,
    updatedAt: true,
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

  function getExportColumns(): ExportColumn[] {
    const cols: { key: string; header: string }[] = [];
    if (visibleCols.id) cols.push({ key: "id", header: "ID" });
    if (visibleCols.sku) cols.push({ key: "sku", header: "SKU" });
    if (visibleCols.name) cols.push({ key: "name", header: "Nome" });
    if (visibleCols.unit) cols.push({ key: "unit", header: "Unidade" });
    if (visibleCols.unitOfMeasure)
      cols.push({ key: "unitOfMeasure", header: "Unidade de medida" });
    if (visibleCols.createdAt)
      cols.push({ key: "createdAt", header: "Criado" });
    if (visibleCols.updatedAt)
      cols.push({ key: "updatedAt", header: "Atualizado" });
    return cols as ExportColumn[];
  }

  async function handleExportXLS() {
    try {
      const cols = getExportColumns();
      await exportToXLSX(
        "produtos",
        cols,
        filteredProducts as unknown as Record<string, unknown>[]
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
      await exportToPDF(
        "produtos",
        cols,
        filteredProducts as unknown as Record<string, unknown>[]
      );
      showToast({ kind: "success", message: "Exportação PDF concluída." });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Falha ao exportar para PDF";
      showToast({ kind: "error", message: msg });
    }
  }

  // Derivados
  const hasStatus = useMemo(
    () =>
      (products ?? []).some((p) =>
        Object.prototype.hasOwnProperty.call(
          p as unknown as Record<string, unknown>,
          "status"
        )
      ),
    [products]
  );
  const hasCategory = useMemo(
    () =>
      (products ?? []).some((p) => {
        const r = p as unknown as Record<string, unknown>;
        return r.category || r.categoryName || r.categoryId;
      }),
    [products]
  );

  const categoryOptions = useMemo(() => {
    if (!products) return [] as string[];
    const names = new Set<string>();
    for (const p of products) {
      const r = p as unknown as Record<string, unknown>;
      const name =
        (r.categoryName as string) ||
        ((r.category as Record<string, unknown> | undefined)?.[
          "name"
        ] as string) ||
        (r.categoryId as string);
      if (name) names.add(String(name));
    }
    return Array.from(names).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = products ?? [];
    return list.filter((p) => {
      const r = p as unknown as Record<string, unknown>;
      // filtros opcionais
      if (hasStatus && filterStatus !== "ALL") {
        if ((r["status"] as string | undefined) !== filterStatus) return false;
      }
      if (hasCategory && filterCategory) {
        const catName =
          (r["categoryName"] as string) ||
          ((r["category"] as Record<string, unknown> | undefined)?.[
            "name"
          ] as string) ||
          (r["categoryId"] as string);
        if (String(catName) !== String(filterCategory)) return false;
      }
      // pesquisa avançada
      if (advName && !p.name?.toLowerCase().includes(advName.toLowerCase()))
        return false;
      if (advSku && !p.sku?.toLowerCase().includes(advSku.toLowerCase()))
        return false;
      if (advUnit && !p.unit?.toLowerCase().includes(advUnit.toLowerCase()))
        return false;
      if (
        advUom &&
        !p.unitOfMeasure?.toLowerCase().includes(advUom.toLowerCase())
      )
        return false;

      // termo de busca simples
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          p.name?.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.unit?.toLowerCase().includes(term) ||
          p.unitOfMeasure?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [
    products,
    searchTerm,
    advName,
    advSku,
    advUnit,
    advUom,
    hasStatus,
    filterStatus,
    hasCategory,
    filterCategory,
  ]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = Math.ceil((filteredProducts.length || 0) / pageSize);
  const startResult =
    filteredProducts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endResult = Math.min(currentPage * pageSize, filteredProducts.length);

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
              <BreadcrumbLink asChild>
                <Link to="/settings">Configurador</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Produto/SKU</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1
          className="text-3xl font-semibold leading-tight"
          style={{ color: "#4a5c60" }}
        >
          Cadastro produto/SKU
        </h1>
        <div className="flex gap-3 flex-shrink-0">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap"
          >
            <Link to="/settings">Voltar</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`size-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
            />{" "}
            Atualizar
          </Button>
          <Button
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700 text-white whitespace-nowrap"
            asChild
          >
            <Link to="/settings/products/new">
              <Plus className="size-4 mr-1" /> NOVO PRODUTO
            </Link>
          </Button>
        </div>
      </div>

      {/* Card de produtos com toolbar padrão */}
      <Card className="p-0 overflow-hidden border w-full">
        {/* Top control bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b bg-white/60 overflow-x-auto">
          <Button
            asChild
            size="sm"
            className="bg-[#0082a1] hover:bg-[#006c85] text-white h-9 px-4 text-[13px] font-semibold tracking-wide"
          >
            <Link to="/settings/products/new">
              <Plus className="size-4 mr-1" /> NOVO PRODUTO
            </Link>
          </Button>

          {/* Chips de filtro opcionais */}
          <div className="text-[11px] flex items-center gap-2">
            {hasStatus && filterStatus !== "ALL" && (
              <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 bg-white leading-none">
                <span className="font-medium" style={{ color: "#555" }}>
                  Status:
                </span>
                <span className="text-[#0c9abe] font-semibold">
                  {filterStatus}
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
            {hasCategory && filterCategory && (
              <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 bg-white leading-none">
                <span className="font-medium" style={{ color: "#555" }}>
                  Categoria:
                </span>
                <span
                  className="text-[#0c9abe] font-semibold truncate max-w-[180px]"
                  title={filterCategory || undefined}
                >
                  {filterCategory}
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground text-xs leading-none"
                  aria-label="Limpar filtro de categoria"
                  onClick={() => setFilterCategory(null)}
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
            {/* Botões de exportação (ocultos por enquanto) */}
            {showExportButtons && (
              <>
                {canXLS && (
                  <button
                    className="text-[#0c9abe] hover:opacity-80 transition text-sm inline-flex items-center gap-1 flex-shrink-0"
                    onClick={handleExportXLS}
                    aria-label="Exportar XLS"
                  >
                    <span className="text-xs font-semibold">XLS</span>
                  </button>
                )}
                {canPDF && (
                  <button
                    className="text-[#0c9abe] hover:opacity-80 transition text-sm inline-flex items-center gap-1 flex-shrink-0"
                    onClick={handleExportPDF}
                    aria-label="Exportar PDF"
                  >
                    <span className="text-xs font-semibold">PDF</span>
                  </button>
                )}
              </>
            )}
            <div className="relative w-44 flex-shrink-0">
              <label htmlFor="products-search" className="sr-only">
                Pesquisar
              </label>
              <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="products-search"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 h-9 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground"
                placeholder="Pesquisar"
                autoComplete="off"
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
            <Button
              onClick={() => navigate("/settings")}
              className="bg-[#0c9abe] hover:bg-[#0a869d] text-white rounded-md px-4 h-9 text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              Voltar
            </Button>
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
                  produtos.
                </Dialog.Description>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold" htmlFor="adv-name">
                    Nome
                  </label>
                  <Input
                    id="adv-name"
                    name="name"
                    placeholder="Informe o nome"
                    value={advName}
                    onChange={(e) => setAdvName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold" htmlFor="adv-sku">
                    SKU
                  </label>
                  <Input
                    id="adv-sku"
                    name="sku"
                    placeholder="Informe o SKU"
                    value={advSku}
                    onChange={(e) => setAdvSku(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold" htmlFor="adv-unit">
                    Unidade
                  </label>
                  <Input
                    id="adv-unit"
                    name="unit"
                    placeholder="Ex: UN, CX"
                    value={advUnit}
                    onChange={(e) => setAdvUnit(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold" htmlFor="adv-uom">
                    Unidade de medida
                  </label>
                  <Input
                    id="adv-uom"
                    name="unitOfMeasure"
                    placeholder="Ex: kg, cm"
                    value={advUom}
                    onChange={(e) => setAdvUom(e.target.value)}
                  />
                </div>
                {hasStatus && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Status</label>
                    <div className="flex items-center gap-3 text-xs">
                      {(["ATIVO", "INATIVO"] as const).map((s) => (
                        <label
                          key={s}
                          className="inline-flex items-center gap-2"
                        >
                          <input
                            type="radio"
                            name="prod-status"
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
                )}
                {hasCategory && (
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-semibold"
                      htmlFor="adv-category"
                    >
                      Categoria
                    </label>
                    <div className="relative">
                      <select
                        id="adv-category"
                        name="category"
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                        value={filterCategory ?? ""}
                        onChange={(e) =>
                          setFilterCategory(e.target.value || null)
                        }
                      >
                        <option value="">— Todas —</option>
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
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
                  Selecione as colunas que deseja exibir na tabela de produtos.
                </Dialog.Description>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[15px]">
                {[
                  { key: "id", label: "ID" },
                  { key: "sku", label: "SKU" },
                  { key: "name", label: "Nome" },
                  { key: "unit", label: "Unidade" },
                  { key: "unitOfMeasure", label: "Unidade de medida" },
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
            Carregando produtos...
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="text-amber-600 font-medium mb-2">
              Backend não configurado
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Os endpoints de produtos ainda não foram implementados no backend.
            </p>
            <Button asChild>
              <Link to="/settings/products/new">
                <Plus className="size-4" /> Criar novo produto
              </Link>
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">
              Nenhum produto cadastrado
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando seu primeiro produto.
            </p>
            <Button asChild>
              <Link to="/settings/products/new">
                <Plus className="size-4" /> Criar primeiro produto
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b bg-white">
                    {/* coluna de ações fixa */}
                    <th className="w-10 border-r sticky left-0 z-20 bg-white" />
                    {visibleCols.id && (
                      <DataTableHeader
                        title="ID"
                        width={220}
                        onHide={() =>
                          setVisibleCols((prev) => ({ ...prev, id: false }))
                        }
                      />
                    )}
                    {visibleCols.sku && (
                      <DataTableHeader
                        title="SKU"
                        width={160}
                        onHide={() =>
                          setVisibleCols((prev) => ({ ...prev, sku: false }))
                        }
                      />
                    )}
                    {visibleCols.name && (
                      <DataTableHeader
                        title="Nome"
                        width={280}
                        onHide={() =>
                          setVisibleCols((prev) => ({ ...prev, name: false }))
                        }
                      />
                    )}
                    {visibleCols.unit && (
                      <DataTableHeader
                        title="Unidade"
                        width={120}
                        onHide={() =>
                          setVisibleCols((prev) => ({ ...prev, unit: false }))
                        }
                      />
                    )}
                    {visibleCols.unitOfMeasure && (
                      <DataTableHeader
                        title="Unidade de medida"
                        width={160}
                        onHide={() =>
                          setVisibleCols((prev) => ({
                            ...prev,
                            unitOfMeasure: false,
                          }))
                        }
                      />
                    )}
                    {visibleCols.createdAt && (
                      <DataTableHeader
                        title="Criado"
                        width={140}
                        onHide={() =>
                          setVisibleCols((prev) => ({
                            ...prev,
                            createdAt: false,
                          }))
                        }
                      />
                    )}
                    {visibleCols.updatedAt && (
                      <DataTableHeader
                        title="Atualizado"
                        width={160}
                        onHide={() =>
                          setVisibleCols((prev) => ({
                            ...prev,
                            updatedAt: false,
                          }))
                        }
                      />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t hover:bg-muted/30 cursor-pointer transition-colors divide-x divide-gray-200"
                      onClick={() => navigate(`/settings/products/${p.id}`)}
                    >
                      <RowActionsCell
                        onView={() => navigate(`/settings/products/${p.id}`)}
                        onEdit={() =>
                          navigate(`/settings/products/${p.id}?edit=1`)
                        }
                        ariaLabel="Ações do produto"
                      />
                      {visibleCols.id && (
                        <td className="p-3 whitespace-nowrap font-mono text-xs">
                          {p.id}
                        </td>
                      )}
                      {visibleCols.sku && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {p.sku}
                        </td>
                      )}
                      {visibleCols.name && (
                        <td className="p-3 text-sm">
                          <div className="truncate">{p.name}</div>
                        </td>
                      )}
                      {visibleCols.unit && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {p.unit ?? "-"}
                        </td>
                      )}
                      {visibleCols.unitOfMeasure && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {p.unitOfMeasure ?? "-"}
                        </td>
                      )}
                      {visibleCols.createdAt && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                      )}
                      {visibleCols.updatedAt && (
                        <td className="p-3 text-sm whitespace-nowrap">
                          {p.updatedAt
                            ? new Date(p.updatedAt).toLocaleDateString()
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
                  {startResult} - {endResult} DE {filteredProducts.length}{" "}
                  RESULTADOS
                </span>
                <div className="flex items-center gap-4">
                  {currentPage < totalPages && (
                    <Button
                      variant="link"
                      className="text-cyan-600 hover:text-cyan-700 h-auto p-0 font-medium"
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Carregar mais{" "}
                      {Math.min(pageSize, filteredProducts.length - endResult)}{" "}
                      resultados
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="page-size"
                      className="uppercase font-medium"
                    >
                      EXIBIR
                    </label>
                    <select
                      id="page-size"
                      name="pageSize"
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

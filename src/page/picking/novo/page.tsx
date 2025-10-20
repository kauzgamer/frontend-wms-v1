import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-context";
import {
  FileSpreadsheet,
  Maximize2,
  Search as SearchIcon,
  SlidersHorizontal,
} from "lucide-react";
import { DataTableHeader } from "@/components/ui/data-table-header";
import { canExport, exportToPDF, exportToXLSX } from "@/lib/export";
import { listAvailableProducts } from "@/lib/api/picking";

type AvailableProduct = { id: string; name: string | null; sku: string | null };

export default function NovoMapeamentoPickingPage() {
  const navigate = useNavigate();
  const { show: showToast } = useToast();

  // Estado de dados (carregamento incremental)
  const [items, setItems] = useState<AvailableProduct[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Controles de UI
  const [search, setSearch] = useState("");
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [advProduto, setAdvProduto] = useState("");
  const [advSku, setAdvSku] = useState("");
  const [openColumns, setOpenColumns] = useState(false);
  const defaultVisibleCols: Record<string, boolean> = {
    product: true,
    description: true,
    sku: true,
  };
  const [visibleCols, setVisibleCols] = useState(defaultVisibleCols);
  const [draftVisibleCols, setDraftVisibleCols] = useState(defaultVisibleCols);
  const [canXLS, setCanXLS] = useState(false);
  const [canPDF, setCanPDF] = useState(false);

  // Seleção
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const fetchPage = useCallback(
    async (p: number, l = limit, append = false) => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await listAvailableProducts({ search, page: p, limit: l });
        setTotal(res.meta?.total ?? res.data.length);
        if (append) setItems((prev) => [...prev, ...res.data]);
        else setItems(res.data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao carregar";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, search]
  );

  useEffect(() => {
    // primeira carga
    fetchPage(1, limit, false);
    setPage(1);
    setSelectedIds(new Set());
  }, [limit, fetchPage]);

  // Filtro client-side para avançada e busca
  const filtered = useMemo(() => {
    return items.filter((it) => {
      const t = search.trim().toLowerCase();
      const p = (it.name ?? "").toLowerCase();
      const s = (it.sku ?? "").toLowerCase();
      if (t && !(p.includes(t) || s.includes(t))) return false;
      if (advProduto && !p.includes(advProduto.toLowerCase())) return false;
      if (advSku && !s.includes(advSku.toLowerCase())) return false;
      return true;
    });
  }, [items, search, advProduto, advSku]);

  const allPageSelected = useMemo(
    () => filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id)),
    [filtered, selectedIds]
  );

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const every = filtered.every((i) => next.has(i.id));
      if (every) filtered.forEach((i) => next.delete(i.id));
      else filtered.forEach((i) => next.add(i.id));
      return next;
    });
  }
  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdicionarSelecionados() {
    if (selectedIds.size === 0) return;
    showToast({
      kind: "info",
      message: `Abrir fluxo de definição de endereços para ${selectedIds.size} produto(s) (placeholder)`,
    });
  }

  async function handleExportXLS() {
    try {
      await exportToXLSX(
        "produtos-picking",
        [
          { key: "product", header: "Produto" },
          { key: "description", header: "Descrição" },
          { key: "sku", header: "SKU" },
        ],
        filtered.map((i) => ({
          product: i.id,
          description: i.name ?? "-",
          sku: i.sku ?? "-",
        })) as unknown as Record<string, unknown>[]
      );
      showToast({ kind: "success", message: "Exportação XLSX concluída" });
    } catch (err) {
      showToast({
        kind: "error",
        message: err instanceof Error ? err.message : "Falha ao exportar",
      });
    }
  }

  async function handleExportPDF() {
    try {
      await exportToPDF(
        "produtos-picking",
        [
          { key: "product", header: "Produto" },
          { key: "description", header: "Descrição" },
          { key: "sku", header: "SKU" },
        ],
        filtered.map((i) => ({
          product: i.id,
          description: i.name ?? "-",
          sku: i.sku ?? "-",
        })) as unknown as Record<string, unknown>[]
      );
      showToast({ kind: "success", message: "Exportação PDF concluída" });
    } catch (err) {
      showToast({
        kind: "error",
        message: err instanceof Error ? err.message : "Falha ao exportar",
      });
    }
  }

  const endCount = Math.min(page * limit, total || filtered.length);
  const startCount = filtered.length > 0 ? 1 : 0; // imagem mostra "1 - 9 de 9"

  return (
    <div className="flex flex-col gap-6 p-6 pt-4 max-w-[calc(100vw-80px)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold leading-tight">
          Novo mapeamento
        </h1>
        <div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        {/* Barra superior */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
          <Button
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
            disabled={selectedIds.size === 0}
            onClick={handleAdicionarSelecionados}
          >
            + Adicionar selecionados ao picking
          </Button>
          <div className="text-xs text-muted-foreground hidden md:block">
            Arraste a coluna até aqui para agrupar
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              className="text-[#0c9abe] hover:opacity-80"
              title="Gerenciar colunas"
              onClick={() => {
                setDraftVisibleCols(visibleCols);
                setOpenColumns(true);
              }}
            >
              <SlidersHorizontal className="size-4" />
            </button>
            {(canXLS || canPDF) && (
              <button
                className="text-[#0c9abe] hover:opacity-80"
                title="Exportar"
                onClick={canXLS ? handleExportXLS : handleExportPDF}
              >
                <FileSpreadsheet className="size-4" />
              </button>
            )}
            <div className="relative w-44">
              <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 pr-3 h-9 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground"
                placeholder="Pesquisar"
              />
            </div>
            <button
              className="text-[#0c9abe] hover:underline text-sm font-medium"
              onClick={() => setOpenAdvanced(true)}
            >
              Pesquisa Avançada
            </button>
            <div className="h-6 w-px bg-border" />
            <button className="text-[#0c9abe]">
              <Maximize2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-white">
                <th className="w-10 border-r sticky left-0 z-20 bg-white">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                {visibleCols.product && (
                  <DataTableHeader title="Produto" width={180} />
                )}
                {visibleCols.description && (
                  <DataTableHeader title="Descrição" width={520} />
                )}
                {visibleCols.sku && <DataTableHeader title="SKU" width={140} />}
                <th className="w-56 text-right pr-4">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="p-4" colSpan={5}>
                    Carregando...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td className="p-4 text-amber-700" colSpan={5}>
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && filtered.length === 0 && (
                <tr>
                  <td className="p-6 text-muted-foreground" colSpan={5}>
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
              {filtered.map((it) => (
                <tr
                  key={it.id}
                  className="border-t hover:bg-muted/30 divide-x divide-gray-200"
                >
                  <td className="p-2 sticky left-0 bg-white">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(it.id)}
                      onChange={() => toggleRow(it.id)}
                    />
                  </td>
                  {visibleCols.product && (
                    <td className="p-3 whitespace-nowrap font-mono text-xs">
                      {it.id}
                    </td>
                  )}
                  {visibleCols.description && (
                    <td className="p-3 text-sm" title={it.name ?? "-"}>
                      <div className="truncate">{it.name ?? "-"}</div>
                    </td>
                  )}
                  {visibleCols.sku && (
                    <td className="p-3 text-sm whitespace-nowrap">
                      {it.sku ?? "-"}
                    </td>
                  )}
                  <td className="p-3 text-right">
                    <button
                      className="text-[#0c9abe] hover:underline text-sm font-medium"
                      onClick={() =>
                        navigate(
                          `/picking/definir-enderecos/${encodeURIComponent(
                            it.id
                          )}?name=${encodeURIComponent(
                            it.name ?? ""
                          )}&sku=${encodeURIComponent(it.sku ?? "")}`
                        )
                      }
                    >
                      Adicionar ao picking
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé */}
        <div className="border-t p-3 bg-white">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="font-medium">
              {startCount} - {endCount} DE {total || filtered.length} RESULTADOS
            </span>
            <div className="flex items-center gap-4">
              {endCount < (total || filtered.length) && (
                <Button
                  variant="link"
                  className="text-cyan-600 hover:text-cyan-700 h-auto p-0 font-medium"
                  onClick={async () => {
                    const next = page + 1;
                    await fetchPage(next, limit, true);
                    setPage(next);
                  }}
                >
                  Carregar mais{" "}
                  {Math.min(limit, (total || filtered.length) - endCount)}{" "}
                  resultados
                </Button>
              )}
              <div className="flex items-center gap-2">
                <span className="uppercase font-medium">EXIBIR</span>
                <select
                  className="border border-gray-300 rounded px-3 py-1.5 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={limit}
                  onChange={async (e) => {
                    const l = Number(e.target.value);
                    setLimit(l);
                    await fetchPage(1, l, false);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="uppercase font-medium">
                  RESULTADOS POR VEZ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pesquisa avançada */}
      <Dialog.Root open={openAdvanced} onOpenChange={setOpenAdvanced}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[720px] max-w-[95vw] rounded-md bg-white shadow-xl border">
            <div className="px-6 py-5 border-b">
              <Dialog.Title className="text-2xl font-semibold">
                Pesquisa Avançada
              </Dialog.Title>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Produto</label>
                <Input
                  placeholder="Código/nome do produto"
                  value={advProduto}
                  onChange={(e) => setAdvProduto(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">SKU</label>
                <Input
                  placeholder="SKU"
                  value={advSku}
                  onChange={(e) => setAdvSku(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50">
              <Button variant="outline" onClick={() => setOpenAdvanced(false)}>
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

      {/* Gerenciador de colunas */}
      <Dialog.Root open={openColumns} onOpenChange={setOpenColumns}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[640px] max-w-[95vw] rounded-md bg-white shadow-xl border">
            <div className="px-6 py-5 border-b">
              <Dialog.Title className="text-2xl font-semibold">
                Gerenciador de colunas
              </Dialog.Title>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
              {[
                { key: "product", label: "Produto" },
                { key: "description", label: "Descrição" },
                { key: "sku", label: "SKU" },
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
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  HomeIcon,
  Plus,
  Filter,
  Search,
  FileSpreadsheet,
  Maximize2,
} from "lucide-react";
import { useDeposits } from "@/lib/hooks/use-organization";

export function DepositoPage() {
  const navigate = useNavigate();
  const { data: depositos, isLoading, isError } = useDeposits();
  const [openId, setOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [creating, setCreating] = useState(false);
  // const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (openId && !menuRef.current.contains(e.target as Node))
        setOpenId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openId]);

  // Criação desativada temporariamente

  function startCreate() {
    if (!creating) {
      setCreating(true);
    }
  }

  // criação via API será implementada futuramente

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">
                  <HomeIcon size={16} aria-hidden="true" />
                  <span className="sr-only">Home</span>
                </Link>
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
              <BreadcrumbPage>Depósito</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1
        className="text-3xl font-semibold leading-tight"
        style={{ color: "#4a5c60" }}
      >
        Depósito
      </h1>

      <Card className="p-0 overflow-hidden border">
        {/* Top control bar */}
        <div className="flex items-center gap-4 px-5 py-3 border-b bg-white/60">
          <Button
            size="sm"
            className="bg-[#0082a1] hover:bg-[#006c85] text-white h-9 px-4 text-[13px] font-semibold tracking-wide"
            onClick={startCreate}
            disabled
          >
            <Plus className="size-4 mr-1" /> NOVO DEPÓSITO
          </Button>
          <div className="text-[11px] flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white leading-none">
              <span className="font-medium" style={{ color: "#555" }}>
                Situação igual a:
              </span>{" "}
              <span className="text-[#0c9abe] font-semibold">Ativo</span>
              <button className="text-muted-foreground hover:text-foreground text-xs leading-none">
                ×
              </button>
            </span>
            <span className="text-muted-foreground hidden lg:inline text-xs">
              Arraste a coluna até aqui para agrupar
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button
              className="text-[#0c9abe] hover:opacity-80 transition text-sm inline-flex items-center gap-1"
              title="Filtros"
            >
              <Filter className="size-4" />
            </button>
            <button
              className="text-[#0c9abe] hover:opacity-80 transition text-sm inline-flex items-center gap-1"
              title="Exportar XLS"
            >
              <FileSpreadsheet className="size-4" />{" "}
              <span className="hidden sm:inline">XLS</span>
            </button>
            <div className="relative w-56">
              <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className="pl-7 pr-3 h-9 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground"
                placeholder="Pesquisar"
              />
            </div>
            <button className="text-[#0c9abe] hover:underline text-sm font-medium">
              Pesquisa Avançada
            </button>
            <div className="h-6 w-px bg-border" />
            <button
              className="text-[#0c9abe] hover:opacity-80"
              title="Tela cheia"
            >
              <Maximize2 className="size-4" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#0c9abe] hover:bg-[#0a869d] text-white rounded-md px-4 h-9 text-sm font-medium"
            >
              Voltar
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-white">
                <th className="w-10 border-r" />
                <th
                  className="text-left font-semibold px-6 py-2 border-r"
                  style={{ color: "#0c9abe" }}
                >
                  Descrição
                </th>
                <th
                  className="text-left font-semibold px-6 py-2 w-48"
                  style={{ color: "#0c9abe" }}
                >
                  Situação
                </th>
              </tr>
            </thead>
            <tbody>
              {(depositos ?? []).map((item, idx) => {
                const isOpen = openId === item.id;
                const striped = idx % 2 === 1;
                return (
                  <tr
                    key={item.id}
                    className={`border-b last:border-b-0 relative ${
                      striped ? "bg-[#f8f8f8]" : "bg-white"
                    } hover:bg-[#eef7fa]`}
                  >
                    <td className="px-2 text-center align-middle relative border-r">
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : item.id)}
                        className="px-2.5 py-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#0c9abe] text-[#0c9abe] hover:bg-[#e3f5f9] font-bold text-lg leading-none"
                        style={{ letterSpacing: "2px" }}
                      >
                        ...
                      </button>
                      {isOpen && (
                        <div
                          ref={menuRef}
                          role="menu"
                          className="absolute z-20 left-8 top-1/2 -translate-y-1/2 w-40 rounded-md border bg-white shadow-md animate-in fade-in slide-in-from-left-1 text-left"
                        >
                          <button
                            role="menuitem"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70"
                            onClick={() => setOpenId(null)}
                          >
                            Detalhes
                          </button>
                          <button
                            role="menuitem"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70"
                            onClick={() => setOpenId(null)}
                          >
                            Editar
                          </button>
                          <button
                            role="menuitem"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70 text-red-600"
                            onClick={() => setOpenId(null)}
                          >
                            Inativar
                          </button>
                        </div>
                      )}
                    </td>
                    <td
                      className="px-6 py-2 font-semibold text-[12.5px] tracking-wide border-r"
                      style={{ color: "#4a5c60" }}
                    >
                      <span className="inline-flex items-center gap-2">
                        {item.nome}
                        {item.principal && (
                          <span className="text-[10px] font-semibold rounded-full bg-[#555] text-white px-2 py-[3px] leading-none">
                            PRINCIPAL
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex justify-end">
                        <span
                          className="inline-flex items-center rounded-sm bg-[#009c80] text-white text-[11px] font-semibold px-4 h-7 leading-none justify-center min-w-32 tracking-wide"
                          style={{ letterSpacing: "0.5px" }}
                        >
                          ATIVO
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Bottom controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 justify-between px-6 py-5 text-[11px] text-[#444] bg-white">
          <span className="tracking-wide">
            {isLoading
              ? "Carregando..."
              : isError
              ? "Erro ao carregar"
              : `1 - ${depositos?.length ?? 0} DE ${
                  depositos?.length ?? 0
                } RESULTADOS`}
          </span>
          <button className="bg-[#bfc5c8] hover:bg-[#aeb4b7] text-[#263238] text-[13px] font-medium rounded px-6 h-10 shadow-sm">
            Carregar mais 10 resultados
          </button>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[10px]">EXIBIR</span>
            <div className="relative">
              <select className="appearance-none border rounded px-2 h-9 pr-6 bg-white text-[12px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#0c9abe] text-[10px]">
                ▼
              </span>
            </div>
            <span className="font-medium text-[10px]">RESULTADOS POR VEZ</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DepositoPage;

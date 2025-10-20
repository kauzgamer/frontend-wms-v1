import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAddressGroups } from "@/lib/hooks/use-address-groups";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search as SearchIcon, RefreshCw, Maximize2 } from "lucide-react";

export default function AddressGroupsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data, isLoading, isFetching, refetch } = useAddressGroups({ q, page: 1, limit: 50 });
  const items = useMemo(() => data ?? [], [data]);

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
              <BreadcrumbPage>Grupo de Endereço</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: "#4a5c60" }}>
          Cadastro Grupo de Endereço
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
            <RefreshCw className={`size-4 mr-1 ${isFetching ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white whitespace-nowrap" asChild>
            <Link to="/settings/grupo-endereco/new">
              <Plus className="size-4 mr-1" /> NOVO GRUPO
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border w-full">
        {/* Top control bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b bg-white/60 overflow-x-auto">
          <Button
            asChild
            size="sm"
            className="bg-[#0082a1] hover:bg-[#006c85] text-white h-9 px-4 text-[13px] font-semibold tracking-wide"
          >
            <Link to="/settings/grupo-endereco/new">
              <Plus className="size-4 mr-1" /> NOVO GRUPO
            </Link>
          </Button>

          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <div className="relative w-44 flex-shrink-0">
              <label htmlFor="addr-groups-search" className="sr-only">
                Pesquisar
              </label>
              <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="addr-groups-search"
                name="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-7 pr-3 h-9 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground"
                placeholder="Pesquisar"
                autoComplete="off"
              />
            </div>
            <div className="h-6 w-px bg-border flex-shrink-0" />
            <button className="text-[#0c9abe] hover:opacity-80 flex-shrink-0" title="Tela cheia">
              <Maximize2 className="size-4" />
            </button>
            <Button onClick={() => navigate("/settings")} className="bg-[#0c9abe] hover:bg-[#0a869d] text-white rounded-md px-4 h-9 text-sm font-medium whitespace-nowrap flex-shrink-0">
              Voltar
            </Button>
          </div>
        </div>

        {/* Tabela */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando grupos...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">Nenhum grupo cadastrado</div>
            <p className="text-sm text-muted-foreground mb-4">Comece criando seu primeiro grupo.</p>
            <Button asChild>
              <Link to="/settings/grupo-endereco/new">
                <Plus className="size-4" /> Criar primeiro grupo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Depósito</TableHead>
                  <TableHead>Estrutura Física</TableHead>
                  <TableHead className="text-right">Qtde Endereços</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((g) => (
                  <TableRow
                    key={g.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/settings/grupo-endereco/${g.id}`)}
                  >
                    <TableCell>
                      <span className="text-sm font-medium text-[#0c9abe] hover:underline">
                        {g.name}
                      </span>
                    </TableCell>
                    <TableCell>{g.deposit?.nome ?? "-"}</TableCell>
                    <TableCell>{g.physicalStructure?.titulo ?? g.physicalStructureSlug}</TableCell>
                    <TableCell className="text-right">{g._count?.addresses ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

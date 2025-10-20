import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateAddressGroup } from "@/lib/hooks/use-address-groups";
import { createAddressGroupSchema } from "@/lib/validation/address-groups";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast-context";
import { useDeposits } from "@/lib/hooks/use-organization";
import { usePhysicalStructures, usePhysicalStructure } from "@/lib/hooks/use-physical-structures";
import type { CoordConfig } from "@/lib/types/physical-structures";

export default function NewAddressGroupPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { mutateAsync, isPending } = useCreateAddressGroup();
  const { data: depositos, isLoading: depLoading } = useDeposits();
  const { data: estruturas, isLoading: estLoading } = usePhysicalStructures();

  const [form, setForm] = useState({
    name: "",
    depositId: "",
    physicalStructureSlug: "",
    streetPrefix: "Rua",
    streetFrom: "A",
    streetTo: "Z",
    columnFrom: 1,
    columnTo: 10,
    levelFrom: 0,
    levelTo: 3,
    palletFrom: 1,
    palletTo: 2,
    funcao: "Armazenagem",
    acessivelAMao: false,
  });

  // Detalhe da estrutura física selecionada (coords dinâmicas)
  const { data: estruturaSelecionada } = usePhysicalStructure(form.physicalStructureSlug);

  // Labels e visibilidade dinâmicos conforme estrutura
  const coords = estruturaSelecionada?.coords;
  const coordR = coords?.["R"];
  const coordC = coords?.["C"];
  const coordN = coords?.["N"];
  const coordP = coords?.["P"];

  const labelR = useMemo(
    () => coordR ? (coordR.nomeCustom || coordR.nomePadrao) : "Rua",
    [coordR]
  );
  const labelC = useMemo(
    () => coordC ? (coordC.nomeCustom || coordC.nomePadrao) : "Coluna",
    [coordC]
  );
  const labelN = useMemo(
    () => coordN ? (coordN.nomeCustom || coordN.nomePadrao) : "Nível",
    [coordN]
  );
  const labelP = useMemo(
    () => coordP ? (coordP.nomeCustom || coordP.nomePadrao) : "Palete",
    [coordP]
  );

  // Quando a estrutura muda, ajustar defaults de campos não ativos para valores neutros
  useEffect(() => {
    setForm((prev) => {
      const next = { ...prev };
      // Ajustar prefixo para o nome da rua (se houver R)
      if (coordR?.ativo) {
        next.streetPrefix = labelR || prev.streetPrefix || "Rua";
        // manter valores existentes do usuário
      } else {
        // Se não houver eixo Rua ativo, colapsar intervalo para único valor
        next.streetPrefix = labelR || "Rua";
        next.streetFrom = "1";
        next.streetTo = "1";
      }
      // Coluna
      if (!coordC?.ativo) {
        next.columnFrom = 1;
        next.columnTo = 1;
      }
      // Nível
      if (!coordN?.ativo) {
        next.levelFrom = 0;
        next.levelTo = 0;
      }
      // Palete
      if (!coordP?.ativo) {
        next.palletFrom = 1;
        next.palletTo = 1;
      }
      return next;
    });
  }, [form.physicalStructureSlug, coordR?.ativo, coordC?.ativo, coordN?.ativo, coordP?.ativo, labelR]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = createAddressGroupSchema.safeParse(form);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        toast.show({ kind: "error", message: issue.message }),
      );
      return;
    }
    try {
      await mutateAsync(parsed.data);
      toast.show({ kind: "success", message: "Grupo criado com sucesso" });
      navigate("/settings/grupo-endereco");
    } catch (err: unknown) {
      toast.show({
        kind: "error",
        message: err instanceof Error ? err.message : "Erro ao salvar",
      });
    }
  }

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
              <BreadcrumbLink asChild>
                <Link to="/settings/grupo-endereco">Cadastro Grupo de Endereço</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Novo Grupo de Endereços</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: "#4a5c60" }}>
            Novo Grupo de Endereços
          </h1>
          <div className="flex gap-2">
            <Link
              to="/settings/grupo-endereco"
              className="h-10 px-6 inline-flex items-center justify-center rounded border text-sm font-medium hover:bg-muted/40"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="h-10 px-6 inline-flex items-center justify-center rounded bg-[#008bb1] text-white text-sm font-medium hover:bg-[#007697] disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        <section>
          <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">DADOS PRINCIPAIS</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-[#334b52]">Nome do grupo</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Informe o nome do grupo"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Depósito</label>
              <select
                value={form.depositId}
                onChange={(e) => setForm({ ...form, depositId: e.target.value })}
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              >
                <option value="">{depLoading ? "Carregando..." : "Selecione o depósito"}</option>
                {depositos?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Estrutura Física</label>
              <select
                value={form.physicalStructureSlug}
                onChange={(e) => setForm({ ...form, physicalStructureSlug: e.target.value })}
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              >
                <option value="">{estLoading ? "Carregando..." : "Selecione a estrutura"}</option>
                {estruturas
                  ?.filter((s) => s.situacao === "ATIVO")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.titulo}
                    </option>
                  ))}
              </select>
              {estruturaSelecionada && (
                (() => {
                  const all = (Object.values(estruturaSelecionada.coords || {}) as CoordConfig[]);
                  const ativos = all.filter((c) => c?.ativo);
                  const labels = ativos.map((c) => c.nomeCustom || c.nomePadrao);
                  return (
                    <span className="text-[11px] text-muted-foreground mt-1">
                      Eixos ativos: {labels.length > 0 ? labels.join(', ') : '—'}
                    </span>
                  );
                })()
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">CONFIGURAÇÃO DE RUAS E FAIXAS</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {coordR?.ativo && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">Prefixo de {labelR}</label>
                  <input
                    value={form.streetPrefix}
                    onChange={(e) => setForm({ ...form, streetPrefix: e.target.value })}
                    placeholder={`Ex: ${labelR}`}
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">{labelR} (De)</label>
                  <input
                    value={form.streetFrom}
                    onChange={(e) => setForm({ ...form, streetFrom: e.target.value })}
                    placeholder="Ex: A"
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">{labelR} (Até)</label>
                  <input
                    value={form.streetTo}
                    onChange={(e) => setForm({ ...form, streetTo: e.target.value })}
                    placeholder="Ex: Z"
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
              </>
            )}

            {coordC?.ativo && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">{labelC} (De)</label>
                  <input
                    type="number"
                    value={form.columnFrom}
                    onChange={(e) => setForm({ ...form, columnFrom: Number(e.target.value) })}
                    placeholder="Ex: 1"
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">{labelC} (Até)</label>
                  <input
                    type="number"
                    value={form.columnTo}
                    onChange={(e) => setForm({ ...form, columnTo: Number(e.target.value) })}
                    placeholder="Ex: 10"
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
              </>
            )}

            {coordN?.ativo && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">{labelN} (De)</label>
                  <input
                    type="number"
                    value={form.levelFrom}
                    onChange={(e) => setForm({ ...form, levelFrom: Number(e.target.value) })}
                    placeholder="Ex: 0"
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">{labelN} (Até)</label>
                  <input
                    type="number"
                    value={form.levelTo}
                    onChange={(e) => setForm({ ...form, levelTo: Number(e.target.value) })}
                    placeholder="Ex: 3"
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
              </>
            )}

            {coordP?.ativo && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">{labelP} (De)</label>
                  <input
                    type="number"
                    value={form.palletFrom}
                    onChange={(e) => setForm({ ...form, palletFrom: Number(e.target.value) })}
                    placeholder="Ex: 1"
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#334b52]">{labelP} (Até)</label>
                  <input
                    type="number"
                    value={form.palletTo}
                    onChange={(e) => setForm({ ...form, palletTo: Number(e.target.value) })}
                    placeholder="Ex: 2"
                    className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                  />
                </div>
              </>
            )}
          </div>
          {!coordR?.ativo && !coordC?.ativo && !coordN?.ativo && !coordP?.ativo && (
            <p className="text-sm text-muted-foreground">Selecione uma estrutura física para configurar os eixos.</p>
          )}
        </section>

        {/* feedback de erro básico via toast já está implementado */}
      </form>
    </div>
  );
}

import { useState } from "react";
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

export default function NewAddressGroupPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { mutateAsync, isPending } = useCreateAddressGroup();

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
              <label className="text-sm font-medium text-[#334b52]">Depósito (ID)</label>
              <input
                value={form.depositId}
                onChange={(e) => setForm({ ...form, depositId: e.target.value })}
                placeholder="UUID do depósito"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Estrutura Física (slug)</label>
              <input
                value={form.physicalStructureSlug}
                onChange={(e) => setForm({ ...form, physicalStructureSlug: e.target.value })}
                placeholder="Ex: rua-a-bays"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold tracking-wide text-[#008bb1] mb-4">CONFIGURAÇÃO DE RUAS E FAIXAS</h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Prefixo da rua</label>
              <input
                value={form.streetPrefix}
                onChange={(e) => setForm({ ...form, streetPrefix: e.target.value })}
                placeholder="Ex: Rua, Corredor"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Rua (De)</label>
              <input
                value={form.streetFrom}
                onChange={(e) => setForm({ ...form, streetFrom: e.target.value })}
                placeholder="Ex: A"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Rua (Até)</label>
              <input
                value={form.streetTo}
                onChange={(e) => setForm({ ...form, streetTo: e.target.value })}
                placeholder="Ex: Z"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Coluna (De)</label>
              <input
                type="number"
                value={form.columnFrom}
                onChange={(e) => setForm({ ...form, columnFrom: Number(e.target.value) })}
                placeholder="Ex: 1"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Coluna (Até)</label>
              <input
                type="number"
                value={form.columnTo}
                onChange={(e) => setForm({ ...form, columnTo: Number(e.target.value) })}
                placeholder="Ex: 10"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Nível (De)</label>
              <input
                type="number"
                value={form.levelFrom}
                onChange={(e) => setForm({ ...form, levelFrom: Number(e.target.value) })}
                placeholder="Ex: 0"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Nível (Até)</label>
              <input
                type="number"
                value={form.levelTo}
                onChange={(e) => setForm({ ...form, levelTo: Number(e.target.value) })}
                placeholder="Ex: 3"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Palete (De)</label>
              <input
                type="number"
                value={form.palletFrom}
                onChange={(e) => setForm({ ...form, palletFrom: Number(e.target.value) })}
                placeholder="Ex: 1"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#334b52]">Palete (Até)</label>
              <input
                type="number"
                value={form.palletTo}
                onChange={(e) => setForm({ ...form, palletTo: Number(e.target.value) })}
                placeholder="Ex: 2"
                className="h-10 rounded border px-3 text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
              />
            </div>
          </div>
        </section>

        {/* feedback de erro básico via toast já está implementado */}
      </form>
    </div>
  );
}

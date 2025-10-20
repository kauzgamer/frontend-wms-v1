import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddressGroup,
  useDeleteAddressGroup,
  useGenerateAddressesFromGroup,
  usePreviewAddressGroup,
  useUpdateAddressGroup,
} from "@/lib/hooks/use-address-groups";
import { updateAddressGroupSchema } from "@/lib/validation/address-groups";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";

export default function AddressGroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: group } = useAddressGroup(id);
  const { mutateAsync: doUpdate, isPending: saving } = useUpdateAddressGroup();
  const { mutateAsync: doDelete, isPending: removing } = useDeleteAddressGroup();
  const { mutateAsync: doPreview, isPending: previewing } = usePreviewAddressGroup();
  const { mutateAsync: doGenerate, isPending: generating } = useGenerateAddressesFromGroup();

  const [limit, setLimit] = useState(50);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    const form = {
      name: group.name,
      streetPrefix: group.streetPrefix ?? "Rua",
      streetFrom: group.streetFrom,
      streetTo: group.streetTo,
      columnFrom: group.columnFrom,
      columnTo: group.columnTo,
      levelFrom: group.levelFrom,
      levelTo: group.levelTo,
      palletFrom: group.palletFrom,
      palletTo: group.palletTo,
      funcao: group.funcao,
      acessivelAMao: group.acessivelAMao,
    };
    const parsed = updateAddressGroupSchema.safeParse(form);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        toast.show({ kind: "error", message: issue.message }),
      );
      return;
    }
    try {
      await doUpdate({ id: group.id, data: parsed.data });
      toast.show({ kind: "success", message: "Atualizado" });
    } catch (err: unknown) {
      toast.show({ kind: "error", message: err instanceof Error ? err.message : "Erro ao salvar" });
    }
  }

  async function handlePreview() {
    if (!group) return;
    try {
      const res = await doPreview({ id: group.id, data: { limit } });
      console.table(res.exemplos);
      toast.show({ kind: "success", message: `Previstos: ${res.totalPrevisto}` });
    } catch (err: unknown) {
      toast.show({ kind: "error", message: err instanceof Error ? err.message : "Erro no preview" });
    }
  }

  async function handleGenerate() {
    if (!group) return;
    try {
      const res = await doGenerate(group.id);
      toast.show({ kind: "success", message: `Gerados: ${res.criados}/${res.totalPrevisto}` });
    } catch (err: unknown) {
      toast.show({ kind: "error", message: err instanceof Error ? err.message : "Erro ao gerar" });
    }
  }

  async function handleDelete() {
    if (!group) return;
    if (!confirm("Excluir este grupo?")) return;
    try {
      await doDelete(group.id);
      toast.show({ kind: "success", message: "Excluído" });
      navigate("/settings/grupo-endereco");
    } catch (err: unknown) {
      toast.show({ kind: "error", message: err instanceof Error ? err.message : "Erro ao excluir" });
    }
  }

  if (!id) return null;
  if (!group) return <div className="p-4">Carregando...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Grupo: {group.name}</h1>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={removing}>
            Excluir
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input value={group.name} readOnly />
        <Input value={group.deposit?.nome ?? group.depositId} readOnly />
        <Input value={group.physicalStructure?.titulo ?? group.physicalStructureSlug} readOnly />
        <Input defaultValue={group.streetPrefix ?? "Rua"} readOnly />
        <Input defaultValue={group.streetFrom} readOnly />
        <Input defaultValue={group.streetTo} readOnly />
        <Input type="number" defaultValue={group.columnFrom} readOnly />
        <Input type="number" defaultValue={group.columnTo} readOnly />
        <Input type="number" defaultValue={group.levelFrom} readOnly />
        <Input type="number" defaultValue={group.levelTo} readOnly />
        <Input type="number" defaultValue={group.palletFrom} readOnly />
        <Input type="number" defaultValue={group.palletTo} readOnly />

        <div className="col-span-full flex items-center gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="max-w-[150px]"
          />
          <Button onClick={handlePreview} disabled={previewing}>
            {previewing ? "Gerando exemplo..." : "Preview"}
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Gerando..." : "Gerar Endereços"}
          </Button>
        </div>
        {/* Espaço para exibir resultados de preview futuramente */}
      </div>
    </div>
  );
}

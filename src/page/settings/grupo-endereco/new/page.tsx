import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateAddressGroup } from "@/lib/hooks/use-address-groups";
import { createAddressGroupSchema } from "@/lib/validation/address-groups";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Novo Grupo de Endereços</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nome"
        />
        <Input
          value={form.depositId}
          onChange={(e) => setForm({ ...form, depositId: e.target.value })}
          placeholder="Depósito (ID)"
        />
        <Input
          value={form.physicalStructureSlug}
          onChange={(e) =>
            setForm({ ...form, physicalStructureSlug: e.target.value })
          }
          placeholder="Estrutura Física (slug)"
        />
        <Input
          value={form.streetPrefix}
          onChange={(e) => setForm({ ...form, streetPrefix: e.target.value })}
          placeholder="Prefixo da Rua"
        />
        <Input
          value={form.streetFrom}
          onChange={(e) => setForm({ ...form, streetFrom: e.target.value })}
          placeholder="Rua (De)"
        />
        <Input
          value={form.streetTo}
          onChange={(e) => setForm({ ...form, streetTo: e.target.value })}
          placeholder="Rua (Até)"
        />
        <Input
          type="number"
          value={form.columnFrom}
          onChange={(e) =>
            setForm({ ...form, columnFrom: Number(e.target.value) })
          }
          placeholder="Coluna (De)"
        />
        <Input
          type="number"
          value={form.columnTo}
          onChange={(e) => setForm({ ...form, columnTo: Number(e.target.value) })}
          placeholder="Coluna (Até)"
        />
        <Input
          type="number"
          value={form.levelFrom}
          onChange={(e) => setForm({ ...form, levelFrom: Number(e.target.value) })}
          placeholder="Nível (De)"
        />
        <Input
          type="number"
          value={form.levelTo}
          onChange={(e) => setForm({ ...form, levelTo: Number(e.target.value) })}
          placeholder="Nível (Até)"
        />
        <Input
          type="number"
          value={form.palletFrom}
          onChange={(e) =>
            setForm({ ...form, palletFrom: Number(e.target.value) })
          }
          placeholder="Palete (De)"
        />
        <Input
          type="number"
          value={form.palletTo}
          onChange={(e) => setForm({ ...form, palletTo: Number(e.target.value) })}
          placeholder="Palete (Até)"
        />

        <div className="col-span-full flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/settings/grupo-endereco")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

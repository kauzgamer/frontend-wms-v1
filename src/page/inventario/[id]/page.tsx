import { useParams, Link } from "react-router-dom";
import {
  useInventory,
  useApplyInventoryAdjustments,
} from "@/lib/hooks/use-inventory";
import { Button } from "@/components/ui/button";

export default function InventarioDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useInventory(id);
  const applyAdj = useApplyInventoryAdjustments();

  if (isLoading) return <div className="p-6">Carregando…</div>;
  if (error)
    return <div className="p-6 text-red-600">Erro ao carregar inventário.</div>;
  if (!data) return <div className="p-6">Inventário não encontrado.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" style={{ color: "#4a5c60" }}>
          Inventário {data.identificador}
        </h1>
        <div className="flex gap-2 text-sm">
          <Button variant="outline" asChild>
            <Link to="/inventario">Voltar</Link>
          </Button>
          {id ? (
            <Button
              onClick={async () => {
                try {
                  const res = await applyAdj.mutateAsync(id);
                  alert(
                    `Ajuste aplicado: ${res.adjusted} ajustados, ${res.skipped} ignorados.`
                  );
                } catch {
                  alert("Falha ao aplicar ajustes");
                }
              }}
              disabled={applyAdj.isPending}
            >
              {applyAdj.isPending
                ? "Aplicando..."
                : "Aplicar ajustes no estoque"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Info label="Descrição" value={data.descricao || "-"} />
        <Info label="Status" value={data.status} />
        <Info label="Progresso" value={`${data.progresso}%`} />
        <Info
          label="Criado em"
          value={new Date(data.criadoEm).toLocaleString()}
        />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded p-4 bg-white">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm mt-1">{value}</div>
    </div>
  );
}
